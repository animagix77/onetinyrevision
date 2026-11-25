"use client";
import { Wine, Beer, Martini, CupSoda, Coffee } from "lucide-react";
import { drinkNames, type Drink, type Entry } from "./rules";
const glass = {
  pinot: Wine,
  ale: Beer,
  bourbon: Martini,
  cider: Coffee,
  spritz: CupSoda,
};
function Pairing({ drink }: { drink: Drink }) {
  const Icon = glass[drink];
  return (
    <span className="place-drink">
      <Icon size={14} />
      {drinkNames[drink]}
    </span>
  );
}
export default function Banquet({
  entries,
  open,
}: {
  entries: Entry[];
  open: (entry: Entry) => void;
}) {
  const sorted = [...entries].sort(
    (a, b) =>
      Number(b.mine) - Number(a.mine) ||
      a.chef.localeCompare(b.chef) ||
      a.id.localeCompare(b.id),
  );
  const seats = Math.max(8, Math.ceil(sorted.length / 4) * 4);
  return (
    <section className="banquet-hall" aria-label="Margo’s banquet table">
      <div className="head-chair">
        <img
          src="/margo.jpg"
          alt="Margo seated at the head of the banquet table"
        />
        <strong>Margo Vale</strong>
      </div>
      <div className="dining-table">
        {Array.from({ length: seats }, (_, i) => {
          const e = sorted[i];
          if (!e)
            return (
              <div className="place unset" key={"empty" + i} aria-hidden="true">
                <div className="china" />
                <i />
              </div>
            );
          const last = e.servings.at(-1),
            p = last?.plate ?? e.draft,
            drink = last ? last.drink : e.drink;
          return (
            <button
              key={e.id}
              className={"place served-place" + (e.mine ? " own-place" : "")}
              onClick={() => open(e)}
              aria-label={
                "Open " +
                e.chef +
                "’s plate" +
                (last ? " and Margo’s verdict" : " in progress")
              }
            >
              <div className="china">
                {drink && (
                  <span
                    className="beside-drink"
                    title={drinkNames[drink]}
                    aria-label={drinkNames[drink]}
                  >
                    {
                      {
                        pinot: "🍷",
                        ale: "🍺",
                        bourbon: "🥃",
                        cider: "☕",
                        spritz: "🍹",
                      }[drink]
                    }
                  </span>
                )}
                {p.some((f) => f.inBoat) && (
                  <img
                    className="beside-boat"
                    alt="Gravy on the side"
                    src="/food/gravy.png"
                  />
                )}
                {p
                  .filter((f) => !f.inBoat)
                  .map((f, j) =>
                    f.kind === "gravy" ? (
                      <i
                        key={j}
                        className="puddle"
                        style={{
                          left: 50 + f.x * 18 + "%",
                          top: 50 + f.z * 17 + "%",
                          width: "17%",
                          zIndex: 3,
                        }}
                      />
                    ) : (
                      <img
                        key={j}
                        alt=""
                        src={"/food/" + f.kind + ".png"}
                        style={{
                          left: 50 + f.x * 18 + "%",
                          top: 50 + f.z * 17 + "%",
                          width: "28%",
                          zIndex: 1,
                        }}
                      />
                    ),
                  )}
              </div>
              <span className="place-card">
                <strong>
                  {e.chef}
                  {e.mine ? " (you)" : ""}
                </strong>
                <small>{last ? "Read Margo’s note" : "In the kitchen"}</small>
              </span>
              {drink && <Pairing drink={drink} />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
