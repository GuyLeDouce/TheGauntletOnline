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
