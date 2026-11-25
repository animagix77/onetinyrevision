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
  HandPlatter,
} from "lucide-react";
import Scene from "./scene";
import Kitchen from "./kitchen";
import {
  brief,
  review,
  plateSchema,
  type Entry,
  type Plate,
  type Note,
  type Serving,
} from "./rules";
const key = "judge-dean-one-tiny-revision-practice-v1";
const empty: Plate = [];
type Draft = { plate: Plate; servings: Serving[]; version: number };
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
function ClientCard({ plate, serving }: { plate: Plate; serving?: Serving }) {
  const checks = review(plate).checks;
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
          “Two thin slices. Two sides. Gravy on the side. I’d like the skin to
          stay <em>crisp.</em>”
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
      {serving && (
        <div className="note-card" id="client-verdict">
          <span className="eyebrow">
            MARGO’S VERDICT · {serving.verdict.score}/3
          </span>
          <p>“{serving.verdict.note}”</p>
        </div>
      )}
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
    [comment, setComment] = useState("");
  const lock = useRef(false),
    generation = useRef(0),
    latest = useRef(0);
  const plate = draft.plate,
    served = draft.servings.length,
    locked = served === 2 || (served === 1 && !revising);
  const inspect = entries.find((x) => x.id === selected),
    snapshot = inspect && history >= 0 ? inspect.servings[history] : undefined;
  async function refresh(hydrate = false) {
    const stamp = ++generation.current;
    const data = await dataUrl<{
      signedIn: boolean;
      entries: Entry[];
      notes: Note[];
    }>("/api/table");
    if (stamp !== generation.current) return;
    if (user && !data.signedIn)
      throw Error(
        "Your session has expired. Sign in again to load your plate.",
      );
    setEntries(data.entries);
    setNotes(data.notes);
    const me: Entry | undefined = data.entries.find((e: Entry) => e.mine);
    if (
      user &&
      me &&
      (hydrate || (!lock.current && me.version > latest.current))
    ) {
      latest.current = me.version;
      setDraft({ plate: me.draft, servings: me.servings, version: me.version });
    }
    setReady(true);
  }
  useEffect(() => {
    if (!user) {
      setDraft(loadPractice());
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
  async function change(next: Plate, serve = false) {
    if (lock.current || !ready || locked) return false;
    lock.current = true;
    setWorking(true);
    setError("");
    generation.current++;
    try {
      let result: Draft;
      if (user) {
        const r = await dataUrl<{ servings: Serving[]; version: number }>(
          "/api/table",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: serve ? "serve" : "save",
              plate: next,
              version: draft.version,
            }),
          },
        );
        result = { plate: next, servings: r.servings, version: r.version };
      } else {
        result = {
          plate: next,
          servings: serve
            ? [
                ...draft.servings,
                { plate: next, verdict: review(next), at: Date.now() },
              ]
            : draft.servings,
          version: draft.version + 1,
        };
        sessionStorage.setItem(key, JSON.stringify(result));
      }
      latest.current = result.version;
      setDraft(result);
      if (serve) setRevising(false);
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
          <div className="account">
            {user ? (
              <span>
                <ChefHat size={16} />
                {user}
              </span>
            ) : (
              sign
            )}
          </div>
        </div>
      </header>
      <main>
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
                ? "The pitch ran into your team’s Thanksgiving potluck. Margo sent the deck back six times. Now she’s holding out a plate. You get one revision."
                : inspect
                  ? "Pull up a chair and review this plate."
                  : "Your team’s plates, client verdicts, and kitchen notes."}
            </p>
          </div>
        </div>
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
        {tab === "kitchen" ? (
          <Kitchen
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
            user={user}
          />
        ) : inspect ? (
          <div className="layout">
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
              <Scene
                roast={false}
                label={snapshot ? "SERVED PLATE" : "CURRENT PLATE"}
                plate={snapshot?.plate || inspect.draft}
                pin={(snapshot || inspect.servings.at(-1))?.verdict.pin}
              />
              <div className="toolbar">
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
              serving={snapshot || inspect.servings.at(-1)}
            />
          </div>
        ) : (
          <section className="gallery">
            {!user ? (
              <div className="empty">
                <UsersRound />
                <h2>Take a seat at the table.</h2>
                <p>
                  Sign in to share your plate and see what your teammates are
                  serving.
                </p>
                {sign}
              </div>
            ) : !entries.length ? (
              <div className="empty">
                <HandPlatter />
                <h2>{ready ? "The table is set." : "Setting the table…"}</h2>
                <p>
                  Your team’s first plates will appear here as soon as carving
                  begins.
                </p>
                <button className="primary" onClick={() => setTab("kitchen")}>
                  Go to kitchen
                </button>
              </div>
            ) : (
              entries.map((e) => (
                <button
                  className="gallery-card"
                  key={e.id}
                  onClick={() => {
                    setSelected(e.id);
                    setHistory(-1);
                    setComment("");
                  }}
                >
                  <div className="plate-thumb" aria-hidden="true">
                    <div>
                      {e.draft.map((f, i) => (
                        <i
                          key={i}
                          className={"food-dot " + f.kind}
                          style={{
                            left: 50 + f.x * 20 + "%",
                            top: 50 + f.z * 20 + "%",
                            transform:
                              "translate(-50%,-50%) scale(" + f.size + ")",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>
                      {e.chef}
                      {e.mine ? " (you)" : ""}
                    </strong>
                    <p>
                      {e.draft.length} items ·{" "}
                      {
                        ["In the kitchen", "First serving", "Final plate"][
                          e.servings.length
                        ]
                      }
                    </p>
                  </div>
                  <span>{e.servings.at(-1)?.verdict.score ?? "–"}/3</span>
                </button>
              ))
            )}
          </section>
        )}
      </main>
      <footer>
        <span>Judge Dean LLC</span>
        <span>One Tiny Revision</span>
      </footer>
    </>
  );
}
