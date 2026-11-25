"use client";
import { useState, useEffect, useRef } from "react";
import {
  BellRing,
  ChefHat,
  ConciergeBell,
  UtensilsCrossed,
  UsersRound,
  Check,
  CheckCircle2,
  ScrollText,
  Plus,
  MousePointer2,
  LogIn,
  Flame,
  RotateCcw,
  Send,
  HandPlatter,
} from "lucide-react";
import Scene from "./scene";
import {
  brief,
  review,
  names,
  plateSchema,
  type Kind,
  type Entry,
  type Plate,
  type Note,
  type Serving,
} from "./rules";
const groups: Kind[][] = [
  ["thin", "thick", "drumstick"],
  ["mash", "beans", "cranberry"],
  ["gravy"],
];
const titles = ["Carve", "Sides", "Gravy"];
const icons = [UtensilsCrossed, HandPlatter, ConciergeBell];
const positions = [
  [-0.66, 0.0],
  [-0.68, 0.67],
  [0.66, -0.67],
  [0.75, 0.57],
  [0, -1.39],
  [1.47, 0.11],
  [-1.48, -0.22],
  [0.1, 1.47],
];
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
    [feedback, setFeedback] = useState(""),
    [step, setStep] = useState(0),
    [kind, setKind] = useState<Kind>("thin"),
    [board, setBoard] = useState(true),
    [revising, setRevising] = useState(false),
    [moving, setMoving] = useState<number | null>(null),
    [selected, setSelected] = useState(""),
    [history, setHistory] = useState(-1),
    [comment, setComment] = useState(""),
    [help, setHelp] = useState(false);
  const lock = useRef(false),
    generation = useRef(0),
    latest = useRef(0),
    dialog = useRef<HTMLDialogElement>(null);
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
      if (me.servings.length) setBoard(false);
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
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(""), 2600);
    return () => clearTimeout(t);
  }, [feedback]);
  useEffect(() => {
    if (help) dialog.current?.showModal();
    else dialog.current?.close();
  }, [help]);
  async function change(next: Plate, serve = false) {
    if (lock.current || !ready || locked) return;
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
      setMoving(null);
      if (serve) {
        setRevising(false);
        setBoard(false);
        setFeedback(
          result.servings.length === 2
            ? "Final plate served"
            : "Margo has left a note",
        );
      } else
        setFeedback(
          user ? "Plate saved to the banquet table" : "Practice plate saved",
        );
      if (user) await refresh();
    } catch (e) {
      setError((e as Error).message);
      if ((e as { status?: number }).status === 409)
        await refresh(true).catch(() => {});
    } finally {
      lock.current = false;
      setWorking(false);
    }
  }
  function pick(i: number) {
    setStep(i);
    setKind(groups[i][0]);
    setBoard(i === 0);
    setMoving(null);
  }
  function place(x?: number, z?: number, seconds = 0.35) {
    if (locked || working) return;
    if (moving !== null && x !== undefined && z !== undefined) {
      change(plate.map((f, i) => (i === moving ? { ...f, x, z } : f)));
      return;
    }
    if (plate.length >= 20) {
      setError("The plate is full. Remove an item to make room.");
      return;
    }
    const loc =
      positions.find(([a, b]) =>
        plate.every((f) => Math.hypot(f.x - a, f.z - b) > 0.4),
      ) || positions[plate.length % positions.length];
    const manual = x !== undefined && z !== undefined && !board;
    change([
      ...plate,
      {
        kind,
        x: manual ? x! : loc[0],
        z: manual ? z! : loc[1],
        size: kind === "gravy" ? Math.min(1.4, 0.45 + seconds * 0.8) : 1,
      },
    ]);
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
  const mainButton =
    step === 0 ? "Carve a slice" : step === 1 ? "Add a side" : "Pour gravy";
  const verdict = draft.servings.at(-1);
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
                ? "The carving room"
                : inspect
                  ? inspect.chef + "’s plate"
                  : "The banquet table"}
              <b>.</b>
            </h1>
            <p>
              {tab === "kitchen"
                ? "One demanding client. One perfect plate. One tiny revision."
                : inspect
                  ? "Pull up a chair and review this plate."
                  : "Your team’s plates, client verdicts, and kitchen notes."}
            </p>
          </div>
          <button className="how" onClick={() => setHelp(true)}>
            <span>?</span> How to play
          </button>
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
          <div className="layout">
            <section className="station">
              <div className="panel-title">
                <span>
                  <ChefHat />
                  Your workstation
                </span>
                <small>{user ? "Team service" : "Practice service"}</small>
              </div>
              <a href="#guest-check" className="mobile-brief">
                <ScrollText size={15} />
                Read Margo’s guest check
              </a>
              <Scene
                plate={plate}
                roast={board && !locked}
                onPlace={locked ? undefined : place}
                pin={!board && locked ? verdict?.verdict.pin : null}
              />
              <div className="toolbar">
                <div className="steps">
                  {titles.map((t, i) => {
                    const Icon = icons[i];
                    return (
                      <button
                        key={t}
                        className={!locked && i === step ? "chosen" : ""}
                        disabled={locked}
                        onClick={() => pick(i)}
                      >
                        <Icon size={18} />
                        {t}
                      </button>
                    );
                  })}
                </div>
                {!locked ? (
                  <>
                    <div className="action-row">
                      <div>
                        <label htmlFor="ingredient">
                          {["SELECT CUT", "SELECT SIDE", "SAUCE"][step]}
                        </label>
                        <select
                          id="ingredient"
                          value={kind}
                          onChange={(e) => setKind(e.target.value as Kind)}
                        >
                          {groups[step].map((k) => (
                            <option value={k} key={k}>
                              {names[k]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="primary"
                        onClick={() => place()}
                        disabled={!ready || working || moving !== null}
                      >
                        <Plus />
                        {kind === "drumstick" ? "Carve drumstick" : mainButton}
                      </button>
                    </div>
                    <p className="hint">
                      <MousePointer2 size={15} />
                      {moving !== null
                        ? "Tap the plate to move this item."
                        : board
                          ? "Tap the roast to carve, or use the button above."
                          : step === 2
                            ? "Hold a spot on the plate, then release to pour gravy."
                            : "Tap the plate to place your selected ingredient."}
                    </p>
                  </>
                ) : (
                  <div className="finished">
                    <CheckCircle2 />
                    <strong>
                      {served === 2
                        ? "Final plate served"
                        : "First serving reviewed"}
                    </strong>
                    {served === 1 && (
                      <button
                        className="primary"
                        onClick={() => {
                          setRevising(true);
                          setBoard(false);
                        }}
                      >
                        <RotateCcw />
                        Use my revision
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>
            <ClientCard plate={plate} serving={verdict} />
            <section className="plate-tray">
              <div className="tray-head">
                <h2>
                  <HandPlatter />
                  Your plate <small>{plate.length}</small>
                </h2>
                <button
                  className="textbtn"
                  onClick={() => {
                    setBoard(!board);
                    setMoving(null);
                  }}
                  disabled={locked}
                >
                  {board ? "View plate" : "View roast"}
                </button>
              </div>
              {plate.length ? (
                <div className="chips">
                  {plate.map((f, i) => (
                    <span
                      key={i}
                      className={"chip " + (moving === i ? "moving" : "")}
                    >
                      <button
                        disabled={locked || working}
                        title="Move this item"
                        onClick={() => {
                          setBoard(false);
                          setMoving(moving === i ? null : i);
                        }}
                      >
                        {names[f.kind]}
                      </button>
                      {!locked && (
                        <button
                          disabled={working}
                          aria-label={"Remove " + names[f.kind]}
                          onClick={() =>
                            change(plate.filter((_, j) => j !== i))
                          }
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p>Your plate is empty. Start with a cut of turkey.</p>
              )}
              <div className="serve-row">
                <span role="status">
                  {feedback ||
                    (!user
                      ? "Practice plate · Sign in to share"
                      : working
                        ? "Saving…"
                        : served === 2
                          ? "Final verdict recorded"
                          : "Shared with the table")}
                </span>
                {!locked && (
                  <button
                    className="serve"
                    disabled={!plate.length || working || !ready}
                    onClick={() => change(plate, true)}
                  >
                    <BellRing size={17} />
                    {served ? "Serve revision" : "Serve to Margo"}
                  </button>
                )}
              </div>
            </section>
          </div>
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
      <dialog
        ref={dialog}
        onCancel={() => setHelp(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setHelp(false);
        }}
      >
        <div>
          <span className="eyebrow">THANKSGIVING SERVICE</span>
          <h2>How to play</h2>
          <ol>
            <li>
              Read Margo’s guest check. Choose a cut and tap the roast to carve.
            </li>
            <li>
              Choose sides and tap the plate to place them. Hold and release to
              pour gravy. Tap an ingredient name to move it, or × to remove it.
            </li>
            <li>
              Serve the plate for a verdict. You get one revised submission.
            </li>
            <li>
              Sign in to share each edit. Visit the banquet table to inspect
              plates and leave notes.
            </li>
          </ol>
          <button className="primary" onClick={() => setHelp(false)}>
            Back to service
          </button>
        </div>
      </dialog>
    </>
  );
}
