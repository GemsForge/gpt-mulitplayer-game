# Chromalock Technical Dependencies

This document defines the recommended technical stack for Chromalock, a cooperative color-theory puzzle game built with React, TypeScript, and feature-oriented programming. It distinguishes what is already installed from what is planned so the team can move quickly without confusing the prototype baseline with production multiplayer requirements.

## Dependency status

| Area | Current | Planned | Why it is needed |
| --- | --- | --- | --- |
| Runtime | Browser JavaScript runtime; Node.js for local tooling | Node.js 20+ LTS | Runs the Vite toolchain and server-side multiplayer service consistently. |
| UI runtime | `react`, `react-dom` | Keep current versions, pin versions before release | Component rendering, feature composition, and browser mounting. |
| Language | `typescript` with project references | Strict TypeScript contracts across client, server, and shared domain | Prevents drift between game commands, snapshots, levels, and UI models. |
| Build tooling | `vite`, `@vitejs/plugin-react` | Keep Vite; add production environment validation | Fast development server, HMR, and optimized browser builds. |
| Styling | Existing CSS files | Feature-scoped CSS or CSS Modules plus CSS custom properties | Keeps the pastel theme local to features while preserving shared design tokens. |
| UI primitives | Custom React/CSS components | Optional small accessible primitive library only if repeated needs emerge | Avoids slowing the contest build with an oversized design system. |
| Realtime multiplayer | No realtime dependency yet; local UI prototype only | Supabase Realtime channels for the fastest hosted MVP; keep a transport adapter so a dedicated WebSocket server remains possible | Synchronizes rooms, player presence, commands, snapshots, and reconnects. |
| Runtime validation | No validator yet | `zod` | Validates commands and snapshots at the network boundary. |
| Persistence | No production persistence yet | PostgreSQL through Supabase, or a small hosted Postgres service | Stores rooms, player profiles, level progression, and completed sessions. |
| Client state | React state/local feature stores | Keep feature-local state; add `zustand` only if session state becomes cross-feature | Avoids premature state-management complexity. |
| Testing | No test runner configured | `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` | Tests pure color rules, level progression, interactions, and accessible UI behavior. |
| Browser automation | None | Playwright | Verifies two-browser room joining, keyboard play, reconnects, and release smoke paths. |
| Accessibility | Semantic HTML and CSS are the baseline | `eslint-plugin-jsx-a11y`, axe-core via `@axe-core/playwright` | Catches keyboard, focus, text-label, and non-color-only communication issues. |
| Linting/formatting | Not configured in the current manifest | ESLint, `typescript-eslint`, `eslint-plugin-react-hooks`, Prettier | Enforces consistent feature boundaries and safer collaboration. |
| Asset workflow | CSS and local prototype assets | SVG/PNG source assets in `public/assets` or feature-owned asset folders | Supports pastel characters, factory graphics, patterns, and motion without coupling assets to rules. |
| Deployment | Local Vite preview | Static frontend on Vercel/Netlify/Cloudflare Pages with Supabase providing the hosted backend | Keeps the fast React build independent from the authoritative game state. |
| CI | Not configured in the current manifest | GitHub Actions | Runs typecheck, lint, unit tests, build, and selected Playwright checks on every PR. |

## Current dependencies

The repository currently contains the Vite React TypeScript baseline:

- `react` and `react-dom`: UI runtime.
- `typescript`: static typing and compilation checks.
- `vite`: development server and production bundler.
- `@vitejs/plugin-react`: React support in Vite.
- `@types/react` and `@types/react-dom`: TypeScript declarations.

Current commands are:

```bash
npm run dev
npm run build
npm run preview
```

The current baseline does not yet provide authoritative multiplayer, persistence, runtime message validation, automated tests, linting, or CI. Those are planned dependencies, not capabilities to assume in the game UI.

## Hosting decision for the Handshake challenge

Chromalock should use a hosted web architecture rather than storing the complete game in the frontend:

