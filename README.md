# One Tiny Revision

A multiplayer Thanksgiving plating game by Judge Dean LLC. Each chef gets one plate, a demanding guest check, and one revised submission. The banquet table shows saved drafts, served versions, verdicts, and team notes. Signed-in players share a D1 database. Anonymous practice stays in the current browser tab.

## Local play

Install dependencies with `npm ci` and run `npm run build`. On a fresh local database, apply the schema and start the preview.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_curious_ogun.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_red_marten_broadcloak.sql
npm run start
```

Sites supplies authenticated identity in production and applies the tracked migration during deployment. Use the Site’s access controls to admit the intended team.

## Art credits

The interactive turkey, carving board, utensils, sides, and plate are procedural Three.js models. Bricolage Grotesque and DM Sans are distributed under the licenses in `public/licenses`.

The built-in image generation tool produced the client portrait in `public/margo.jpg` using this prompt.

> Square character portrait of Margo Vale, a discerning middle-aged woman creative director at Thanksgiving dinner. A raised eyebrow behind angular midnight plum glasses, neat silver swoop bob, ochre jacket, arms folded. Tactile low-poly 3D clay miniature character, warm peach studio background, tightly framed shoulders and face, readable as a small game avatar. No lettering.
