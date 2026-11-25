import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../../db";
import { pagesSessions } from "../../db/schema";
import { getChatGPTUser } from "../chatgpt-auth";
import { digestKey, pagesOrigin, validKey } from "../game/pages-host";

export const apiHeaders = {
  "Cache-Control": "private, no-store",
  "Access-Control-Allow-Origin": pagesOrigin,
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Game-Round",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Referrer-Policy": "no-referrer",
};

export function preflight() {
  return new Response(null, { status: 204, headers: apiHeaders });
}

export async function tablePlayer(req: Request) {
  const fromPages = req.headers.get("origin") === pagesOrigin;
  const bearer = req.headers.get("authorization");
  if (!fromPages && !bearer) return getChatGPTUser();
  const token = bearer?.match(/^Bearer (.+)$/)?.[1];
  if (!fromPages || !validKey(token)) return null;
  return (
    (await getDb()
      .select({ userId: pagesSessions.owner })
      .from(pagesSessions)
      .where(
        and(
          eq(pagesSessions.hash, await digestKey(token)),
          isNull(pagesSessions.challenge),
          gt(pagesSessions.expires, Date.now()),
        ),
      )
      .get()) ?? null
  );
}
