// One complete line per entry. Each pool describes something visible on the plate.
const lines = (copy: string) => copy.trim().split("\n");
export const margoLines = {
  missingTurkey: lines(`
Is the turkey joining by Zoom?
Love the negative space where my dinner should be.
Did the bird decline the calendar invite?
I see we’ve shipped the turkey as a concept.
Someone check the outbox. My turkey is still in drafts.
Cute little Thanksgiving tribute to an absent colleague.
Was the turkey under embargo?
Please forward this plate to whoever actually has the bird.
I brought a fork to what appears to be a turkey-free webinar.
I assume the turkey is on slide two?
The star of Thanksgiving has sent its regrets.
If the bird is working remotely, it still owes me two slices.
Fantastic rehearsal. When does the turkey come onstage?
You’ve somehow catered around the entire premise.
I can approve the idea of turkey at the idea of lunch.
Did the turkey take the buyout?`),
  oneSlice: lines(`
One thin slice. Did the other one leave early to beat traffic?
You gave me the before photo of a sandwich.
I see one slice and a remarkably confident use of the plural.
Two slices were approved. Who cut the budget during plating?
Is this the free trial of turkey?
A single slice. I’ll save half for the second slice I ordered.
This slice looks lonely. Introduce it to a colleague.
You nailed the thin part and wandered off halfway through the counting part.
Lovely sample. I’ll take the order now.
I said two. Even my least helpful feedback had a number in it.
Where’s the other slice? Blink twice if procurement has it.
One slice is a teaser campaign. Dinner is the launch.
I didn’t realize the second slice was behind a paywall.
This turkey has a plus-one. Please honor the invitation.
Is the missing slice accruing billable hours somewhere?
You’ve given me exactly enough evidence to prove there was a turkey.`),
  extraSlices: lines(`
I ordered two slices. Who authorized the media buy?
This bird had fewer layers when it was alive.
I see we went straight from portion control to a hostile takeover.
Two slices. The rest can stop auditioning.
Am I eating this or collating it?
Please remove every slice that joined as an optional attendee.
I said two. You heard all-hands.
This stack needs page numbers.
How many people did you think would be operating this fork?
I appreciate the slide deck. Which two pages are dinner?
Nobody asked for the director’s cut of turkey.
The extras are blocking the leads. Give two slices their close-up.
I can see the exact moment the scope crept onto my plate.
This is what happens when every stakeholder gets a slice.
Two was the final number. It didn’t need a stretch goal.
That’s a lot of bird for someone who just wanted a pair.`),
  thick: lines(`
That slice looks load-bearing. I asked for two thin ones.
Can you slice the slice?
I could prop the conference-room door open with this.
Did the carving knife have an out-of-office on?
This is a turkey steak with excellent legal representation.
I asked for thin. You’ve given me the hardcover edition.
My fork just requested a junior fork.
The brief said slices. This one has a floor plan.
If this cut were any thicker, we’d have to book it a seat.
I shouldn’t need a cross-section diagram to eat lunch.
You carved this with the confidence of someone who owns a quarry.
Paper-thin was the reference. You’ve delivered the whole ream.
I can see why the knife stopped. It thought it hit a wall.
Can the turkey come back in a smaller font weight?
We’re serving turkey by the brick now?
This has excellent structural integrity and terrible sandwich potential.`),
  drumstick: lines(`
A drumstick. Great. Where do I plug in the amplifier?
I asked for slices and got a turkey with a handle.
This is less agency potluck, more Renaissance fair.
Which end of this do I use to call the meeting to order?
I see the carving knife has delegated the work to my teeth.
The handle is a thoughtful feature I absolutely did not request.
I’m holding this leg like I just won Best Supporting Turkey.
Did someone say “give the idea legs” in the kitchen?
You’ve served me the bit that used to walk to lunch.
The bone is a pretty strong clue that we skipped the slicing stage.
Am I meant to eat this or point at the mood board with it?
I ordered two thin slices. Which part of that sounded orthopedic?
This drumstick comes with more assembly than our office chairs.
A turkey leg is a bold way to say the knife was decorative.
I’ve got a napkin tucked into a blazer. Read the room and lose the bone.
If I raise this, will the jousting begin?`),
  missingSides: lines(`
I asked for two sides. Did both of them take a personal day?
There’s enough empty china here to hold a breakout session.
Where are the sides? I’ve checked under the optimism.
I see the supporting cast was cut for budget.
The side dishes are demonstrating a powerful commitment to invisibility.
Apparently “family style” means the family ate all the vegetables.
I ordered two sides and received their parking spaces.
Did somebody mute the sides and forget to unmute them?
Bold use of a blank canvas. Try putting food on it.
This plate has two side-dish vacancies, effective immediately.
Are the vegetables waiting for an engraved invitation?
I can fit both missing sides in the gap between brief and execution.
The sides are due today. This is me following up.
Nobody gets billed for imagining the potatoes.
I see two excellent locations for the sides I ordered.
Were the sides removed for being off-brand?`),
  oneSide: lines(`
One side is a solo act. I booked a duet.
Your side dish needs a buddy for the field trip.
I can point to the first side. Try the little game where you point to the second.
Half the supporting cast made it to set.
We asked for variety and got a spokesperson.
There’s a second side to this story. I’d like it on my plate.
Lovely side. Who’s covering the other shift?
The brief came with a plural. It’s doing important work here.
I’m happy for this side’s solo career. Please reunite the band.
You’ve nailed one of the two easiest nouns in the order.
I’d like to meet this vegetable’s emergency contact.
One side is a choice. Two different sides was my choice.
This little side dish can’t carry the whole department.
Did the second side get bumped to next quarter?
We appear to have dropped a course between versions.
There’s still room for a side dish with a different personality.`),
  doubleMash: lines(`
Mashed potatoes and, after a dramatic reveal, mashed potatoes.
You duplicated the potato layer. I can see both eyeball icons.
Potato in stereo is still potato.
What distinguishes these two scoops? Their billing codes?
Mash and its understudy. Only one needs to go on.
I asked for two sides. You gave a potato a mirror.
Is the second scoop a backup in case the first potato crashes?
Mash A and Mash B are testing awfully similarly.
I can tell these potatoes apart. One goes back.
Fantastic twins. I was hoping to meet another vegetable.
I see the potato team bought both ad slots.
One of these potatoes needs to be a green bean in the next draft.
This focus group has a suspiciously uniform opinion on starch.
Mashed potatoes, now with an echo.
Who let the potato paste itself into the deck twice?
The second scoop is giving “per my previous potato.”`),
  doubleBeans: lines(`
Green beans with a side of green beans. Groundbreaking use of green.
These beans appear to have replied all.
You’ve planted a second row of exactly the same idea.
I see fresh beans and their syndicated content.
Which green bean convinced you it was a separate department?
The second scoop of beans is wearing a fake mustache.
Both sides have the same résumé.
I admire the consistency. Now introduce literally one other side.
This many identical green lines would fail our brand guidelines.
Two servings of beans is a reorder. I asked for variety.
Are these competing bean agencies pitching the same account?
We got the beans. You can stop sending the attachment.
The beans have formed a committee to discuss adding more beans.
Copy, paste, haricot vert.
The second pile of green beans is not a plot twist.
Whichever pile of beans has less seniority can clear its desk.`),
  doubleBerries: lines(`
Cranberries again? Did the first batch demand a sequel?
Your two sides are cranberry and the cranberry cinematic universe.
That second scoop is just the first scoop in a different time zone.
Two piles of berries do not constitute a color palette.
I asked for another side, and the cranberries sent a retweet.
We’ve moved from cranberry accent to cranberry sponsorship.
What’s the second side called, Cranberry Pro Max?
It’s the same berry twice. I don’t care what the second press release says.
Which cranberry pile is here as the other cranberry pile’s guest?
Both sides are red, tart, and answering to the same name.
I’ll keep the cranberries. Take their identical stunt double back.
The second helping of berries feels like a distribution error.
I believe the cranberries have exceeded their share of voice.
Did the cranberry account buy exclusivity?
I’m trapped in a cranberry franchise. Get me a potato.
One scoop of berries is festive. The next one owes me a different side.`),
  extraSides: lines(`
One scoop each of two sides. You opened satellite offices.
I need a fork, not a guided tour of the buffet.
Who invited all these side dishes to a two-person meeting?
Two supporting roles. You cast the entire community theater.
There’s a fine line between a plate and a catering invoice. We crossed it.
I asked for two scoops. Is the scoop paid on commission?
How many sides does this plate have? Because I thought it was round.
I wanted a pair of sides. This looks like a merger.
We can lose a few scoops without laying anyone off.
I’m not the designated leftovers container.
Two scoops total. “While supplies last” wasn’t in the brief.
The sides are apparently running a buy-two-get-everything promotion.
This plate was portioned by someone trying to get out of washing a pan.
Your scoop has incredible stamina and no sense of when to leave.
A small dinner request has become a side hustle.
It was a potluck. I didn’t actually ask you to bring me the pot.`),
  noGravy: lines(`
Is the gravy being delivered in a separate email?
My turkey is refreshing its inbox for sauce.
I requested gravy on the side. Which side of the building?
Dry January starts in January. Find the gravy.
The gravy appears to be on a fully remote contract.
I’m going to need that gravy in a format my fork can open.
You’ve respected the gravy boundary all the way into another room.
If this turkey gets any drier, legal will file it as a document.
I can’t taste a verbal commitment to gravy.
Where’s the sauce? I don’t accept “see attached” without an attachment.
The gravy boat missed its port of call.
I’m prepared to initial the gravy once there’s some gravy.
I distinctly remember funding a ladle.
The absence of gravy is a strangely loud creative decision.
Did you send my gravy to the other Margo?
Beautiful restraint. A little less restraint and an actual spoonful, please.`),
  wet: lines(`
The gravy is touching my turkey. We discussed boundaries.
I said on the side. Which side of the turkey did you think meant the top?
Could someone get the skin a tiny towel?
You put the watermark directly over the hero image.
The skin was crisp before somebody scheduled a wet activation.
There’s gravy in the one place marked “no gravy.” Impressive aim.
The turkey didn’t ask for a glossy finish.
My fork just made a squelch. That was supposed to be applause.
I can tell where you poured. There’s a small crime scene on the turkey.
The gravy needs to respect the turkey’s personal space.
You found the turkey with the ladle. Now try missing.
This bird went into review matte and came out laminated.
On the side was a placement instruction. It wasn’t a vibe.
Who signed off on the turkey’s unsolicited glaze?
That brown spot on the skin is going to be an awkward portfolio caption.
Put the gravy on some empty china. The bird has suffered enough meetings.`),
  flood: lines(`
The turkey has a waterfront property nobody authorized.
Several pours in and we’re still negotiating the meaning of “beside.”
My fork needs a little outboard motor.
I see gravy has acquired the turkey in a very liquid transaction.
At least give the skin a lifeguard.
Was the ladle stuck on reply all?
There’s enough sauce here for the turkey to commute by ferry.
We’re going to need a floodplain map for this bird.
Somewhere under the gravy is a turkey asking for its deposit back.
The ladle has had several chances to miss the turkey.
I asked for a side of gravy and got a bird with a tide chart.
This plate is about to be rezoned as wetlands.
I believe the turkey selected “shower later.”
You can stop pouring when you find the part where I said “on the side.”
If the bird floats past again, I’d like a dry slice.
The turkey’s crisp skin was last seen boarding a lifeboat.`),
  ampleSauce: lines(`
Technically every drop is on the side. My lawyer advises me to approve.
Two thin slices, two sides, and a municipal gravy reserve. Fine.
I requested gravy on the side. You’ve given the side its own coast guard. Approved.
The skin is dry, which limits my legal options. Pass the extra gravy.
The quantity of sauce is between you and the ladle. You met the brief.
I see you found the loophole where I forgot to specify ladles.
A generous gravy endowment. The turkey remains unbothered. Carry on.
I count a lot of sauce and zero contractual violations.
This plate is technically correct, which is my least favorite kind of delicious.
The bird is crisp beside its private swimming pool. I’ll allow it.
Nobody tell finance what the gravy cost. I’m signing.
I might take the spare gravy home in a branded tote.
You’ve got sauce in reserves and a perfectly dry turkey. Point to you.
I left gravy volume out of the brief, and you made that my problem. Respect.
Approved. I’ll have someone manage the gravy portfolio.
We’ve secured a strategic gravy surplus without compromising the skin. Fine work.`),
  approved: lines(`
Oh, damn. Now I have to find something nice to say in writing.
Approved. If anyone asks, this was my feedback all along.
Who read the brief? Bring them to the next pitch.
Two thin slices, two sides, dry skin. You’ve left me nothing to circle in red.
I had a whole speech prepared. I’ll be eating instead.
No notes. Please keep that between us.
I would move the gravy three millimeters just to feel involved, but I’m hungry.
Approved on the first pass. This is deeply inconvenient for my personal brand.
I tried to find a problem. The fork got there first.
You may use “Margo went quiet” as a testimonial.
I’m crossing out my own feedback. Enjoy this extremely limited edition moment.
The skin actually crunches. I can cancel the alignment call.
No revisions. Someone check whether Mercury is doing something unusual.
It’s exactly what I ordered. I find that almost confrontational.
Stamp it approved before another director walks in.
This is good enough that I’m going to pretend the two-slice thing was a creative risk.`),
  comeback: lines(`
Approved. Archive the earlier plate somewhere the client can’t find it. I’m the client.
Well, damn. The revision meeting could have been one fork.
That’s the plate. I’m deleting the paragraph I had queued up.
You stuck the landing. Let’s agree never to show the rehearsal footage.
There it is. Put THIS version in the case study.
I’ve changed my feedback to chewing.
The revised plate has made my red pen redundant. I’ll break it to her gently.
Approved. This is the rare occasion when “final final” means something.
You did it. I just canceled a perfectly good follow-up meeting.
The second serving gets my signature and most of my lunch break.
Look at that. Feedback went in and dinner came out.
I was fully prepared to be a pain in the ass again. You’ve ruined it.
I’d give the revision another note, but I’m busy stealing a second bite.
Keep this plate. Retire every file with “newest” in the name.
All three requests met. My dramatic sigh is officially off the clock.
Approved. Tell the kitchen the client has reluctantly become a fan.`),
};
