import { eq, notExists } from "drizzle-orm";
import { gameRound } from "../app/game/round";
import { getDb } from "./index";
import { chefs, gameRounds, notes, plates } from "./schema";

export async function getRoundDb() {
  const db = getDb();
  const marker = db
    .select({ id: gameRounds.id })
    .from(gameRounds)
    .where(eq(gameRounds.id, gameRound));
  if (!(await marker.get())) {
    // D1 executes the batch in one transaction. Each delete rechecks the marker
    // so a concurrent first visit cannot clear a round another request started.
    const unopened = notExists(marker);
    await db.batch([
      db.delete(notes).where(unopened),
      db.delete(plates).where(unopened),
      db.delete(chefs).where(unopened),
      db.insert(gameRounds).values({ id: gameRound }).onConflictDoNothing(),
    ]);
  }
  return db;
}
