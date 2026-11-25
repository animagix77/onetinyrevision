"use client";
import { useState, useEffect, useRef } from "react";
import {
  ChefHat,
  ConciergeBell,
  UsersRound,
  Check,
  ScrollText,
  LogIn,
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
  drinkNames,
  portionList,
  type Drink,
  review,
  plateSchema,
  keepsCommittedPortions,
  placementRule,
  type Entry,
  type Plate,
  type Note,
  type Serving,
} from "./rules";
const key = "judge-dean-one-tiny-revision-practice-v1";
const empty: Plate = [];
type Draft = {
  drink?: Drink | null;
  plate: Plate;
  servings: Serving[];
  version: number;
};
const fresh: Draft = { plate: empty, servings: [], version: 0 };
function loadPractice(): Draft {
  try {
    const x = JSON.parse(sessionStorage.getItem(key) || "null");
    if (
      x &&
      plateSchema.safeParse(x.plate).success &&
      Array.isArray(x.servings) &&
      x.servings.length <= 2 &&
      x.servings.every(
        (s: Serving) =>
          plateSchema.safeParse(s.plate).success &&
          s.verdict?.checks?.length === 3,
      )
    )
      return x;
  } catch {}
  return fresh;
}
async function dataUrl<R = unknown>(path: string, options?: RequestInit) {
  return fetch(path, { cache: "no-store", ...options }).then(async (r) => {
    const j = await r.json();
    if (!r.ok)
      throw Object.assign(
        Error((j as { error?: string }).error || "Could not reach the table."),
        { status: r.status },
      );
    return j as R;
  });
}
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
          <img src="/margo.jpg" alt="Margo Vale" />
          <div>
            <span className="eyebrow">TODAY’S CLIENT</span>
            <h3>Margo Vale</h3>
            <small>Executive Creative Director</small>
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
export default function Game({ user }: { user: string | null }) {
  const [tab, setTab] = useState<"kitchen" | "table">("kitchen"),
    [draft, setDraft] = useState<Draft>(fresh),
    [entries, setEntries] = useState<Entry[]>([]),
    [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false),
    [working, setWorking] = useState(false),
    [error, setError] = useState(""),
    [revising, setRevising] = useState(false),
    [selected, setSelected] = useState(""),
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
    locked = served === 2 || (served === 1 && !revising);
  const practiceEntry: Entry = {
    id: "practice",
    chef: chefName,
    draft: plate,
    drink: draft.drink,
    servings: draft.servings,
    version: draft.version,
    updated: 0,
    mine: true,
  };
  const tableEntries = user ? entries : plate.length ? [practiceEntry] : [];
  const inspect = tableEntries.find((x) => x.id === selected),
    snapshot = inspect && history >= 0 ? inspect.servings[history] : undefined;
  const latestServing = inspect?.servings.at(-1);
  const shownServing =
    snapshot ??
    (latestServing &&
    inspect &&
    JSON.stringify(latestServing.plate) === JSON.stringify(inspect.draft) &&
    (latestServing.drink ?? null) === (inspect.drink ?? null)
      ? latestServing
      : undefined);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, selected, chefName]);
  async function refresh(hydrate = false) {
    const stamp = ++generation.current;
    const data = await dataUrl<{
      signedIn: boolean;
      name?: string;
      entries: Entry[];
      notes: Note[];
    }>("/api/table");
    if (stamp !== generation.current) return;
    if (user && !data.signedIn)
      throw Error(
        "Your session has expired. Sign in again to load your plate.",
      );
    setChefName(data.name || "");
    setEntries(data.entries);
    setNotes(data.notes);
    const me: Entry | undefined = data.entries.find((e: Entry) => e.mine);
    if (initialLoad.current) {
      initialLoad.current = false;
      if (me?.servings.length) setTab("table");
    }
    if (
      user &&
      me &&
      (hydrate || (!lock.current && me.version > latest.current))
    ) {
      latest.current = me.version;
      setDraft({
        drink: me.drink,
        plate: me.draft,
        servings: me.servings,
        version: me.version,
      });
    }
    setReady(true);
  }
  useEffect(() => {
    if (!user) {
      const practice = loadPractice();
      setDraft(practice);
      setChefName(sessionStorage.getItem(key + "-chef") || "");
      if (practice.servings.length) setTab("table");
      setReady(true);
      return;
    }
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
  }, [user]);
  async function join(e: React.FormEvent) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name || lock.current || !ready) return;
    lock.current = true;
    setWorking(true);
    setError("");
    generation.current++;
    try {
      if (user)
        await dataUrl("/api/table", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join", name }),
        });
      else sessionStorage.setItem(key + "-chef", name);
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
    drink: Drink | null = draft.drink ?? null,
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
      let result: Draft;
      if (user) {
        const r = await dataUrl<{
          id: string;
          servings: Serving[];
          version: number;
        }>("/api/table", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: serve ? "serve" : "save",
            drink,
            plate: next,
            version: draft.version,
          }),
        });
        result = {
          drink,
          plate: next,
          servings: r.servings,
          version: r.version,
        };
        const own: Entry = {
          id: r.id,
          mine: true,
          chef: chefName,
          draft: next,
          drink,
          servings: r.servings,
          version: r.version,
          updated: Date.now(),
        };
        setEntries((rows) => [own, ...rows.filter((e) => !e.mine)]);
      } else {
        result = {
          drink,
          plate: next,
          servings: serve
            ? [
                ...draft.servings,
                {
                  drink,
                  plate: next,
                  verdict: review(next, draft.servings.at(-1)?.verdict.note),
                  at: Date.now(),
                },
              ]
            : draft.servings,
          version: draft.version + 1,
        };
        sessionStorage.setItem(key, JSON.stringify(result));
      }
      latest.current = result.version;
      setDraft(result);
      if (serve) {
        setRevising(false);
        setSelected("");
        setTab("table");
      }
      if (user) void refresh().catch(() => {});
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
  const sign = (
    <a
      className="signin"
      href="/signin-with-chatgpt?return_to=%2F"
      target="_top"
    >
      <LogIn size={16} />
      Sign in
    </a>
  );
  return (
    <>
      <header>
        <div className="bar">
          <a href="/" className="brand">
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
          <div className="account">
            {user ? (
              <span>
                <ChefHat size={16} />
                {chefName || user}
              </span>
            ) : (
              sign
            )}
          </div>
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
                {!chefName || tab === "kitchen"
                  ? "The client stayed for dinner"
                  : inspect
                    ? inspect.chef + "’s plate"
                    : "The banquet table"}
                <b>.</b>
              </h1>
              <p>
                {!chefName || tab === "kitchen"
                  ? "Margo just approved the Thanksgiving campaign. Seventeen decks. One headline. Now she’s first in line at the office potluck, holding out her plate. You get one revision."
                  : inspect
                    ? "The food has been through client review."
                    : "Pick a chef’s name card to see what they served and what Margo had to say."}
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="error" role="alert">
            {error}{" "}
            {user && (
              <button
                onClick={() =>
                  refresh(true)
                    .then(() => setError(""))
                    .catch(() => setError("Still unable to reach the table."))
                }
              >
                Retry
              </button>
            )}
          </div>
        )}
        {!chefName ? (
          <section className="name-start service-board">
            <Scene plate={empty} roast />
            <form className="order-controls" onSubmit={join}>
              <h2>Whose plate is it?</h2>
              <label htmlFor="chef-name">Name on your place card</label>
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
            drink={draft.drink ?? null}
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
            user={chefName || user}
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
                      {i ? "Revision" : "First serving"}
                    </option>
                  ))}
                </select>
              </div>
              {shownServing && (
                <div className="verdict-ribbon" id="client-verdict">
                  <img src="/margo.jpg" alt="Margo" />
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
                drink={snapshot ? snapshot.drink : inspect.drink}
                label={snapshot ? "SERVED PLATE" : "CURRENT PLATE"}
                plate={snapshot?.plate || inspect.draft}
                pin={shownServing?.verdict.pin}
              />
              <div className="toolbar">
                <p className="served-menu">
                  {portionList(snapshot?.plate ?? inspect.draft) ||
                    "Empty plate"}
                  {(snapshot ? snapshot.drink : inspect.drink)
                    ? " · " +
                      drinkNames[(snapshot ? snapshot.drink : inspect.drink)!]
                    : ""}
                </p>
                {inspect.mine && inspect.servings.length === 1 && (
                  <button
                    className="secondary"
                    onClick={() => {
                      setRevising(true);
                      setTab("kitchen");
                    }}
                  >
                    Use my revision
                  </button>
                )}
                {user && (
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
              checks={snapshot?.verdict.checks}
            />
          </div>
        ) : (
          <Banquet
            entries={tableEntries}
            open={(e) => {
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
