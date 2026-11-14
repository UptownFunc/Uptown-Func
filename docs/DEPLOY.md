<!-- SI-assisted: drafted with Claude Code (Claude Opus 5.5). -->
# Deploying SharpWalk to Vercel (B-4, phase 3.5)

SharpWalk is a **static web app with no backend** (CLAUDE.md, Architecture; plan 7). The deployment is one Vite site.
The Python `pipeline/` is run once, offline, by a person. Its outputs are committed in `public/area/` (C-14), so
Vercel never runs Python. See DECISIONS **DEP-01** for why the pipeline is not deployed as a Vercel service.

## What the repository provides

| File | Purpose |
|---|---|
| `vercel.json` | Single static Vite project: `npm ci`, `npm run build` (runs `tsc --noEmit`, then `vite build`), output `dist/`. Hashed `/assets/*` files are cached for a year. Every response gets `X-Content-Type-Options: nosniff`. No rewrites, no services, no functions. |
| `package.json` `engines` | Pins Node 22.x for the Vercel build. |
| `.vercelignore` | Keeps `pipeline/`, `bench/`, `e2e/`, `scripts/`, `docs/` and test output out of the upload. The build needs none of them. |

There are **no environment variables**, secrets or service bindings. The app fetches only its own static files
(`area/`, `conditions/`, `rover/`), relative to the page URL.

There is **no catch-all SPA rewrite on purpose.** The app has no client-side routes. A rewrite to `index.html`
would turn a missing data file into an HTML page with status 200, and the app would then fail to parse it instead of
reporting the missing file.

## Before you deploy

1. Merge the branch holding `vercel.json` into `main` through a PR (CLAUDE.md step 6). Vercel builds `main` for
   Production.
2. Confirm that `main` builds locally:

   ```bash
   npm ci && npm run build
   ```

   `dist/` should contain `index.html`, `assets/`, `area/`, `conditions/` and `rover/` (about 24 MB).

## Deploy from the Vercel dashboard (recommended)

1. Go to vercel.com, then **Add New... > Project**, and import `UptownFunc/Uptown-Func`. Pick the team (for example
   the Hobby team) that will own the project.
2. If Vercel offers **"Import multi-service project"** or **Services**, do not use it. Choose the single-project
   import with **Root Directory `./`**. Once `vercel.json` is on `main`, Vercel reads the settings from it.
3. Check the settings Vercel shows (they should match `vercel.json`):
   - Framework Preset: **Vite**
   - Root Directory: **`./`**
   - Install Command: **`npm ci`**
   - Build Command: **`npm run build`**
   - Output Directory: **`dist`**
   - Environment Variables: **none**
4. Node.js version: `package.json` pins `"engines": {"node": "22.x"}`, which Vercel uses over the dashboard setting.
   22.x is what the project is built and tested with (Node 22.23.4). Check that **Settings > Build and Deployment >
   Node.js Version** shows 22.x; if the first deploy came from `main` before this file was merged, redeploy once.
5. Click **Deploy**. The first build takes about one minute.
6. Under **Settings > Deployment Protection**, turn **Vercel Authentication off** for Production. The plan's 3.5
   check is that the deploy **opens without a login**, and judges and a second machine must reach it.

## Deploy from the command line (alternative)

Run these from the repository root, after logging in to Vercel in a browser. The Vercel CLI is a deploy tool, not part of the
app stack; the version is pinned so the steps behave the same for everyone (65.16.0, the registry version on 14 Nov).

```bash
npx vercel@65.16.0 login
```

```bash
npx vercel@65.16.0 link
```

Choose the team and create the project `uptown-func` with the settings in `vercel.json`.

```bash
npx vercel@65.16.0 --prod
```

## Verify the deploy (phase 3.5 / G5 evidence)

Record each result in `PHASES.md` (3.5) with the deploy URL and the `main` commit SHA it was built from.

1. Open the Production URL in a **private window** (no Vercel login). The AREA sheet loads with the hillshade,
   contours and the Planning panel, and the footer reads "Independent student project; not affiliated with or
   endorsed by NASA."
2. Open DevTools > Network and reload. Every request returns 200: no 404 for `area/*.bin`, `area/*.png`,
   `conditions/rems.json` or `rover/images.json`.
3. Add a stop on slope-screened ground. A route and a planned margin with a status word appear.
4. Open the Briefing and Field View tabs.
5. Repeat steps 1-4 on a **second machine** (G5 acceptance).
6. Plan 19.3: submit the deploy URL for a FortiGuard web-filter classification check (open item on B-4).

Optional automated check against the live URL: Playwright's `baseURL` is fixed in `playwright.config.ts`, so run the
specs against the deploy only after adding a configurable base URL in a separate change.

## Later deploys

Each push to `main` creates a Production deploy, and each pushed branch or PR gets its own Preview URL.
From the G5 freeze (Sun 15 Nov 13:00), deploy bug fixes only.
