// Margo gets one line per tasting. Each pool is tied to something the chef served.
const lines = (copy: string) => copy.trim().split("\n");
export const margoLines = {
  barTab: lines(`
My fork has one place setting and my bar tab has several. Which headcount did we send Finance?
I see my Thanksgiving drinks have a plus-one. Lovely. What name shall I give Accounts?
I asked for a pairing. Did you hear “pair up and bring a friend”?
My mother counts chairs before Thanksgiving. Finance counts glasses. One of them is going to call.
I’ve got enough drinks to toast both sides of the family separately. Keep the itemized receipt.
I’ll raise a glass to the turkey. What business purpose are we assigning the other toast?
Is that all for me? Lovely. Fold the Thanksgiving receipt so the drinks are on the inside.`),
  anotherRound: lines(`
I said “another round of revisions.” I can see where the drinks team got involved.
An extra drink since my last tasting. Did the turkey approve a change order?
I see you’ve addressed my feedback by increasing the bar tab. Accounts would love to meet your strategist.
We went back for edits and came back with another drink. My aunt runs Thanksgiving the same way.`),
  expenseReport: lines(`
You’re going to need to add a couple of names to that expense report. And no, the turkey doesn’t count.
One chair, all these drinks. Compliance is going to want a wider shot of Thanksgiving.
When Accounts asks how many people came to dinner, please let somebody other than the bartender answer.
There’s a whole kids’ table at my mother’s house and somehow my place setting still has the bigger bar tab.
Before we say grace, could everyone who actually drank something sign the back of this receipt?
The Thanksgiving expense form has a box for “client attendees.” “Margo, repeatedly” won’t fit.
I asked for holiday spirit in the singular. Could somebody walk Finance through the plurals?
That’s a generous pour of agency hospitality. I’d staple the seating chart to the receipt.`),
  barSignoff: lines(`
I’ll sign off on the turkey. Somebody who was here for all those drinks can sign the expense report.
Dinner is approved. The bar receipt can go through its own round of revisions.
Yes to the plate. Leave a little room under my signature for whoever’s explaining the drinks to Finance.
The skin is crisp, the gravy’s on the side, and the receipt needs a second page. Happy Thanksgiving.`),
  drinksOnly: lines(`
I appreciate the beverage strategy. Which glass has the two slices of turkey?
We seem to have gone straight to the part of Thanksgiving where my uncle has opinions. I’d still like dinner.
The turkey and I appear to be at separate events. Did someone forward it the drinks invite?`),
  flight: lines(`
Two slices, two sides, and a drinks menu with its own account director. I’d like a minute with the seating chart.
The turkey meets the brief. The glassware suggests this Thanksgiving has secured a beverage sponsor.
Could you point out which glass is mine? “All of them” is quite a bold reading of the Thanksgiving brief.`),
  flightApproved: lines(`
Thanksgiving is approved. I’ve put a coaster on the deck so you’ll know which version I signed.
The turkey’s crisp and the drinks have formed a steering committee. Fine. Send the leftovers to my office.
Sign-off granted. Please expense the turkey and submit the glassware as a separate event.`),
  missingTurkey: lines(`
Is the turkey joining by Zoom?
I have a plate, a fork, and written assurance that there’s a turkey. Two of those things are going cold.
I assume the turkey is on slide two?
Please unhide the turkey layer before sending this to my mother.
When I said the turkey needed room to breathe, I assumed it would still be attending Thanksgiving.
I see we’ve shipped the turkey as a concept.
Did the bird decline the calendar invite?
My uncle is saying grace. Can he stall, or is the turkey a next-quarter thing?
I love that you left space for turkey. Let’s take that thought all the way through.
Did someone forget to uncheck “for positioning only” on the bird?
We approved a turkey in October. I’d love to meet it before December.
If the bird is working remotely, it still owes me two slices.
I’m looking at the vegetarian cut of a turkey brief.
You’ve left a beautiful space for the turkey. Unfortunately, that’s the part I eat.
I brought a carving knife to what appears to be a turkey status update.
Was the turkey in the attachment my phone couldn’t open?`),
  oneSlice: lines(`
One thin slice. Did the other one leave early to beat Thanksgiving traffic?
We approved two slices. Was the second turkey deliverable scoped separately?
You gave me the before photo of a leftovers sandwich.
My sister and I can split this slice if you can tell us which of us was the target audience.
I see one slice of turkey and a remarkably confident use of the plural.
Is this the free trial of turkey?
Who moved my second slice of turkey to the parking lot? I meant the one on the whiteboard.
This slice looks lonely. Does it have the other slice’s out-of-office?
One slice is a teaser campaign. When does dinner launch?
I didn’t realize the second slice of turkey was behind a paywall.
Two slices in the estimate, one on the china. Has Finance seen this?
I asked for a pair of turkey slices. My fork is happy to wait while you check the email.
The turkey on my plate has a plus-one. Please honor the invitation.
I said “tighten it up” about the Thanksgiving deck. Put the other slice back.
Where’s the other slice? Blink twice if Procurement has it.
One slice for dinner leaves nothing for Friday. I’d like someone senior on this.`),
  extraSlices: lines(`
I ordered two slices of turkey. Who authorized the media buy?
I asked for dinner, and you built in three days of leftovers. That’s a separate project.
Two turkey slices. The rest can stop auditioning.
Why is the whole bird on my plate? Were the other plates out of scope?
Please remove every turkey slice that joined as an optional attendee.
I appreciate the turkey deck. Which two pages am I eating?
Two was the approved number of slices. I don’t remember aligning on a stretch goal.
This turkey stack needs page numbers.
We needed a pair of turkey slices. How many rounds of internal review added the rest?
I asked the family for feedback and now everybody’s slice is in here, isn’t it?
Leave two slices here and take the turkey appendix to the kids’ table.
Nobody asked for the director’s cut of Thanksgiving turkey.
If the other slices are alternate routes, you’re allowed to recommend one.
We’re feeding my appetite, not my entire distribution list. Two slices.
Two slices for dinner. The leftovers have their own launch on Friday.
This much turkey is going to need a second plate and a change order.`),
  thick: lines(`
That turkey slice looks load-bearing. Can we see a lighter cut?
Could you send this turkey back through thinning? My dinner knife is freelance.
I asked for thin turkey. You’ve given me the hardcover edition.
I could prop the conference-room door open with this slice of Thanksgiving.
My grandmother carved thinner turkey with the good knife still in its packaging.
The turkey brief said slices. This one has a floor plan.
If we cut this turkey in half again, we can call it a revision and both go home.
Can the turkey come back in a lighter font weight?
I shouldn’t need a cross-section diagram to eat Thanksgiving dinner.
My fork just put in for a second fork. Thinner turkey, please.
Did the carving knife have an out-of-office on?
I asked for two thin slices, and the bird has arrived as a paperweight.
We don’t need this much turkey above the fold.
These slices would travel beautifully. I’d need to check them as luggage.
I’d show you how thin I meant, but the reference turkey was eaten at the kickoff.
This slice is big enough to host Thanksgiving. I was hoping to eat it.`),
  drumstick: lines(`
I asked for slices and got a turkey with a handle.
Did someone say “give the idea legs” in the kitchen?
If I bang this drumstick on the table, does that bring the Thanksgiving meeting to order?
Is carving the bird now a customer journey?
I’m holding this leg like I just won Best Supporting Turkey.
This turkey leg is an impressive presentation clicker. What’s for dinner?
A drumstick feels right for the parade. Our placement is dinner.
I see the carving knife has delegated the Thanksgiving work to my teeth.
I can’t eat the turkey and point at the mood board with the same drumstick.
This drumstick comes with more assembly than our office chairs.
Was there a handoff from the carving team? I seem to have their homework.
I asked for two slices, and the turkey has arrived with instructions for my elbow.
I love an interactive Thanksgiving experience. Please finish carving mine.
We won’t need the drumstick for scale. We’ll need it sliced.
That’s a turkey leg. Can we take one more pass with the knife while we’re all here?
If I raise this drumstick, will the jousting begin?`),
  missingSides: lines(`
Both side dishes took Wednesday off, didn’t they?
My turkey is sitting alone at a family holiday. I’d rather avoid the optics.
Were the vegetables on the version of the Thanksgiving brief you actually received?
Where are the sides? I checked under the turkey and in the follow-up email.
Two empty spots for sides. Lovely placeholders. When does the food go in?
I see the Thanksgiving supporting cast was cut for budget.
The turkey is final. Are the sides still with Legal?
If the potatoes are going to miss dinner, I’d appreciate the heads-up before grace.
I asked for two sides and received their parking spaces.
The only sides I see are the two sides of the Thanksgiving scope dispute.
Apparently “family style” means the family ate all the vegetables.
We have room for two sides and, apparently, a meeting about two sides.
The vegetables can skip the intro call. Just put them next to the turkey.
Nobody gets billed for imagining the mashed potatoes.
If the sides were cut for time, whose time? I am still here with a fork.
Will the sides be coming out with dessert, or should I send a calendar hold?`),
  oneSide: lines(`
One side dish. Who’s covering the other one over Thanksgiving?
We agreed on two different sides. Can somebody loop in another vegetable?
Your side dish needs a plus-one. It’s Thanksgiving, I’ll put out a chair.
I like this side. I’ll like it even more when it introduces the second side.
Are the other vegetables getting this feedback, or is it just us and the turkey?
I can see one side of the Thanksgiving story. My fork would enjoy the other.
The sides were a package deal. I’m holding half the package.
One side for the whole holiday feels like a pilot. We bought the series.
The brief came with a plural after “side.” That took three meetings.
Did the second side dish get bumped to next quarter?
Could we get a second side before my aunt suggests a little round of introductions?
The turkey has one supporting act. I was promised a double feature.
If there’s a second side coming, I’d love the ETA in units of “before pie.”
Lovely vegetable. Does anything else in the casserole district want the account?
The empty space next to that side is about the size of the side I’m missing.
This one side dish can’t carry Thanksgiving on its own retainer.`),
  doubleMash: lines(`
Mashed potatoes and, after a dramatic reveal, mashed potatoes.
You duplicated the potato layer. I can see both eyeball icons.
Mash A and Mash B are testing awfully similarly.
What distinguishes these two scoops of mash? Their billing codes?
I asked for two sides. You gave a potato a mirror.
Potato in stereo is still potato.
My aunt did two kinds of potatoes too. Her brief was to feed forty.
Is the second scoop a backup in case the first potato crashes?
We wanted another side at Thanksgiving. These are the same potatoes in two breakout rooms.
I see the potato team bought both ad slots.
Let’s keep one scoop of mash. Give the other spot to somebody outside the potato account.
Fantastic potato twins. I was hoping to meet another vegetable.
Is the second scoop billable if you just held down Option and dragged the mash?
One of these potato concepts needs a new ingredient.
Who let the potato paste itself into the deck twice?
The second scoop is giving “per my previous potato.”`),
  doubleBeans: lines(`
Green beans with a side of green beans. Groundbreaking use of green.
These beans appear to have replied all.
I see fresh beans and their syndicated content.
Which green bean convinced you it was a separate department?
We got the beans. You can stop sending the attachment.
Thanksgiving already has an encore. It’s called leftovers. We need a different side today.
The second scoop of beans is wearing a fake mustache.
Are these competing bean agencies pitching the same account?
Two servings of beans is a reorder. I asked for variety.
Both green bean routes feel quite close. Have we explored potato?
If I call these beans East Coast and West Coast, are you billing me twice?
The beans have formed a committee to discuss adding more beans.
My mother will notice both sides are green beans. She used to run Accounts.
Copy, paste, haricot vert.
The second pile of green beans is not a plot twist.
Whichever pile of beans has less seniority can clear its desk.`),
  doubleBerries: lines(`
Cranberries again? Did the first batch demand a sequel?
I asked for another side, and the cranberries sent a reply-all.
Both sides of the family brought cranberry sauce. Did nobody circulate the spreadsheet?
Two piles of berries do not constitute a color palette.
I believe the cranberries have exceeded their share of voice.
We’ve moved from cranberry accent to cranberry sponsorship.
What’s the second side called, Cranberry Pro Max?
It’s the same berry twice. I don’t care what the second press release says.
Which cranberry pile is here as the other cranberry pile’s guest?
Are these cranberry options A and B? Because I’m being served both.
I’ll keep the cranberries. Could a different side join them next time?
If we serve any more cranberries, my uncle gets to tell his bog story.
I feel I’ve heard from Cranberry. Can we open the floor to Beans?
Did the cranberry account buy Thanksgiving exclusivity?
I’m trapped in a cranberry franchise. Get me a potato.
One scoop of berries is festive. The second one feels like a retargeting ad.`),
  extraSides: lines(`
I asked for two side dishes. Did everyone at the potluck get a vote?
Who invited all these side dishes to a two-person meeting?
One scoop each of two sides. You opened satellite offices.
There’s a fine line between a Thanksgiving plate and a catering invoice. We crossed it.
I asked for two scoops. Is the scoop paid on commission?
My aunt said bring a side. She said it to different people.
I wanted a pair of sides. This looks like a merger.
How many sides does this Thanksgiving plate have? I was told it was round.
I’m not the designated Thanksgiving leftovers container.
The sides are running a buy-two-get-everything promotion.
Two scoops total. “While supplies last” wasn’t in the Thanksgiving brief.
These are excellent backup sides. I usually keep the backups in the kitchen.
Somebody consolidated the family’s feedback by putting every side dish on my plate.
I like options in a deck. At Thanksgiving, I like two sides and room for pie.
I think we could take a side dish out without calling it a staffing decision.
It was a potluck. I didn’t actually ask you to bring me the pot.`),
  noGravy: lines(`
I have the turkey and the minutes from the gravy meeting. Was there meant to be an attachment?
Is the gravy being delivered in a separate email?
My turkey is refreshing its inbox for sauce.
I requested gravy on the side. Which side of the building?
The gravy appears to be on a fully remote contract.
I can’t taste a verbal commitment to gravy.
I’m going to need that gravy in a format my fork can open.
If this turkey gets any drier, Legal will file it as a document.
Who has final approval on gravy? My father is about to open the ketchup.
Where’s the gravy? I don’t accept “see attached” without an attachment.
The gravy boat missed its port of call.
I’m prepared to initial the gravy once there’s some gravy.
I distinctly remember funding a Thanksgiving ladle.
Did you send my gravy to the other Margo?
Are we waiting on gravy assets? My turkey is already live.
If the gravy boat is running late, it can skip the parade and come straight here.`),
  wet: lines(`
I signed off on the crisp skin. Who gave the gravy edit access?
The gravy is touching my turkey. We discussed boundaries.
I said gravy on the side. Which side of the turkey did you think meant the top?
The turkey was crisp in the presentation. Is this what you meant by a liquid layout?
My Thanksgiving reference had a gravy boat. Yours appears to have capsized.
The skin was crisp before somebody scheduled a wet activation.
There’s gravy in the one place marked “no gravy.” Impressive aim.
The turkey didn’t ask for a glossy finish.
This bird went into review matte and came out laminated.
I can tell where you poured. There’s a small crime scene on the turkey.
The gravy needs to respect the turkey’s personal space.
You found the turkey with the ladle. Now try missing.
I liked the dry turkey skin from two emails ago. Can we pull that version up?
My aunt wanted the gravy over everything. She was copied for visibility.
Who signed off on the turkey’s unsolicited glaze?
Put the gravy on some empty china. The bird has suffered enough meetings.`),
  flood: lines(`
The turkey has a waterfront property nobody authorized.
At this depth, calling it a gravy boat feels like a rescue request.
My Thanksgiving fork needs a little outboard motor.
I see gravy has acquired the turkey in a very liquid transaction.
At least give the turkey skin a lifeguard.
Was the gravy ladle stuck on reply all?
There’s enough gravy here for the turkey to commute by ferry.
We’re going to need a floodplain map for this bird.
Somewhere under the gravy is a turkey asking for its deposit back.
The ladle has had several chances to miss the turkey.
I asked for a side of gravy and got a bird with a tide chart.
Did every stakeholder get their own turn with the gravy boat?
I believe the turkey selected “shower later.”
We said gravy across the Thanksgiving campaign. I can see how that got misread.
If the bird floats past again, I’d like a dry slice.
The turkey’s crisp skin was last seen boarding a lifeboat.`),
  holding: lines(`
This is the turkey I asked for. Could I see it a little farther forward before I decide that’s too far?
I do like the gravy there. Can I see what “there” looks like from my mother’s end of the table?
Two slices, two sides, gravy behaving itself. I’d like one more look once my sister leaves the room.
The turkey is right. My brother just joined the thread and I made the mistake of telling him he could weigh in.
The skin’s crisp. The sides work. Can we let the turkey breathe for a minute while I remember what bothered me?
It tastes like Thanksgiving. Could we try just a touch more of the Thanksgiving I remember?
That gravy placement works for me personally. Unfortunately, I invited my family professionally.
This is very close to my grandmother’s turkey. I won’t describe hers yet. I don’t want to influence you.
I like where the slices landed. Can you turn the plate so my aunt thinks we took her note?
The turkey is right. Give me one more pass to work out how to present that to the family.
I love this Thanksgiving plate. I wrote my notes before tasting it, though, and it seems a shame.
Could I get one more look at those two slices? I told the family we’d explored options.
I wanted the gravy there, and there it is. I’m just adjusting to being listened to.
The turkey skin crackles beautifully. Can we get that across to the relatives eating on mute?
The sides are exactly right. I’ll circulate them to the five people who said they had no preference.
This feels ready for Thanksgiving. My mother uses a slightly different definition of ready.`),
  approved: lines(`
Approved. Save this turkey as Thanksgiving_FINAL and put a little foil over it.
Keep this plate. If my sister asks, the gravy on the side was her idea.
Ship the turkey. My fork has overruled the rest of my comments.
Approved. I’m taking the second slice home for internal review.
That’s Thanksgiving. You can tell the family we got here in one round.
Two slices, crisp skin, gravy on the side. I’m deleting an absolutely terrific email.
I’m signing off before my uncle discovers the comment function on Thanksgiving.
The turkey is good enough that I just took my glasses off. That’s approval in this family.
The skin actually crunches. I’m canceling the gravy alignment call.
Yes, this plate. Wrap the leftovers before someone opens a fresh round of feedback.
Approved. Would you mind sending my mother the gravy boat and absolutely none of the version history?
Thanksgiving is approved. If anyone needs me, I’ll be conducting a fork test on the leftovers.`),
  ampleSauce: lines(`
Approved. You left the turkey crisp and gave the gravy its own holiday rental.
That’s more gravy than we scoped, but my uncle has offered to take the overage.
Two thin slices, two sides, and a municipal gravy reserve. I’m signing.
The bird is crisp beside its private swimming pool. I’ll allow it.
I left gravy volume out of the brief, and you made that my problem. Pass the boat.
Approved. When Finance asks why we needed all this gravy, send them to my brother.`),
  movedTurkey: lines(`
Yes, I can see the turkey now. Can we keep that exact position and try a version my aunt won’t call showy?
There’s my turkey. Naturally my mother preferred it where it was. Give me a minute with her.
You moved the slices just where I pointed. I’m going to point somewhere else, so take a picture first.`),
  turkeyFixed: lines(`
Those are the two slices I pitched to the family. Can we get the sides to read the same email?
Yes to the turkey. I’d like the side dishes to give that Thanksgiving brief another skim.`),
  sidesFixed: lines(`
Keep those sides. What do I tell the family about the gravy situation?
Two different sides, finally. I’m moving my little red circle over to the gravy.`),
};
