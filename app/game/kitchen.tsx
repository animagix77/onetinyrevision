"use client";
import { useRef, useState } from "react";
import {
  ConciergeBell,
  Minus,
  Plus,
  RotateCcw,
  UsersRound,
} from "lucide-react";
import Scene from "./scene";
import {
  kinds,
  staysPut,
  keepsCommittedPortions,
  placementRule,
  names,
  meat,
  side,
  drinkKinds,
  drinkNames,
  maxDrinks,
  type Kind,
  type Plate,
  type Serving,
  type Drink,
} from "./rules";
type Spot = { x: number; z: number };
type Props = {
  plate: Plate;
  drinks: Drink[];
  servings: Serving[];
  ready: boolean;
  busy: boolean;
  revising: boolean;
  change: (p: Plate, serve?: boolean, drinks?: Drink[]) => Promise<boolean>;
  revise: () => void;
  table: () => void;
};
const defaultQty = {
  thin: 2,
  thick: 1,
  drumstick: 1,
  mash: 1,
  beans: 1,
  cranberry: 1,
  gravy: 1,
};
function defaultSpot(p: Plate, k: Kind): Spot {
  if (k === "gravy") return { x: 1.54, z: 0.02 };
  if (meat(k))
    return {
      x: -0.76,
      z: -0.35 + 0.17 * (p.filter((f) => meat(f.kind)).length % 5),
    };
  const n = p.filter((f) => side(f.kind)).length;
  return { x: 0.5 + (Math.floor(n / 2) % 2) * 0.27, z: n % 2 ? 0.76 : -0.69 };
}
function batch(kind: Kind, count: number, at: Spot): Plate {
  return Array.from({ length: count }, (_, i) => {
    const fan = kind === "thin" && count === 2;
    const x = at.x + (i ? (fan ? 0.34 : Math.cos(i * 2.3) * 0.23) : 0),
      z = at.z + (i ? (fan ? 0.65 : Math.sin(i * 2.3) * 0.34) : 0),
      k = Math.min(1, 2.29 / Math.hypot(x, z));
    return { kind, x: x * k, z: z * k, size: 1 };
  });
}
export default function Kitchen({
  plate,
  drinks,
  servings,
  ready,
  busy,
  revising,
  change,
  revise,
  table,
}: Props) {
  const [qty, setQty] = useState(defaultQty),
    [message, setMessage] = useState("");
  const [ghost, setGhost] = useState<{
      kind: Kind;
      x: number;
      y: number;
    } | null>(null),
    [undo, setUndo] = useState<{ before: Plate; after: Plate } | null>(null);
  const pickPoint = useRef<
    ((x: number, y: number, surface?: boolean) => Spot | null) | null
  >(null);
  const gesture = useRef<{
      id: number;
      x: number;
      y: number;
      dragged: boolean;
    } | null>(null),
    suppress = useRef(false);
  const verdict = servings.at(-1)?.verdict,
    closed = Boolean(servings.length && !revising),
    disabled = busy || !ready || closed;
  async function save(next: Plate, notice: string) {
    if (await change(next)) {
      setUndo(
        keepsCommittedPortions(next, plate)
          ? { before: plate, after: next }
          : null,
      );
      setMessage(notice);
    }
  }
  function add(k: Kind, point?: Spot, n = qty[k]) {
    if (disabled) return;
    if (plate.length + n > 20) {
      setMessage(
        "The plate holds 20 portions. Remove one or lower the quantity.",
      );
      return;
    }
    void save(
      [...plate, ...batch(k, n, point ?? defaultSpot(plate, k))],
      n + " × " + names[k] + " added.",
    );
  }
  function movePortion(index: number, x: number, z: number) {
    const item = plate[index];
    if (disabled || !item || staysPut(item.kind)) return;
    void save(
      plate.map((f, i) => (i === index ? { ...f, x, z } : f)),
      names[item.kind] + " moved.",
    );
  }
  function addSideGravy() {
    const n = qty.gravy;
    if (disabled) return;
    if (n + plate.length > 20) {
      setMessage(
        "The plate holds 20 portions. Lower the quantity or remove a movable food.",
      );
      return;
    }
    void save(
      [
        ...plate,
        ...Array.from({ length: n }, () => ({
          kind: "gravy" as const,
          x: 0,
          z: 0,
          size: 1,
          inBoat: true as const,
        })),
      ],
      "Gravy served in the boat beside the plate.",
    );
  }
  function count(k: Kind, delta: number) {
    setQty((q) => ({ ...q, [k]: Math.max(1, Math.min(5, q[k] + delta)) }));
  }
  return (
    <section className="quick-game">
      <div className="order-strip">
        <img src="./margo.jpg" alt="" />
        <div>
          <strong>
            Margo Vale <small>· Your client</small>
          </strong>
          <p>
            “Two thin slices. One scoop each of two different sides. Gravy on
            the side. How much clearer can I make this?”
          </p>
        </div>
      </div>
      <div className="service-board pantry">
        <div className="plating-surface">
          <Scene
            plate={plate}
            roast={false}
            dropTarget={pickPoint}
            drinks={drinks}
            onMove={disabled ? undefined : movePortion}
            pin={closed ? verdict?.pin : null}
          />
        </div>
        <div className="order-controls">
          <h2>
            {closed
              ? "Margo’s verdict · Round " + servings.length
              : revising
                ? "Revision " + servings.length
                : "Make your plate."}
          </h2>
          {closed ? (
            <>
              <blockquote id="client-verdict">“{verdict?.note}”</blockquote>
              <p>{verdict?.score}/3 requests met</p>
              {servings.length > 0 && (
                <button className="secondary" onClick={revise}>
                  <RotateCcw size={16} />
                  Revise my plate
                </button>
              )}
              <button className="primary" onClick={table}>
                <UsersRound />
                Banquet table
              </button>
            </>
          ) : (
            <>
              {revising && <p className="revision-quote">“{verdict?.note}”</p>}
              <p className="kitchen-tip">
                Drag food onto the plate, then drag it to rearrange.{" "}
                {placementRule}
              </p>
              <button
                className="side-gravy"
                disabled={disabled || plate.length >= 20}
                onClick={addSideGravy}
              >
                <img src="./food/gravy.png" alt="" />
                Gravy on the side
              </button>
              <small>
                {plate.some((f) => f.inBoat)
                  ? plate.filter((f) => f.inBoat).length + " in the gravy boat"
                  : "Served in a separate gravy boat."}
              </small>
              <details className="edit-order" open={revising || undefined}>
                <summary>
                  {plate.length
                    ? plate.length + " portions · Edit plate"
                    : "Empty plate"}
                </summary>
                {kinds
                  .filter((k) => plate.some((f) => f.kind === k))
                  .map((k) => (
                    <div className="portion-edit" key={k}>
                      <span>{names[k]}</span>
                      {staysPut(k) ? (
                        <small className="fixed-label">Stays put</small>
                      ) : (
                        <button
                          disabled={disabled}
                          aria-label={"Remove one " + names[k]}
                          onClick={() => {
                            const i = plate.map((f) => f.kind).lastIndexOf(k);
                            void save(
                              plate.filter((_, j) => i !== j),
                              "Portion removed.",
                            );
                          }}
                        >
                          −
                        </button>
                      )}
                      <b>{plate.filter((f) => f.kind === k).length}</b>
                      <button
                        disabled={disabled || plate.length === 20}
                        aria-label={"Add one " + names[k]}
                        onClick={() => add(k, undefined, 1)}
                      >
                        +
                      </button>
                    </div>
                  ))}
              </details>
              <fieldset className="drinks-picker" disabled={disabled}>
                <legend>
                  Drinks{" "}
                  <small>
                    {drinks.length}/{maxDrinks} glasses
                  </small>
                </legend>
                <div className="drink-options">
                  {drinkKinds.map((kind) => {
                    const count = drinks.filter((d) => d === kind).length;
                    return (
                      <div className="drink-option" key={kind}>
                        <button
                          type="button"
                          aria-label={"Add " + drinkNames[kind]}
                          disabled={drinks.length >= maxDrinks}
                          onClick={() =>
                            void change(plate, false, [...drinks, kind])
                          }
                        >
                          <Plus size={13} aria-hidden="true" />
                          {drinkNames[kind]}
                        </button>
                        {count > 0 && (
                          <>
                            <output aria-label={drinkNames[kind] + " count"}>
                              {count}
                            </output>
                            <button
                              type="button"
                              aria-label={"Remove one " + drinkNames[kind]}
                              onClick={() =>
                                void change(
                                  plate,
                                  false,
                                  drinks.filter(
                                    (_, i) => i !== drinks.lastIndexOf(kind),
                                  ),
                                )
                              }
                            >
                              <Minus size={13} aria-hidden="true" />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
              <button
                className="primary"
                disabled={disabled || (!plate.length && !drinks.length)}
                onClick={() => change(plate, true)}
              >
                <ConciergeBell />
                {servings.length ? "Serve revision" : "Serve to Margo"}
              </button>
            </>
          )}
        </div>
        {!closed && (
          <div className="swimlane">
            <div className="tray-title">
              <h3>Serving line</h3>
              <span>Drag to plate · Adjust quantity</span>
            </div>
            <div className="food-row">
              {kinds.map((k) => (
                <div className="food-tile" key={k}>
                  <button
                    className="food-pick"
                    disabled={disabled}
                    aria-label={"Plate " + names[k]}
                    onPointerDown={(e) => {
                      if (e.button !== 0 || !e.isPrimary) return;
                      suppress.current = false;
                      gesture.current = {
                        id: e.pointerId,
                        x: e.clientX,
                        y: e.clientY,
                        dragged: false,
                      };
                      e.currentTarget.setPointerCapture(e.pointerId);
                    }}
                    onPointerMove={(e) => {
                      const g = gesture.current;
                      if (!g || g.id !== e.pointerId) return;
                      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 6)
                        g.dragged = true;
                      if (g.dragged)
                        setGhost({ kind: k, x: e.clientX, y: e.clientY });
                    }}
                    onPointerUp={(e) => {
                      const g = gesture.current;
                      gesture.current = null;
                      setGhost(null);
                      if (!g || !g.dragged) return;
                      suppress.current = true;
                      const at = pickPoint.current?.(
                        e.clientX,
                        e.clientY,
                        staysPut(k),
                      );
                      if (at) add(k, at);
                      else setMessage("Drop the food inside the plate.");
                    }}
                    onPointerCancel={() => {
                      gesture.current = null;
                      setGhost(null);
                      suppress.current = true;
                    }}
                    onClick={(e) => {
                      if (e.detail === 0 || !suppress.current) add(k);
                      suppress.current = false;
                    }}
                  >
                    <img
                      src={"./food/" + k + ".png"}
                      alt=""
                      draggable={false}
                    />
                    <strong>{names[k]}</strong>
                    {staysPut(k) && <small>Stays put</small>}
                  </button>
                  <div className="stepper">
                    <button
                      aria-label={"Decrease " + names[k] + " quantity"}
                      disabled={disabled || qty[k] === 1}
                      onClick={() => count(k, -1)}
                    >
                      <Minus />
                    </button>
                    <output aria-label={names[k] + " quantity"}>
                      {qty[k]}
                    </output>
                    <button
                      aria-label={"Increase " + names[k] + " quantity"}
                      disabled={disabled || qty[k] === 5}
                      onClick={() => count(k, 1)}
                    >
                      <Plus />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="tray-foot">
              <span role="status">
                {busy
                  ? "Saving…"
                  : message ||
                    "Drag a solid food to move it, or tap it and then tap its new spot."}
              </span>
              {undo?.after === plate && (
                <button
                  disabled={disabled}
                  onClick={async () => {
                    if (await change(undo.before)) {
                      setUndo(null);
                      setMessage("Last edit undone.");
                    }
                  }}
                >
                  <RotateCcw size={14} />
                  Undo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {ghost && (
        <img
          className="drag-food"
          style={{ left: ghost.x, top: ghost.y }}
          src={"./food/" + ghost.kind + ".png"}
          alt=""
        />
      )}
    </section>
  );
}
