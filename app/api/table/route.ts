import { apiHeaders, preflight, tablePlayer } from "../pages-auth";
import { pagesOrigin } from "../../game/pages-host";
import { getRoundDb } from "../../../db/active-round";
import { gameRound } from "../../game/round";
import { plates, notes, chefs } from "../../../db/schema";
import {
  plateSchema,
  keepsCommittedPortions,
  placementRule,
  drinkSchema,
  drinksSchema,
  type Drink,
  review,
  type Serving,
} from "../../game/rules";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: apiHeaders,
  });
export function OPTIONS() {
  return preflight();
}
function storedDrinks(value?: string | null): Drink[] {
  if (!value) return [];
  // Older drafts store one enum value; new drafts store the whole order as JSON.
  const single = drinkSchema.safeParse(value);
  if (single.success) return [single.data];
  return drinksSchema.parse(JSON.parse(value));
}
export async function GET(req: Request) {
  const db = await getRoundDb();
  const user = await tablePlayer(req);
  if (!user && req.headers.has("authorization"))
    return json(
      { error: "Could not identify this browser. Reload the game." },
      401,
    );
  const [rows, comments, profile] = await Promise.all([
    db.select().from(plates).orderBy(desc(plates.updated)),
    db.select().from(notes).orderBy(desc(notes.created)),
    user
      ? db.select().from(chefs).where(eq(chefs.owner, user.userId)).get()
      : undefined,
  ]);
  return json({
    signedIn: !!user,
    name: profile?.name ?? null,
    entries: rows.map(({ owner, draft, servings, drink, ...row }) => {
      const drinks = storedDrinks(drink);
      return {
        drink: drinks[0] ?? null,
        drinks,
        ...row,
        mine: owner === user?.userId,
        draft: JSON.parse(draft),
        servings: JSON.parse(servings),
      };
    }),
    notes: comments,
  });
}
const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("join"),
    name: z
      .string()
      .trim()
      .min(1)
      .max(32)
      .regex(/^[^\u0000-\u001F\u007F]+$/),
  }),
  z.object({
    action: z.literal("note"),
    id: z.string().uuid(),
    message: z.string().trim().min(1).max(240),
  }),
  z.object({
    action: z.enum(["save", "serve"]),
    version: z.number().int().nonnegative(),
    plate: plateSchema,
    drink: drinkSchema.nullable().optional(),
    drinks: drinksSchema.optional(),
  }),
]);
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin && origin !== pagesOrigin)
    return json({ error: "Use the game to update your plate." }, 403);
  const u = await tablePlayer(req);
  if (!u)
    return json(
      { error: "Open the game and enter your name to join the table." },
      401,
    );
  if (req.headers.get("x-game-round") !== gameRound)
    return json(
      { error: "A fresh tasting has started. Reload to join it." },
      409,
    );
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return json({ error: "That plate or note could not be read." }, 400);
  const b = parsed.data,
    db = await getRoundDb(),
    now = Date.now();
  if (b.action === "join") {
    await db.batch([
      db
        .insert(chefs)
        .values({ owner: u.userId, name: b.name })
        .onConflictDoUpdate({ target: chefs.owner, set: { name: b.name } }),
      db.update(plates).set({ chef: b.name }).where(eq(plates.owner, u.userId)),
    ]);
    return json({ name: b.name });
  }
  const profile = await db
    .select()
    .from(chefs)
    .where(eq(chefs.owner, u.userId))
    .get();
  if (!profile)
    return json({ error: "Enter a chef name to join this tasting." }, 409);
  const chef = profile.name;
  if (b.action === "note") {
    const plate = await db
      .select({ id: plates.id })
      .from(plates)
      .where(eq(plates.id, b.id))
      .get();
    if (!plate) return json({ error: "Plate not found." }, 404);
    await db.insert(notes).values({
      id: crypto.randomUUID(),
      plate: b.id,
      chef,
      message: b.message,
      created: now,
    });
    return json({ ok: true });
  }
  const row = await db
    .select()
    .from(plates)
    .where(eq(plates.owner, u.userId))
    .get();
  if ((row?.version ?? 0) !== b.version)
    return json(
      {
        error:
          "Your plate changed in another tab. The latest plate has been loaded.",
      },
      409,
    );
  const servings: Serving[] = row ? JSON.parse(row.servings) : [];
  if (row && !keepsCommittedPortions(JSON.parse(row.draft), b.plate))
    return json({ error: placementRule }, 422);
  const prior = storedDrinks(row?.drink);
  // A client with the old single-glass picker edits only the first glass.
  const drinks =
    b.drinks ??
    (b.drink === undefined
      ? prior
      : [...(b.drink ? [b.drink] : []), ...prior.slice(1)]);
  if (b.action === "serve") {
    if (!b.plate.length && !drinks.length)
      return json({ error: "Add food or a drink before serving." }, 400);
    servings.push({
      plate: b.plate,
      drinks,
      drink: drinks[0] ?? null,
      verdict: review(b.plate, servings, drinks),
      at: now,
    });
  }
  const data = {
    drink: JSON.stringify(drinks),
    chef,
    draft: JSON.stringify(b.plate),
    servings: JSON.stringify(servings),
    updated: now,
    version: b.version + 1,
  };
  const id = row?.id ?? crypto.randomUUID();
  const written = row
    ? await db
        .update(plates)
        .set(data)
        .where(and(eq(plates.owner, u.userId), eq(plates.version, b.version)))
        .returning({ id: plates.id })
    : await db
        .insert(plates)
        .values({ ...data, id, owner: u.userId })
        .onConflictDoNothing()
        .returning({ id: plates.id });
  return written.length
    ? json({ id, servings, version: data.version })
    : json(
        {
          error:
            "Another edit arrived first. The latest plate has been loaded.",
        },
        409,
      );
}