```text
React + TypeScript frontend
        |
        | typed game commands and realtime room updates
        v
Supabase
├── PostgreSQL database
├── Realtime channels
├── Anonymous authentication
└── Edge Functions for validated game actions
```

Host the frontend on Vercel, Netlify, or Cloudflare Pages. Use one Supabase Realtime channel per room, for example `room:AB12`.

### Frontend responsibilities

The frontend may contain and render:

- Color libraries and static level definitions
- Story text, instructions, and tips
- Graphics and animation state
- Keyboard controls
- Local presentation state

The frontend should send typed player intents, not authoritative results. For example:

```ts
{
  type: "activate-color",
  playerId: "player-a",
  colorId: "powder-blue",
  targetId: "door-01"
}
```

### Backend responsibilities

Supabase owns the room and persistent progression. Edge Functions or secured database operations validate:

- Whether the player belongs to the room
- Whether the player is close enough to interact
- Whether the color is available
- Whether the action is allowed for the current level
- Whether both players completed the required steps

The validated result is then broadcast to both players. Do not trust a browser-computed score or level completion because a user can modify frontend JavaScript.

### Persistence boundary

Persist meaningful state only:

```text
rooms
- id
- room_code
- current_level
- status
- created_at

players
- id
- room_id
- display_name
- avatar_state
- connected_at

game_sessions
- room_id
- level
- completed_steps
- discovered_colors
- completed_at

player_upgrades
- player_id
- upgrade_id
- unlocked_at
```

Do not persist every animation, cursor movement, or temporary highlight. Realtime presence and active puzzle state can remain transient while a room is running; save progression after a level is completed.

### Secrets and public configuration

Only the Supabase URL and public anonymous key may be exposed through Vite's `VITE_` variables. Database passwords, service-role keys, signing secrets, and privileged server credentials must remain in Supabase or the hosting provider's secret manager.

This gives the challenge a credible multiplayer architecture without spending the MVP building and operating a separate Node server. If the game later needs authoritative dedicated-server simulation, the feature layer can switch transports without rewriting the React UI.

## Planned dependency groups

### React feature architecture

Keep `src/app`, `src/features`, `src/domain`, `src/infrastructure`, `src/theme`, and `src/shared` as the primary boundaries. A feature owns its components, selectors, view models, and behavior. The domain must not import React or browser APIs. Infrastructure adapts transports, storage, clocks, and validation into domain contracts.

Recommended additions:

```bash
npm install zod
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Use `zustand` only when the session snapshot genuinely needs a shared client store:

```bash
npm install zustand
```

### Multiplayer and persistence

The quickest credible path is a hosted Supabase project using its Postgres database and Realtime channels. The client should still use an infrastructure adapter so the game can later move to a dedicated WebSocket server without rewriting features.

Planned client dependency:

```bash
npm install @supabase/supabase-js
```

The server or edge function remains authoritative: clients send typed intents, the server validates them, updates the game state, persists meaningful progression, and broadcasts a snapshot. Do not persist every animation or cursor movement.

If a dedicated server is selected instead, use a Node.js TypeScript service with a WebSocket library and share a small `packages/game-contracts` package containing commands, snapshots, and Zod schemas. Do not let React components import server code directly.

### Quality and accessibility

Recommended development dependencies:

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-jsx-a11y prettier
npm install -D playwright @axe-core/playwright
```

Testing priorities are pure color mixing and level rules first, then feature interactions, then two-browser Playwright flows. Every color clue must also expose a text label, icon, or pattern so color is never the sole signal.

### Asset and graphics workflow

Use SVG for UI icons, color symbols, patterns, character badges, and simple factory objects. Use optimized PNG or WebP only for raster illustrations. Store source assets with descriptive names and accessible metadata; keep gameplay meaning in TypeScript data, not inside image filenames or SVG internals.

Suggested layout:

```text
public/assets/
  characters/
  factory/
  icons/
  patterns/
src/theme/
  colors.ts
  characters.ts
  graphics.ts
```

