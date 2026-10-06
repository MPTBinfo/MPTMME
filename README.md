# MPTM 2026 Morning Experiences Dashboard

Complete source of the live read-only dashboard, including the login screen, supplied logos and artwork, charts, filters, participant lists, event guide and exports.

## Put this on GitHub

1. Extract this ZIP.
2. Create an empty private GitHub repository named `mptm-2026-dashboard`. Leave the GitHub README, licence and gitignore options unchecked because this package already contains the project files.
3. Open a terminal in the extracted `mptm-2026-dashboard` folder and run:

```sh
git init
git add .
git commit -m "Add MPTM 2026 morning dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mptm-2026-dashboard.git
git push -u origin main
```

Replace YOUR_USERNAME with your GitHub username. Sign in using GitHub's normal browser/CLI flow; you do not need to share your account password with anyone.

## Runtime and local development

This is React + TypeScript with Vinext and a Cloudflare Workers server. It is not a static HTML application: GitHub Pages alone cannot run its server-side login and live-data endpoints. GitHub stores the source; a compatible server host runs the application.

Use Node.js 22.13 or newer and pnpm. The package includes `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The portable development script uses port 5173. Configure these server-side environment values in your local Cloudflare development bindings or hosting provider's secret/environment settings:

- `MPTM_LOGIN_ID` — your chosen login ID
- `MPTM_LOGIN_PASSWORD` — your chosen password, stored as a secret

The existing live site already has the requested login configured. Secrets are deliberately not included in this package and are not embedded in browser code. The `.env.example` file lists the required keys. Do not commit populated `.env`, `.dev.vars` or secret files.

```sh
pnpm exec tsc --noEmit
pnpm build
```

The build produces the Worker entry at `dist/server/index.js`, a generated Worker configuration at `dist/server/wrangler.json`, and browser assets in `dist/client`. Configure the two runtime values on your chosen Worker deployment before using its login. The original site's private ChatGPT access boundary belongs to its host; it does not automatically transfer to another host.

## Source layout

- `app/dashboard.tsx` — dashboard, login, charts, filters, participant views, CSV exports, event guide
- `app/globals.css` — navy/gold responsive theme and print layout
- `app/api/login/route.ts` — server-side credential verification
- `app/api/logout/route.ts` — session-cookie removal
- `app/api/session/route.ts` — session status
- `app/api/data/route.ts` — authenticated, read-only live Google Sheets fetch
- `lib/auth.ts` — HMAC-signed sessions and password comparison
- `lib/data.ts` — CSV parsing, activity/date mapping and deduplication
- `public/` — supplied logos, event artwork and favicon
- `components/ui/` — reusable interface primitives
- `build/`, `scripts/`, `vite.config.ts` — required build/runtime integration

## Live Sheet connection

The spreadsheet ID and raw-tab gid are configured in `app/api/data/route.ts`. The visible source link is in `app/dashboard.tsx`. The source is `Form Responses 1`, with gid `1537816855`. Change both links if moving to another spreadsheet.

Only authenticated requests can retrieve delegate records through the dashboard API. There is no endpoint that writes to Google Sheets. The page refreshes every minute while visible and has a manual refresh button. Google link viewers must retain read access to the source sheet for the server-side export to work.

Selections are deduplicated per normalized participant name/contact, date and activity across repeated activity columns and repeat submissions. The latest matching response supplies coordinator details. The participant view can also show original submission records. All totals come from current source values; none are pre-filled in code.

## Validation already completed

TypeScript and the production build passed. Live CSV handling, phone preservation, blank-row positions, duplicate selections, multiple dates and invalid-date handling were checked. Login/signature logic was checked with test credentials. The deployed-site reference is:

https://mptm-2026-morning-dashboard.rajsingh-innovativev.chatgpt.site

This export does not modify that deployed site. Runtime credentials, Git history, dependencies, build outputs and downloaded delegate records are excluded.
