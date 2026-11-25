"use client";
import { useState } from "react";
import {
  UtensilsCrossed,
  HandPlatter,
  ConciergeBell,
  Check,
  RotateCcw,
  UsersRound,
  CircleCheck,
} from "lucide-react";
import Scene from "./scene";
import {
  meat,
  side,
  names,
  type Kind,
  type Plate,
  type Serving,
} from "./rules";

type Step = 0 | 1 | 2 | 3;
type Props = {
  plate: Plate;
  servings: Serving[];
  ready: boolean;
  busy: boolean;
  revising: boolean;
  change: (plate: Plate, serve?: boolean) => Promise<boolean>;
  revise: () => void;
  table: () => void;
  user: string | null;
};
const steps = ["Turkey", "Sides", "Gravy"];
const cuts = [
  ["thin", "Two thin slices"],
  ["thick", "A thick slice"],
  ["drumstick", "A drumstick"],
] as const;
const sideChoices = ["mash", "beans", "cranberry"] as const;
function nextStep(p: Plate): Step {
  if (!p.some((f) => meat(f.kind))) return 0;
  if (p.filter((f) => side(f.kind)).length < 2) return 1;
  return p.some((f) => f.kind === "gravy") ? 3 : 2;
}

export default function Kitchen({
  plate,
  servings,
  ready,
  busy,
  revising,
  change,
  revise,
  table,
  user,
}: Props) {
  const [edit, setEdit] = useState<Step | null>(null),
    [moving, setMoving] = useState<number | null>(null),
    [undo, setUndo] = useState<{
      before: Plate;
      after: Plate;
      step: Step;
    } | null>(null);
  const stage = edit ?? nextStep(plate),
    sides = plate.filter((f) => side(f.kind)),
    turkey = plate.filter((f) => meat(f.kind));
  const verdict = servings.at(-1)?.verdict,
    finished = servings.length === 2 || !!(servings.length && !revising);
  const disabled = busy || !ready;
  const resetSides = edit === 1 && sides.length >= 2;
  const secondSide = sides.length === 1 && !resetSides;
  async function choose(next: Plate) {
    if (await change(next)) {
      setUndo({ before: plate, after: next, step: stage });
      setEdit(null);
      setMoving(null);
    }
  }
  function carve(kind: "thin" | "thick" | "drumstick") {
    const portions: Plate = [{ kind, x: -0.78, z: -0.34, size: 1 }];
    if (kind === "thin") portions.push({ kind, x: -0.56, z: 0.48, size: 1 });
    return choose([...plate.filter((f) => !meat(f.kind)), ...portions]);
  }
  function scoop(kind: Kind) {
    const remaining = resetSides ? plate.filter((f) => !side(f.kind)) : plate;
    return choose([
      ...remaining,
      {
        kind,
        x: secondSide ? 0.73 : 0.69,
        z: secondSide ? 0.61 : -0.68,
        size: 1,
      },
    ]);
  }
  function pour(x: number, z: number, size = 1) {
    return choose([
      ...plate.filter((f) => f.kind !== "gravy"),
      { kind: "gravy", x, z, size },
    ]);
  }
  function tap(x: number, z: number, seconds: number) {
    if (disabled || finished) return;
    if (stage === 0) {
      void carve("thin");
      return;
    }
    if (stage === 2) {
      void pour(x, z, Math.min(1.4, 0.65 + seconds * 0.6));
      return;
    }
    if (stage === 3 && moving !== null)
      void choose(plate.map((f, i) => (i === moving ? { ...f, x, z } : f)));
  }
  function startRevision() {
    const i = verdict?.checks.findIndex((c) => !c) ?? -1;
    setEdit(i < 0 ? 3 : (i as Step));
    setUndo(null);
    revise();
  }
  const title = finished
    ? verdict?.score === 3
      ? "Margo signs off."
      : servings.length === 2
        ? "The final verdict."
        : "Margo has a note."
    : [
        "How will you carve it?",
        secondSide ? "Pick your second side." : "Pick your first side.",
        "Where’s the gravy going?",
        "Ready to serve?",
      ][stage];
  return (
    <section className="quick-game" aria-label="Carving station">
      <div className="order-strip">
        <img src="/margo.jpg" alt="" />
        <div>
          <strong>
            Margo Vale <small>· Your client</small>
          </strong>
          <p>
            “Two thin slices, two different sides, gravy on the side. I trust
            your judgment.”
          </p>
        </div>
      </div>
      <div className="service-board">
        <Scene
          plate={plate}
          roast={!finished && stage === 0}
          onPlace={
            !finished && (stage === 0 || stage === 2 || moving !== null)
              ? tap
              : undefined
          }
          pin={finished ? verdict?.pin : null}
        />
        <div className="order-controls">
          {finished ? (
            <div className="score-label">
              <CircleCheck size={17} /> {verdict?.score} of 3 requests met
            </div>
          ) : (
            <div className="course-track" aria-label="Order progress">
              {steps.map((name, i) => (
                <span
                  key={name}
                  className={stage === i ? "current" : stage > i ? "done" : ""}
                >
                  {stage > i ? <Check size={13} /> : <b>{i + 1}</b>}
                  {name}
                </span>
              ))}
            </div>
          )}
          <h2 aria-live="polite">{title}</h2>
          {finished ? (
            <>
              <blockquote id="client-verdict">“{verdict?.note}”</blockquote>
              {servings.length === 1 && (
                <button
                  className={verdict?.score === 3 ? "secondary" : "primary"}
                  onClick={startRevision}
                >
                  <RotateCcw />
                  Use my revision
                </button>
              )}
              {user ? (
                <button
                  className={
                    servings.length === 2 || verdict?.score === 3
                      ? "primary"
                      : "secondary"
                  }
                  onClick={table}
                >
                  <UsersRound size={17} />
                  See the banquet table
                </button>
              ) : (
                <a
                  className="secondary"
                  href="/signin-with-chatgpt?return_to=%2F"
                  target="_top"
                >
                  Sign in to play with the team
                </a>
              )}
            </>
          ) : (
            <>
              {stage === 0 && (
                <div className="choices">
                  {cuts.map(([kind, label]) => (
                    <button
                      key={kind}
                      disabled={disabled}
                      onClick={() => carve(kind)}
                    >
                      <UtensilsCrossed />
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {stage === 1 && (
                <>
                  <div className="choices">
                    {sideChoices.map((k) => (
                      <button
                        key={k}
                        disabled={disabled}
                        onClick={() => scoop(k)}
                      >
                        <HandPlatter />
                        {names[k]}
                      </button>
                    ))}
                  </div>
                  {secondSide && (
                    <p className="context-line">
                      Already plated: {names[sides[0].kind].toLowerCase()}.
                    </p>
                  )}
                </>
              )}
              {stage === 2 && (
                <>
                  <div className="choices">
                    <button disabled={disabled} onClick={() => pour(1.48, 0)}>
                      <ConciergeBell />
                      On the side
                    </button>
                    <button
                      disabled={disabled}
                      onClick={() => pour(turkey[0]?.x ?? 0, turkey[0]?.z ?? 0)}
                    >
                      <ConciergeBell />
                      Over the turkey
                    </button>
                  </div>
                  <p className="context-line">
                    Or tap your own spot on the plate.
                  </p>
                </>
              )}
              {stage === 3 && (
                <>
                  <p className="plate-description">
                    {plate.map((f) => names[f.kind]).join(" · ")}
                  </p>
                  <button
                    className="primary"
                    disabled={disabled}
                    onClick={() => change(plate, true)}
                  >
                    <ConciergeBell />
                    {servings.length ? "Serve revision" : "Serve to Margo"}
                  </button>
                  <details
                    className="edit-order"
                    onToggle={(e) => {
                      if (!e.currentTarget.open) setMoving(null);
                    }}
                  >
                    <summary>Adjust plate</summary>
                    <div className="minor-actions">
                      {steps.map((t, i) => (
                        <button
                          disabled={disabled}
                          key={t}
                          onClick={() => {
                            setMoving(null);
                            setEdit(i as Step);
                          }}
                        >
                          Change {t.toLowerCase()}
                        </button>
                      ))}
                    </div>
                    <label htmlFor="move-food">Move an item</label>
                    <select
                      id="move-food"
                      disabled={disabled}
                      value={moving ?? ""}
                      onChange={(e) =>
                        setMoving(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    >
                      <option value="">Choose an item…</option>
                      {plate.map((f, i) => (
                        <option key={i} value={i}>
                          {i + 1}. {names[f.kind]}
                        </option>
                      ))}
                    </select>
                    {moving !== null && (
                      <p className="context-line">
                        Tap the plate to set its new spot.
                      </p>
                    )}
                  </details>
                </>
              )}
              {stage < 3 && undo?.after === plate && (
                <button
                  className="undo"
                  disabled={disabled}
                  onClick={async () => {
                    if (await change(undo.before)) {
                      setEdit(undo.step);
                      setMoving(null);
                      setUndo(null);
                    }
                  }}
                >
                  <RotateCcw size={14} />
                  Undo last choice
                </button>
              )}
              {stage < 3 && plate.length >= 19 && (
                <button
                  className="undo"
                  disabled={disabled}
                  onClick={() => choose(plate.slice(0, -1))}
                >
                  Remove last item to make room
                </button>
              )}
              <span className="save-state" role="status">
                {!ready ? "Loading your plate…" : busy ? "Saving…" : ""}
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
