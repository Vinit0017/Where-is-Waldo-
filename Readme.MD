# Where's Waldo?

A "find the character" photo-tagging game. Pick a photo, click where you think a character is hiding, choose who it is from the dropdown, and race the clock. Your time goes on a leaderboard.

- **Live game:** https://where-is-waldo-dun.vercel.app
- **API:** https://where-is-waldo-eyxu.onrender.com/api

> The API runs on a free Render instance that sleeps when idle. The first request after a pause can take 30 to 60 seconds, so the first load may be slow.

## Features

- Multiple photos, each with its own set of hidden characters
- Click-to-tag targeting box with a dropdown of the characters still to find
- Server-side validation of every guess, so the answers never reach the browser
- Server-authoritative timer that survives page refreshes
- Resume an in-progress game after reloading the page
- Score submission and a per-image leaderboard with ranks
- Guess rate limiting and input validation

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, plain CSS |
| Backend | Node.js, Express, express-validator, express-rate-limit |
| Database | PostgreSQL (Neon), Prisma ORM |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |

## How it works

1. The player picks an image. The frontend creates a game (`POST /games`) and starts it (`POST /games/:id/start`). The game id is kept in `localStorage` so a refresh can resume it.
2. A click is converted to normalized coordinates (0 to 1) relative to the image, so it works at any screen size.
3. The player picks a character from the dropdown. The frontend sends `{ characterId, x, y }` to the server.
4. The server checks that the game is in progress, that the character belongs to the image, and whether the click lands in the character's box. Hits are recorded in a database transaction. If every character is found, the game is marked finished and the duration is computed on the server.
5. The frontend draws a ring around found characters and shows the finish dialog when the game ends. The player can then save a score and see the leaderboard.

**Design decisions**

- **Character coordinates never leave the server** until a character has been found, so there's nothing to read from the network tab.
- **Time is measured on the server** (`startedAt` to `finishedAt`). The client timer is only a display, corrected with `serverNow` to ignore a wrong local clock.
- **Guesses are idempotent.** Repeating a correct guess doesn't duplicate a `Found` row, thanks to a unique constraint on (game, character).
- **Finishing is conditional** (`WHERE status = 'PLAYING'`), so two simultaneous requests can't finish a game twice.
- **One score per game**, enforced by a unique constraint and a 409 `SCORE_ALREADY_SUBMITTED`.

## Project structure

```
Where-is-Waldo-/
  frontend/
    public/            photos and character icons (served from the site root)
    src/
      api.js           fetch wrapper and time formatting
      App.jsx          game session handling
      components/
        ImageSelect.jsx
        Game.jsx       board, targeting box, timer
        Finish.jsx     score form and leaderboard
  server/
    app.js             Express setup
    routes/            games, images, scores
    controllers/       request handling
    db/                Prisma queries
    middlewares/       validation, error handling, rate limiter
    services/          hit test and pagination
    prisma/            schema, migrations, seed
```

## API

All routes are under `/api`.

| Method | Path | Description |
|---|---|---|
| GET | `/images` | List images with character counts |
| GET | `/images/:imageId` | Image metadata and characters (names and icons only) |
| POST | `/games` | Create a game. Body: `{ imageId }` |
| POST | `/games/:gameId/start` | Start the game and set `startedAt` |
| GET | `/games/:gameId` | Restore state: found characters, `startedAt`, `serverNow`, status |
| POST | `/games/:gameId/guess` | Submit a guess. Body: `{ characterId, x, y }` |
| POST | `/games/:gameId/score` | Save a score. Body: `{ playerName }` (1 to 20 characters) |
| GET | `/games/images/:imageId/scores` | Leaderboard for an image (paginated) |

Errors share one shape:

```json
{ "error": { "code": 409, "message": "Game is not in progress" } }
```

## Running locally

**Requirements:** Node.js 18 or newer and a PostgreSQL database.

```bash
git clone <your-repo-url>
cd Where-is-Waldo-
```

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/waldo"
DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/waldo"
FRONTEND_ORIGIN="http://localhost:5173"
PORT=8070
```

Then create the tables, seed the data, and start the server:

```bash
npx prisma migrate dev
node prisma/seed.js        # adjust the path to where your seed file lives
npm start
```

On Windows, stop the server before running `prisma generate` or `migrate dev`, or you'll get an `EPERM` file lock error.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8070/api
```

```bash
npm run dev
```

Open http://localhost:5173.

## Adding a photo

1. Put the image in `frontend/public/` (for example `image2.jpg`) and character icons in `frontend/public/icons/`. Use lowercase names with no spaces, because Linux hosts are case sensitive.
2. Add it to the seed with its real pixel size and the character boxes as fractions of the image (0 to 1):
   ```js
   {
     slug: "beach",
     title: "Beach Day",
     url: "/image2.jpg",
     naturalWidth: 1024,
     naturalHeight: 1024,
     characters: [
       { name: "Waldo", iconUrl: "/icons/waldo.png", xMin: 0.03, xMax: 0.09, yMin: 0.39, yMax: 0.47 },
     ],
   }
   ```
3. Run the seed again. It uses upserts, so reruns update existing rows instead of duplicating them.

## Deployment

| Service | Settings |
|---|---|
| **Neon** | Use the pooled string (`-pooler` host) as `DATABASE_URL` and the direct string as `DIRECT_URL` |
| **Render** (root `server`) | Build: `npm install && npx prisma migrate deploy`. Start: `npm start`. Env: `DATABASE_URL`, `DIRECT_URL`, `FRONTEND_ORIGIN` |
| **Vercel** (root `frontend`) | Build: `npm run build`. Output: `dist`. Env: `VITE_API_URL=https://where-is-waldo-eyxu.onrender.com/api` |

Notes:

- `FRONTEND_ORIGIN` must match the frontend's origin exactly, with no trailing slash. Preview deployments are different origins.
- `VITE_API_URL` is read at build time, so redeploy the frontend after changing it.
- The server sets `trust proxy` so the rate limiter sees real client IPs behind Render's proxy.
- Seed against Neon with `migrate deploy` and the seed script from your machine, using the Neon connection strings in your shell. Never run `migrate dev` or `migrate reset` against production.

## Possible improvements

- Per-IP rate limiting on score submission
- Thumbnails separate from full-size images
- Pagination controls on the leaderboard
- Tests for the guess service and hit detection