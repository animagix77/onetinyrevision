import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { plates, notes, chefs } from "../../../db/schema";
import {
  plateSchema,
  keepsCommittedPortions,
  placementRule,
  drinkSchema,
  review,
  type Serving,
} from "../../game/rules";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ signedIn: false, entries: [], notes: [] });
  const db = getDb();
  const [rows, comments, profile] = await Promise.all([
    db.select().from(plates).orderBy(desc(plates.updated)),
    db.select().from(notes).orderBy(desc(notes.created)),
    db.select().from(chefs).where(eq(chefs.owner, user.userId)).get(),
  ]);
  return json({
    signedIn: true,
    name: profile?.name ?? null,
    entries: rows.map(({ owner, draft, servings, ...row }) => ({
      ...row,
      mine: owner === user.userId,
      draft: JSON.parse(draft),
      servings: JSON.parse(servings),
    })),
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
  }),
]);
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return json({ error: "Use the game to update your plate." }, 403);
  const u = await getChatGPTUser();
  if (!u) return json({ error: "Sign in to join the table." }, 401);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return json({ error: "That plate or note could not be read." }, 400);
  const b = parsed.data,
    db = getDb(),
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
  const chef = profile?.name || u.fullName || u.email.split("@")[0];
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
  if (servings.length >= 2)
    return json({ error: "This plate has its final verdict." }, 409);
  if (row && !keepsCommittedPortions(JSON.parse(row.draft), b.plate))
    return json({ error: placementRule }, 422);
  const drink =
    b.drink === undefined
      ? (drinkSchema.safeParse(row?.drink).data ?? null)
      : b.drink;
  if (b.action === "serve") {
    if (!b.plate.length)
      return json({ error: "Add something to the plate first." }, 400);
    servings.push({
      plate: b.plate,
      drink,
      verdict: review(b.plate, servings.at(-1)?.verdict.note),
      at: now,
    });
  }
  const data = {
    drink,
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
