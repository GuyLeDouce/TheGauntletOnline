# The Gauntlet Online

Standalone web app version of The Gauntlet solo mode.

## Run locally

```bash
npm start
```

Then open `http://localhost:3000`.

## Railway

- Create a new Railway project for this directory.
- Start command: `npm start`
- Railway will provide `PORT`; the server already binds `0.0.0.0`.
- Expose the service using Railway Public Networking.
- A `railway.json` file is included with an explicit start command and `/health` healthcheck.
- Add `DATABASE_URL_LEADERBOARD` for persistent Discord profiles, runs, and leaderboard storage.
- Leaderboards default to monthly, with weekly and all-time filters.
- Discord OAuth requires:
  - `DISCORD_CLIENT_ID`
  - `DISCORD_CLIENT_SECRET`
  - `DISCORD_REDIRECT_URI` such as `https://your-domain.com/api/auth/discord/callback`
  - Optional `PUBLIC_BASE_URL` if you want the server to infer the callback URL.
- In the Discord Developer Portal, add the same redirect URI under OAuth2 redirects.
