# Biblioteca Bookstore Events

A pure HTML / CSS / vanilla JavaScript page for browsing, searching, filtering and adding bookstore events.

## Project structure

```
index.html                  page markup
config.js                   runtime settings (data URL, storage key, loading delay)
css/style.css               styles
script/utils.js             pure helpers (format, filter, validate) - unit tested
script/script.js            DOM / UI logic
assets/data/events.json     default events (data source)
assets/images/              add books.jpg and bookstore1.jpg here
tests/                      automated tests (node:test, no dependencies)
docker/40-config.sh         generates config.js from env vars at container start
Dockerfile                  nginx image
.github/workflows/ci.yml    CI/CD pipeline
```

## Run locally

The page loads `assets/data/events.json` with `fetch`, so it must be served over HTTP
(opening `index.html` by double-click will not load the data).

```bash
npm start            # serves the folder (uses npx serve)
# or
python3 -m http.server 8080
```

## Configuration

All settings live in `config.js`:

| Setting        | Env var         | Default                    | Purpose                                   |
|----------------|-----------------|----------------------------|-------------------------------------------|
| `dataUrl`      | `DATA_URL`      | `assets/data/events.json`  | Where events are loaded from (file or API)|
| `storageKey`   | `STORAGE_KEY`   | `bookstore-events`         | localStorage key for saved events         |
| `loadingDelay` | `LOADING_DELAY` | `400`                      | ms before the loading spinner appears     |

Locally, edit `config.js`. In Docker, set the environment variables instead - no code change needed.

## Tests

Requires Node 22+. No `npm install` needed.

```bash
npm test               # run all tests
npm run test:coverage  # with coverage report
```

Tests cover formatting, escaping/sanitizing, search and category filtering, form validation,
stored-data parsing, and integrity of `events.json` and `config.js`.

## Docker

```bash
docker build -t biblioteca-events .
docker run -p 8080:80 biblioteca-events
# with custom config:
docker run -p 8080:80 -e STORAGE_KEY=events-staging -e LOADING_DELAY=250 biblioteca-events
```

Open http://localhost:8080.

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests:

1. **test** - runs the unit tests with coverage
2. **docker** - builds the image, starts it with custom env vars and smoke-tests the page, data and generated config
3. **publish** - on `main` only, pushes the image to GitHub Container Registry (`ghcr.io/<owner>/<repo>`)

## Images

Add these two files to `assets/images/`:

- `books.jpg` - logo shown in the header
- `bookstore1.jpg` - hero image
