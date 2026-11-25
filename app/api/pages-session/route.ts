import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "../../../db";
import { pagesSessions } from "../../../db/schema";
import { chatGPTSignInPath, getChatGPTUser } from "../../chatgpt-auth";
import {
  digestKey,
  pagesOrigin,
  pagesUrl,
  randomKey,
  validKey,
} from "../../game/pages-host";
import { apiHeaders, preflight } from "../pages-auth";
export const dynamic = "force-dynamic";
export function OPTIONS() {
  return preflight();
}

const error = (message: string, status: number) =>
  Response.json({ error: message }, { status, headers: apiHeaders });
const redirect = (to: string) =>
  new Response(null, { status: 303, headers: { ...apiHeaders, Location: to } });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get("challenge"),
    state = url.searchParams.get("state");
  if (!validKey(challenge) || !validKey(state))
    return error("Invalid sign-in request.", 400);
  const user = await getChatGPTUser();
  if (!user) return redirect(chatGPTSignInPath(url.pathname + url.search));
  const now = Date.now(),
    code = randomKey(),
    db = getDb();
  await db.batch([
    db.delete(pagesSessions).where(lt(pagesSessions.expires, now)),
    db
      .insert(pagesSessions)
      .values({
        hash: await digestKey(code),
        owner: user.userId,
        challenge,
        expires: now + 120_000,
      }),
  ]);
  return redirect(pagesUrl + "#" + new URLSearchParams({ code, state }));
}

export async function POST(req: Request) {
  if (req.headers.get("origin") !== pagesOrigin)
    return error("Open the game to sign in.", 403);
  const body = (await req.json().catch(() => null)) as { code?: unknown; verifier?: unknown } | null;
  if (!validKey(body?.code) || !validKey(body?.verifier))
    return error("Invalid sign-in request.", 400);
  const token = randomKey(),
    now = Date.now();
  const exchanged = await getDb()
    .update(pagesSessions)
    .set({
      hash: await digestKey(token),
      challenge: null,
      expires: now + 8 * 60 * 60_000,
    })
    .where(
      and(
        eq(pagesSessions.hash, await digestKey(body.code)),
        eq(pagesSessions.challenge, await digestKey(body.verifier)),
        gt(pagesSessions.expires, now),
      ),
    )
    .returning({ expires: pagesSessions.expires });
  if (!exchanged.length)
    return error("Sign in again to join the banquet.", 401);
  return Response.json({ token }, { headers: apiHeaders });
}
