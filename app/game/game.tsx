"use client";
import { useState, useEffect, useRef } from "react";
import {
  ChefHat,
  ConciergeBell,
  UsersRound,
  Check,
  ScrollText,
  Flame,
  Send,
} from "lucide-react";
import Scene from "./scene";
import Kitchen from "./kitchen";
import Music from "./music";
import Banquet from "./banquet";
import {
  brief,
  assess,
  drinksFor,
  drinkList,
  portionList,
  type Drink,
  keepsCommittedPortions,
  placementRule,
  type Entry,
  type Plate,
  type Note,
  type Serving,
} from "./rules";
import { gameRound } from "./round";
import { guestKey } from "./guest";
const empty: Plate = [];
type Draft = {
  drinks: Drink[];
  plate: Plate;
  servings: Serving[];
  version: number;
};
const fresh: Draft = { plate: empty, servings: [], drinks: [], version: 0 };
function ClientCard({
  plate,
  checks = assess(plate).checks,
}: {
  plate: Plate;
  checks?: boolean[];
}) {
  return (
    <aside className="client-column" id="guest-check">
      <div className="ticket">
        <div className="ticket-head">
          <ScrollText size={17} /> GUEST CHECK <span>№ 001</span>
        </div>
        <div className="guest">
          <img src="./margo.jpg" alt="Margo Vale" />
          <div>
            <span className="eyebrow">TODAY’S CLIENT</span>
            <h3>Margo Vale</h3>
            <small>Client, Brand Marketing</small>
          </div>
        </div>
        <div className="quote">
          “Two thin slices. One scoop each of two different sides. Gravy on the
          side. I’d like the skin to stay <em>crisp.</em>”
        </div>
        <div className="brief">
          <span className="eyebrow">THE NON-NEGOTIABLES</span>
          {brief.map((b, i) => (
            <div key={b} className={"check " + (checks[i] ? "yes" : "")}>
              <span>{checks[i] && <Check size={13} />}</span>
              {b}
            </div>
          ))}
        </div>
        <div className="ticket-foot">
          <Flame size={15} /> Client difficulty <b>High</b>
        </div>
      </div>
    </aside>
  );
}
export default function Game({ apiOrigin = "" }: { apiOrigin?: string }) {
  async function dataUrl<R = unknown>(path: string, options?: RequestInit) {
    const headers = new Headers(options?.headers);
    if (options?.method === "POST") headers.set("x-game-round", gameRound);
    headers.set("Authorization", "Guest " + (await guestKey()));
    return fetch(apiOrigin + path, {
      cache: "no-store",
      ...options,
      credentials: "omit",
      headers,
    }).then(async (r) => {
      const j = await r.json();
      if (!r.ok)
        throw Object.assign(
          Error(
            (j as { error?: string }).error || "Could not reach the table.",
          ),
          { status: r.status },
        );
      return j as R;
    });
  }

  const [tab, setTab] = useState<"kitchen" | "table">("kitchen"),
    [draft, setDraft] = useState<Draft>(fresh),
    [entries, setEntries] = useState<Entry[]>([]),
    [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false),
    [working, setWorking] = useState(false),
    [error, setError] = useState(""),
    [revising, setRevising] = useState(false),
    [selected, setSelected] = useState(""),
    [revealed, setRevealed] = useState<Serving["verdict"]>(),
    [history, setHistory] = useState(-1),
    [comment, setComment] = useState(""),
    [chefName, setChefName] = useState(""),
    [nameInput, setNameInput] = useState("");
  const initialLoad = useRef(true);
  const lock = useRef(false),
    generation = useRef(0),
    latest = useRef(0);
  const plate = draft.plate,
    served = draft.servings.length,
    locked = served > 0 && !revising;
  const inspect = entries.find((x) => x.id === selected),
    snapshot = inspect && history >= 0 ? inspect.servings[history] : undefined;
  const latestServing = inspect?.servings.at(-1);
  const shownDrinks = drinksFor(snapshot ?? inspect);
  const shownServing =
    snapshot ??
    (latestServing &&
    inspect &&
    JSON.stringify(latestServing.plate) === JSON.stringify(inspect.draft) &&
    JSON.stringify(drinksFor(latestServing)) ===
      JSON.stringify(drinksFor(inspect))
      ? latestServing
      : undefined);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, selected, chefName]);
  async function refresh(hydrate = false) {
    const stamp = ++generation.current;
    const data = await dataUrl<{
      name?: string;
      entries: Entry[];
      notes: Note[];
    }>("/api/table");
    if (stamp !== generation.current) return;
    setChefName(data.name || "");
    setEntries(data.entries);
    setNotes(data.notes);
    const me: Entry | undefined = data.entries.find((e: Entry) => e.mine);
    if (initialLoad.current) {
      initialLoad.current = false;
      if (me?.servings.length) setTab("table");
    }
    if (me && (hydrate || (!lock.current && me.version > latest.current))) {
      latest.current = me.version;
      setDraft({
        drinks: drinksFor(me),
        plate: me.draft,
        servings: me.servings,
        version: me.version,
      });
    }
    setReady(true);
  }
  useEffect(() => {
    let active = true;
    const read = () => {
      if (active)
        refresh().catch(() => {
          if (active)
            setError(
              "The shared table could not be loaded. Retry to reconnect.",
            );
        });
    };
    read();
    const t = setInterval(read, 4000);
    return () => {
      active = false;
      clearInterval(t);
      generation.current++;
    };
  }, [apiOrigin]);
  async function join(e: React.FormEvent) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name || lock.current || !ready) return;
    lock.current = true;
    setWorking(true);
    setError("");
    generation.current++;
    try {
      await dataUrl("/api/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", name }),
      });

      generation.current++;
      setChefName(name);
      setEntries((rows) =>
        rows.map((r) => (r.mine ? { ...r, chef: name } : r)),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setWorking(false);
    }
  }
  async function change(
    next: Plate,
    serve = false,
    drinks: Drink[] = draft.drinks,
  ) {
    if (lock.current || !ready || !chefName || locked) return false;
    if (!keepsCommittedPortions(plate, next)) {
      setError(placementRule);
      return false;
    }
    lock.current = true;
    setWorking(true);
    setError("");
    generation.current++;
    try {
      const r = await dataUrl<{
        id: string;
        servings: Serving[];
        version: number;
      }>("/api/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: serve ? "serve" : "save",
          drinks,
          plate: next,
          version: draft.version,
        }),
      });
      const result: Draft = {
        drinks,
        plate: next,
        servings: r.servings,
        version: r.version,
      };
      const own: Entry = {
        id: r.id,
        mine: true,
        chef: chefName,
        draft: next,
        drinks,
        servings: r.servings,
        version: r.version,
        updated: Date.now(),
      };
      setEntries((rows) => [own, ...rows.filter((e) => !e.mine)]);
      latest.current = result.version;
      setDraft(result);
      if (serve) {
        setRevealed(result.servings.at(-1)?.verdict);
        setRevising(false);
        setSelected("");
        setTab("table");
      }
      void refresh().catch(() => {});
      return true;
    } catch (e) {
      setError((e as Error).message);
      if ((e as { status?: number }).status === 409)
        await refresh(true).catch(() => {});
      return false;
    } finally {
      lock.current = false;
      setWorking(false);
    }
  }
  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || !inspect || lock.current) return;
    lock.current = true;
    setWorking(true);
    setError("");
    try {
      await dataUrl("/api/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "note",
          id: inspect.id,
          message: comment,
        }),
      });
      setComment("");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setWorking(false);
    }
  }
  return (
    <>
      <header>
        <div className="bar">
          <a href="./" className="brand">
            <ConciergeBell />
            <span>One Tiny Revision</span>
          </a>
          <nav aria-label="Game views">
            {(["kitchen", "table"] as const).map((t, i) => (
              <button
                key={t}
                aria-current={tab === t ? "page" : undefined}
                className={tab === t ? "active" : ""}
                onClick={() => {
                  setTab(t);
                  setRevealed(undefined);
                  setError("");
                  if (t === "table") setSelected("");
                }}
              >
                {i ? <UsersRound /> : <ChefHat />}
                {i ? "Banquet table" : "Kitchen"}
              </button>
            ))}
          </nav>
          <Music />
          {chefName && (
            <div className="account">
              <span>
                <ChefHat size={16} />
                {chefName}
              </span>
            </div>
          )}
        </div>
      </header>
      <main>
        {(!chefName || tab !== "kitchen") && (
          <div className="heading">
            <div>
              <div className="edition">
                <span className="star">✳</span> THANKSGIVING SERVICE
              </div>
              <h1>
                {tab === "kitchen"
                  ? "The client stayed for dinner"
                  : inspect
                    ? inspect.chef + "’s plate"
                    : "The banquet table"}
                <b>.</b>
              </h1>
              <p>
                {tab === "kitchen"
                  ? "Margo just approved the Thanksgiving campaign. Seventeen decks. One headline. Someone called the office potluck a tasting. Now she’s at the judges’ table with a fork and a red pen. Make her a plate. She’s promised one tiny revision. She’s promised that before."
                  : inspect
                    ? shownServing
                      ? "The food has been through client review."
                      : "The chef is still plating."
                    : "Margo is tasting the whole lineup. Pick a chef’s plate for her verdict."}
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="error" role="alert">
            {error}{" "}
            <button
              onClick={() =>
                refresh(true)
                  .then(() => setError(""))
                  .catch(() => setError("Still unable to reach the table."))
              }
            >
              Retry
            </button>
          </div>
        )}
        {!chefName && tab === "kitchen" ? (
          <section className="name-start service-board">
            <Scene plate={empty} roast />
            <form className="order-controls" onSubmit={join}>
              <h2>Whose plate is it?</h2>
              <label htmlFor="chef-name">Name on your dish</label>
              <input
                id="chef-name"
                autoComplete="nickname"
                maxLength={32}
                placeholder="Your name or nickname"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <button
                className="primary"
                disabled={!ready || working || !nameInput.trim()}
              >
                Start plating
              </button>
            </form>
          </section>
        ) : tab === "kitchen" ? (
          <Kitchen
            drinks={draft.drinks}
            plate={plate}
            servings={draft.servings}
            busy={working}
            ready={ready}
            revising={revising}
            change={change}
            revise={() => setRevising(true)}
            table={() => {
              setSelected("");
              setTab("table");
            }}
          />
        ) : inspect ? (
          <div className="layout plate-detail">
            <section className="station">
              <div className="panel-title">
                <button onClick={() => setSelected("")}>All plates</button>
                <select
                  aria-label="Plate version"
                  value={history}
                  onChange={(e) => setHistory(Number(e.target.value))}
                >
                  <option value={-1}>Current plate</option>
                  {inspect.servings.map((s, i) => (
                    <option value={i} key={s.at}>
                      {i ? "Revision " + i : "First serving"}
                    </option>
                  ))}
                </select>
              </div>
              {shownServing && (
                <div className="verdict-ribbon" id="client-verdict">
                  <img src="./margo.jpg" alt="Margo" />
                  <div>
                    <strong>
                      Margo’s verdict · {shownServing.verdict.score}/3
                    </strong>
                    <blockquote>“{shownServing.verdict.note}”</blockquote>
                  </div>
                </div>
              )}
              {!shownServing && (
                <p className="awaiting-verdict">
                  In the kitchen · Margo reviews this plate when it’s served.
                </p>
              )}
              <Scene
                roast={false}
                drinks={shownDrinks}
                label={snapshot ? "SERVED PLATE" : "CURRENT PLATE"}
                plate={snapshot?.plate || inspect.draft}
                pin={shownServing?.verdict.pin}
              />
              <div className="toolbar">
                <p className="served-menu">
                  {[
                    portionList(snapshot?.plate ?? inspect.draft),
                    drinkList(shownDrinks),
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Empty plate"}
                </p>
                {inspect.mine && inspect.servings.length > 0 && (
                  <button
                    className="secondary"
                    onClick={() => {
                      setRevising(true);
                      setTab("kitchen");
                    }}
                  >
                    Revise my plate
                  </button>
                )}
                {chefName ? (
                  <>
                    <h2>Kitchen notes</h2>
                    <form onSubmit={addNote}>
                      <input
                        aria-label="Kitchen note"
                        placeholder="Leave a note for the chef…"
                        maxLength={240}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <button
                        className="primary"
                        disabled={working || !comment.trim()}
                      >
                        <Send />
                        Post
                      </button>
                    </form>
                  </>
                ) : (
                  <button
                    className="secondary"
                    onClick={() => setTab("kitchen")}
                  >
                    Add your name to leave a note
                  </button>
                )}
                {notes
                  .filter((n) => n.plate === inspect.id)
                  .map((n) => (
                    <p className="comment" key={n.id}>
                      <b>{n.chef}</b> {n.message}
                    </p>
                  ))}
              </div>
            </section>
            <ClientCard
              plate={snapshot?.plate || inspect.draft}
              checks={shownServing?.verdict.checks}
            />
          </div>
        ) : (
          <Banquet
            entries={entries}
            verdict={revealed}
            revise={() => {
              setRevising(true);
              setTab("kitchen");
            }}
            open={(e) => {
              setRevealed(undefined);
              setSelected(e.id);
              setHistory(e.servings.length - 1);
              setComment("");
            }}
          />
        )}
      </main>
      <footer>
        <span>Judge Dean LLC</span>
        <span>One Tiny Revision</span>
      </footer>
    </>
  );
}
