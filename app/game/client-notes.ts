import { meat, type Plate, type Serving, type Drink } from "./rules";

// Each request names a change the chef can actually make. The next tasting
// checks the served plates, so Margo can take credit for the chef's work.
const directions = [
  {
    ask: "Make the logo bigger. The turkey is the logo. Bring a slice to the front so I know whose dinner this is.",
    yes: "Now the turkey feels like an ad for turkey. Let’s call that brand recognition.",
    no: "I still had to look for the turkey. I should be able to identify the sponsor from the parking lot.",
    changed: (p: Plate, old: Plate) =>
      p.some(
        (f) =>
          meat(f.kind) &&
          (f.z >= 0.8 ||
            f.z >
              Math.max(
                -2.3,
                ...old.filter((o) => meat(o.kind)).map((o) => o.z),
              ) +
                0.12),
      ),
  },
  {
    ask: "Can we make it pop? Put something red on there. If you ask which red, I’ll know we hired the wrong agency.",
    yes: "Yes, that red. I’ve sent a screenshot to Legal so they can discover a problem with it.",
    no: "When I said ‘pop,’ I meant cranberry. Apparently the mood board was only visible to me.",
    changed: (p: Plate) => p.some((f) => f.kind === "cranberry"),
  },
  {
    ask: "We need a younger audience. What’s the drink pairing? My nephew has a newsletter and he’ll ask.",
    yes: "The beverage gives us a second audience. Apparently they’re called ‘people who are thirsty.’",
    no: "Still no beverage. My nephew has already described the launch as dry.",
    changed: (_p: Plate, _old: Plate, drink?: Drink | null) => !!drink,
  },
  {
    ask: "Can the gravy live in its own little world? Separate boat. Same brand family. They should still speak at Christmas.",
    yes: "The gravy boat works. Procurement wants to know if we can use it again at Easter.",
    no: "I’m still seeing an integrated gravy campaign. The boat was the entire media plan.",
    changed: (p: Plate) => p.some((f) => f.inBoat),
  },
  {
    ask: "Let’s give the sides some breathing room. Move one away from the center. White space tested beautifully with my husband.",
    yes: "Love the white space. Finance would like to know why we paid for that part of the plate.",
    no: "The sides still feel like they’re sharing a hot desk.",
    changed: (p: Plate) =>
      p.some(
        (f) =>
          ["beans", "mash", "cranberry"].includes(f.kind) &&
          Math.hypot(f.x, f.z) > 1.25,
      ),
  },
  {
    ask: "I need a hero shot. Two thin slices. One is a sample, three is a carousel, and we didn’t buy a carousel.",
    yes: "Two slices reads well on mobile. I checked by holding my fork farther away.",
    no: "I’m counting turkey again, which is a strange use of my retainer.",
    changed: (p: Plate) =>
      p.filter((f) => meat(f.kind)).length === 2 &&
      p.filter((f) => meat(f.kind)).every((f) => f.kind === "thin"),
  },
  {
    ask: "I showed this to my sister. She wants green. She isn’t on the account, but somehow this is binding.",
    yes: "My sister likes the beans. She’s asking who handles your social.",
    no: "My sister circled the empty space where she pictured the beans. She used a green pen.",
    changed: (p: Plate) => p.some((f) => f.kind === "beans"),
  },
  {
    ask: "Can we own comfort? Just one scoop of mash. I want nostalgia without licensing anyone’s childhood.",
    yes: "The mash feels like home. We’ll need a release from home.",
    no: "The nostalgia brief specified one scoop. I can forward the email I forgot to send.",
    changed: (p: Plate) => p.filter((f) => f.kind === "mash").length === 1,
  },
  {
    ask: "The left side feels quiet. Give one slice a little more left. My left. We should have aligned on left.",
    yes: "The slice is on the correct left. Please document that for the other markets.",
    no: "I’m tilting the plate in the meeting and taking credit for the layout.",
    changed: (p: Plate) => p.some((f) => meat(f.kind) && f.x < -0.35),
  },
  {
    ask: "We’re pivoting to cider. I know I approved the beverage. That was before I heard myself say ‘orchard to office.’",
    yes: "The cider is lovely. Somebody please buy orchardtooffice dot com before my nephew does.",
    no: "I’ve already told the board there’d be cider. They’ve made a slide.",
    changed: (_p: Plate, _old: Plate, drink?: Drink | null) =>
      drink === "cider" || drink === "bourbon",
  },
] as const;

export function clientFeedback(
  plate: Plate,
  drink: Drink | null,
  history: Serving[],
  score: number,
) {
  const last = history.at(-1);
  const previous = last?.verdict.clientRequest;
  const callback =
    last && previous !== undefined && directions[previous]
      ? directions[previous][
          directions[previous].changed(plate, last.plate, drink) ? "yes" : "no"
        ]
      : "";
  if (history.length >= 3 && score === 3) {
    const signoffs = [
      "Fine. Send me this one as FINAL. Keep the first one handy in case I preferred it.",
      "Ship it. In the recap, let’s say we landed here in the first tissue session.",
      "I’m signing off. If my boss asks, the gravy boat was my idea.",
    ];
    return {
      clientNote: [callback, signoffs[(history.length - 3) % signoffs.length]]
        .filter(Boolean)
        .join(" "),
      approved: true,
    };
  }
  const request = history.length % directions.length;
  const holdingNotes = [
    "All three boxes ticked. Now that I see what I asked for, I have thoughts.",
    "The food brief is met. Brand has just joined the call.",
    "Yes, that is exactly what I ordered. Unfortunately, I printed more comment sheets.",
  ];
  return {
    ...(score === 3
      ? { note: holdingNotes[history.length % holdingNotes.length] }
      : {}),
    clientRequest: request,
    clientNote: [callback, directions[request].ask].filter(Boolean).join(" "),
    approved: false,
  };
}