The graphics library should provide variants for default, highlighted, completed, warning, disabled, and reduced-motion states.

## Environment variables

Use Vite's `VITE_` prefix only for values safe to expose in the browser. Never place database passwords, service-role keys, or server signing secrets in the frontend environment.

Frontend `.env.local` (planned):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_MULTIPLAYER_TRANSPORT=supabase
VITE_APP_VERSION=0.1.0
```

Server-only environment (planned, not committed):

```bash
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=...
SESSION_SIGNING_SECRET=...
ALLOWED_ORIGINS=https://your-frontend.example
```

Commit `.env.example` with placeholder names only. Add `.env.local` and deployment secrets to `.gitignore` and the hosting provider's secret manager.

## Minimal install/config checklist

1. Confirm Node.js 20+ LTS and run `npm install`.
2. Keep the existing Vite/React/TypeScript baseline building with `npm run build`.
3. Add `zod` and define versioned game commands, snapshots, color definitions, levels, and server messages.
4. Add Vitest, React Testing Library, and jsdom; test color mixing, obstacles, scoring, and one feature interaction.
5. Create the Supabase project and database; use Realtime channels for room updates.
6. Add only public client values to `.env.local`; keep privileged secrets server-side.
7. Implement the transport adapter behind `infrastructure/multiplayer`; keep the UI dependent on typed domain contracts.
8. Add Edge Functions or secured database operations to validate player intents and level completion.
9. Add ESLint, Prettier, and GitHub Actions checks for typecheck, lint, tests, and build.
10. Add Playwright and an accessibility smoke test covering keyboard-only play and two browser contexts.
11. Deploy the static frontend to Vercel/Netlify/Cloudflare Pages and verify room creation, joining, reconnect, level completion, and persistence.

## Dependency decision rule

Chromalock should add a dependency only when it removes meaningful risk or repeated code in a feature. The first release needs reliable cooperative play, clear pastel color communication, accessible keyboard controls, and testable progression; visual polish and optional libraries must not compromise those gates.

## Challenge budget and hosting cost

Chromalock can be built and submitted for **$0** using free plans:

| Service | Recommended plan | Expected cost |
| --- | --- | ---: |
| GitHub | Public repository | $0 |
| Netlify or Cloudflare Pages | Free hosting | $0 |
| Supabase | Free database, authentication, and Realtime | $0 |
| Custom domain | Optional | Approximately $10–20/year |

The recommended challenge configuration is a public GitHub repository, Netlify Free or Cloudflare Pages Free for the React frontend, and one Supabase Free project for PostgreSQL and Realtime. This is sufficient for a prototype, judging demo, and small number of testers.

Supabase's current free plan includes a hosted PostgreSQL database, 500 MB database size per project, 5 GB egress, 1 GB file storage, and 50,000 monthly active users. Free projects may pause after one week of inactivity, so the team should open the project before a live demo and verify the room flow. See the [Supabase pricing page](https://supabase.com/pricing).

Netlify's free plan supports deployment, previews, CDN hosting, SSL, functions, and a monthly credit limit. Sites pause when the free usage limit is reached rather than automatically charging for overage. See the [Netlify pricing page](https://www.netlify.com/pricing/).

Cloudflare Pages provides free static asset hosting, with Pages Functions counted against the Workers free-plan limits. See the [Cloudflare Pages pricing documentation](https://developers.cloudflare.com/pages/functions/pricing/).

### Upgrade scenarios

Paid hosting is not required for the contest. Upgrade only if the project needs production capacity, backups, or sustained public traffic:

- Supabase Pro: approximately **$25/month**.
- Netlify Personal: approximately **$9/month**.
- Netlify Pro: approximately **$20/month**.
- Cloudflare Workers Paid: minimum approximately **$5/month**.
- Custom domain: approximately **$10–20/year**, depending on the domain.

Keep Supabase spend controls enabled and do not add automatic overage billing unless the project needs it. Never put database passwords, service-role keys, or other privileged secrets in the React frontend.
