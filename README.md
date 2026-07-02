# InSquignito's Ugly Interview

A Squigs Reloaded survival interview game.

Players connect Discord, type a wallet address, scan Squigs Reloaded holdings through Alchemy, receive server-calculated Interview Dignity, then survive a 15-question roast interview with InSquignito. Reward runs create pending `$CHARM` claim records for review/DRIP handling. The app never auto-sends tokens and does not connect or sign wallets.

## Local Setup

```bash
npm install
npm start
```

Open `http://localhost:3000`.

Without Postgres, the app runs with in-memory storage for local testing. Wallet scanning requires Alchemy env vars.

Useful check:

```bash
npm run check
```

## Railway Deploy Setup

This repo remains a standalone Node/CommonJS app. Railway should use:

- Start command: `npm start`
- Health check path: `/health`
- Public networking enabled
- Node 18+

`railway.json` already contains the start command and health check.

## Required Railway Variables

```txt
DATABASE_URL_LEADERBOARD=<Railway Postgres connection string>
DISCORD_CLIENT_ID=<Discord app client id>
DISCORD_CLIENT_SECRET=<Discord app client secret>
DISCORD_REDIRECT_URI=https://<your-railway-domain>/api/auth/discord/callback
PUBLIC_BASE_URL=https://<your-railway-domain>
ALCHEMY_API_KEY=<Alchemy API key>
SQUIGS_CONTRACT_ADDRESS=0x8c9a02c0585200c4C65608dF6b8Def543D33792A
```

## Optional Railway Variables

```txt
PGSSL=true
NODE_ENV=production
DISCORD_INVITE_URL=https://squigs.io/discord
DISCORD_PAYOUT_WEBHOOK_URL=<Discord webhook URL for payout alerts>
ADMIN_SECRET=<long random secret for admin payout routes>
DRIP_PROFILE_URL=<DRIP profile/account-link URL shown to users>
DRIP_CLAIM_HELP_URL=<optional claim help URL>
REWARD_COOLDOWN_HOURS=24
WALLET_SCAN_CACHE_MINUTES=15
ALLOW_ZERO_SQUIG_REWARD=false
INTERVIEW_LENGTH=15
INTERVIEW_TIMERS_ENABLED=true
RUN_MAX_ACTIVE_HOURS=2
CHARM_FULL_CLEAR_BONUS=2000
CHARM_OUT_OF_DIGNITY_MULTIPLIER=0.5
CHARM_REWARD_MULTIPLIER=1
```

## Discord OAuth Setup

Create a Discord application, add an OAuth2 redirect URL:

```txt
https://<your-railway-domain>/api/auth/discord/callback
```

Set `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, and `PUBLIC_BASE_URL`. The app requests the `identify` scope and stores Discord ID, handle, avatar, and global name in `ugly_interview_profiles`.

## Alchemy Setup

Create an Alchemy Ethereum mainnet app and set:

```txt
ALCHEMY_API_KEY=<key>
SQUIGS_CONTRACT_ADDRESS=<Squigs Reloaded contract>
```

The scanner calls:

```txt
https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner
```

with `owner`, `contractAddresses[]`, `withMetadata=true`, and guarded pagination. The example Squigs Reloaded contract is:

```txt
0x8c9a02c0585200c4C65608dF6b8Def543D33792A
```

Use the environment variable as the source of truth.

## DRIP / $CHARM Pending Payouts

Reward runs do not send tokens. Completed, cashed-out, or out-of-dignity reward runs create pending payout records only when:

- Discord is connected
- Wallet scan exists
- Reward mode is active
- Cooldown allows the run
- Final `$CHARM` is greater than zero

Players see a claim code like `UGLY-7H2K9`, pending status, and generic DRIP/account-linking instructions. Use `DRIP_PROFILE_URL`, `DRIP_CLAIM_HELP_URL`, and `DISCORD_INVITE_URL` to point users at the right claim process.

If `DISCORD_PAYOUT_WEBHOOK_URL` is set, new pending claims are posted to Discord. Webhook failure is logged and does not break the player result.

## Admin Payout Workflow

Set `ADMIN_SECRET` to enable protected payout routes.

List payouts:

```bash
curl -H "x-admin-secret: $ADMIN_SECRET" \
  "https://<domain>/api/admin/payouts?status=pending"
```

Update payout status:

```bash
curl -X POST \
  -H "content-type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -d '{"status":"approved","adminNote":"Reviewed for DRIP handling"}' \
  "https://<domain>/api/admin/payouts/<payoutId>/status"
```

Allowed statuses: `pending`, `approved`, `paid`, `rejected`, `void`.

## Question Pool Editing

Questions live in [server/interview-questions.js](server/interview-questions.js). Correct answers are server-only and never shipped in frontend JS.

Each question includes:

- `id`
- `tier`
- `difficulty`
- `category`
- `imageKey`
- `prompt`
- `options`
- `correctOptionId`
- `correctRoast`
- `wrongRoast`
- `explanation`
- `reward`

Startup validation checks duplicate IDs, tier counts, correct options, option counts by tier, rewards, prompts, and roasts. If validation fails, the server does not start.

## Image Asset TODOs

The app works without images. Add these later under `public/assets/`:

- `ugly-interview-lobby.png`
- `insquignito-desk.png`
- `ugly-wallet-scan.png`
- `ugly-correct.png`
- `ugly-wrong.png`
- `revive-pill-bonus.png`
- `drip-claim-booth.png`
- `ugly-hired.png`
- `ugly-fired.png`
- `pretty-jail.png`

Image ideas:

1. InSquignito behind a messy Ugly Labs interview desk, stamping a file that says UGLY VERIFIED.
2. A cartoon wallet being scanned by a gross alien machine while Squigs peek at the monitor.
3. InSquignito giving a thumbs up with the text "DISGUSTING. CONTINUE."
4. InSquignito holding a clipboard that says "TOO PRETTY" after a wrong answer.
5. A glowing Revive Pill on a medical tray with a weird Squig doctor.
6. A broken `$CHARM` / DRIP claim booth leaking cartoon tokens.
7. Final victory scene: player file stamped HIRED BY INSQUIGNITO with `$CHARM` confetti.
8. Failure scene: Pretty Jail with a sign saying "ANSWERED TOO CLEAN."

## Safety / Tone Rules

The game uses fake-rude Squigs lore where "ugly" is a compliment. Roasts should target in-game answers, polished vibes, boring choices, fictional HR weirdness, and "pretty energy."

Do not insult protected traits, race, gender, religion, sexuality, disability, health, body type, or real-world appearance. Keep the joke inside Ugly Labs.

## Testing Checklist

- `npm run check`
- `npm start`
- `GET /health` returns `ok: true`
- Discord OAuth redirects and stores Discord profile
- Wallet validation rejects invalid addresses
- Wallet scan counts Squigs and Revive Pill traits through Alchemy
- Reward run requires Discord and scan
- Practice run starts without payout
- Server response never includes `correctOptionId` before answering
- Timed-out questions are wrong server-side
- Cashout creates pending payout only for reward mode
- Out-of-dignity halves stack by default
- Full clear adds configured bonus
- Weekly, monthly, and all-time leaderboard views load
- My `$CHARM` Claims view lists pending claims
- Missing images still show usable placeholder cards
