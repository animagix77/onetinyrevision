# One Tiny Revision

A multiplayer Thanksgiving plating game by Judge Dean LLC. Each chef gets one plate, a demanding guest check, and as many revisions as Margo can stomach. The banquet table shows saved drafts, served versions, verdicts, and team notes. All players share the same D1 banquet. Enter a name to plate, serve and leave notes.

## Play on GitHub Pages

[Play One Tiny Revision](https://animagix77.github.io/onetinyrevision/). Pushes to `main` test, build, and publish the game through GitHub Actions. Run `npm run build:pages` to build the same frontend locally.

A random key saved in the browser lets a returning player resume their own plate. Players can use the same display name without gaining access to each other’s plates. API and schema changes require a separate backend deployment.

## Local play

Install dependencies with `npm ci` and run `npm run build`. On a fresh local database, apply the schema and start the preview.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_curious_ogun.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_red_marten_broadcloak.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_game_round.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_pages_sign_in.sql
npm run start
```

Sites hosts the shared API and applies the tracked migrations during deployment.

## Art credits

The interactive turkey, carving board, utensils, sides, and plate are procedural Three.js models. Bricolage Grotesque and DM Sans are distributed under the licenses in `public/licenses`.

The built-in image generation tool produced the client portrait in `public/margo.jpg` using this prompt.

> Square character portrait of Margo Vale, a discerning middle-aged woman creative director at Thanksgiving dinner. A raised eyebrow behind angular midnight plum glasses, neat silver swoop bob, ochre jacket, arms folded. Tactile low-poly 3D clay miniature character, warm peach studio background, tightly framed shoulders and face, readable as a small game avatar. No lettering.
