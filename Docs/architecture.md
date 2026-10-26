# Signal Bloom: React + TypeScript Architecture

## Purpose

Signal Bloom is a cooperative multiplayer constellation game. The current
prototype is a useful visual and gameplay reference, but it is a static
HTML/CSS/JavaScript build: `index.html` owns the screen markup, `game.js`
combines game state, DOM rendering, timers, and browser effects, and
`styles.css` owns the visual system. This document defines the quickest safe
path to a maintainable React + TypeScript implementation without changing the
prototype during the planning phase.

The architecture uses feature-oriented programming: code is organized by
player-facing capability first, with shared primitives kept deliberately small.
Features own their behavior and UI; the application shell composes features;
infrastructure adapters isolate networking and browser APIs.

## Architecture principles

1. **Feature ownership over technical folders.** A multiplayer lobby, game
   board, crew panel, and session log each own their UI, state adapters, and
   tests.
2. **Server-authoritative multiplayer.** Clients send intents such as
   `revealCard`; the server validates turns and broadcasts the resulting game
   state. The UI never treats local animation as authoritative state.
3. **Typed contracts at every boundary.** Domain events, snapshots, player
   identities, room codes, and connection status use TypeScript types and
   runtime validation at the network edge.
4. **One-way data flow.** `App` composes features, feature hooks consume a
   session store, and user actions dispatch typed commands. Components do not
   reach into WebSocket or browser APIs directly.
5. **Fast vertical slices.** Keep the first implementation small enough to
   play locally, then replace the transport adapter with a real synchronized
   room without rewriting board components.
6. **Theme is a product boundary.** Characters, color tokens, copy, motion,
   and sound cues live in a theme/identity layer rather than being scattered
   through JSX.

## Target stack

- Vite for the fastest React + TypeScript development loop and static build.
- React with TypeScript and strict compiler settings.
- Vitest + React Testing Library for unit and interaction tests.
- Zod (or an equivalent small runtime validator) for messages received from
  the server.
- A thin WebSocket transport adapter for the first synchronized multiplayer
  slice. The adapter may start with a local mock server so frontend work is not
  blocked by backend deployment.
- CSS Modules or feature-scoped CSS with CSS custom properties for the theme.
  Avoid a large UI framework until the visual language is stable.

## Feature-oriented folder layout

```text
src/
├── app/
│   ├── App.tsx                  # route/session composition only
│   ├── providers.tsx            # theme, session, and error providers
│   └── app.css                  # global reset and app-level layout tokens
├── features/
│   ├── lobby/
│   │   ├── components/          # room creation, join, ready controls
│   │   ├── lobby.types.ts       # lobby view models and commands
│   │   ├── lobby.store.ts       # lobby-specific selectors/actions
│   │   └── lobby.test.tsx
│   ├── constellation/
│   │   ├── components/          # board, star card, bloom feedback
│   │   ├── constellation.types.ts
│   │   ├── constellation.selectors.ts
│   │   └── constellation.test.tsx
│   ├── crew/
│   │   ├── components/          # player cards, turn indicator, readiness
│   │   └── crew.selectors.ts
│   ├── mission/
│   │   ├── components/          # bloom progress, solar wind, round header
│   │   └── mission.selectors.ts
│   ├── session-log/
│   │   ├── components/          # event feed and invite code
│   │   └── session-log.selectors.ts
│   └── how-to-play/
│       └── components/          # accessible help dialog
├── domain/
│   ├── game/                    # pure rules, commands, snapshots, reducers
│   ├── player/                  # player identity and character roles
│   └── room/                    # room identity and connection state
├── infrastructure/
│   ├── multiplayer/
│   │   ├── MultiplayerTransport.ts
│   │   ├── mockTransport.ts     # local two-client development adapter
│   │   └── websocketTransport.ts
│   ├── browser/                 # clipboard, clock, storage adapters
│   └── validation/              # runtime schemas for external payloads
├── theme/
│   ├── theme.ts                 # palette, typography, spacing, motion
│   ├── characters.ts            # Astra, Mica, and future character data
│   └── ThemeProvider.tsx
└── shared/
    ├── components/              # Button, Dialog, ProgressBar, StatusDot
    ├── hooks/                   # only truly reusable hooks
    ├── lib/                     # formatting and deterministic utilities
    └── types/                   # generic cross-feature types only
```

### Import boundaries

- `app` may import features, theme, and infrastructure composition roots.
- `features` may import `domain`, `theme`, and `shared`; one feature should
  not import another feature's private files. Shared feature contracts are
  exposed through an explicit public entry point when needed.
- `domain` must remain framework- and browser-independent.
- `infrastructure` may import domain contracts but never feature components.
- `theme` may provide visual data to features, but character definitions must
  not contain game rules.
- `shared` must stay generic. If a component mentions a star, bloom, room, or
  character, it belongs in a feature instead.

## Core contracts

The server snapshot is the single source of truth:

```ts
type GameSnapshot = {
  roomId: string;
  phase: 'lobby' | 'playing' | 'complete';
  round: number;
  activePlayerId: string;
  players: Player[];
  cards: CardSnapshot[];
  blooms: number;
  bloomGoal: number;
  solarWind: number;
  recentEvents: SessionEvent[];
};

type GameCommand =
  | { type: 'createRoom'; player: PlayerProfile }
  | { type: 'joinRoom'; roomCode: string; player: PlayerProfile }
  | { type: 'setReady'; ready: boolean }
  | { type: 'revealCard'; cardId: string }
  | { type: 'startNextRound' }
  | { type: 'resetSession' };
```

The exact wire format is owned by the multiplayer contract, not by a React
component. Every inbound message is validated before it enters the session
store. The UI renders `GameSnapshot`; it does not independently calculate
turns, blooms, or solar-wind authority.

## Custom theme and characters

The product identity should be “living signal garden,” not a generic space
card game. Establish these named assets before polishing layout:

- **Astra, the Navigator:** orchid/amber palette, maps paths and announces
  whose turn it is.
- **Mica, the Signal Keeper:** aqua/lilac palette, interprets matching signals
  and surfaces cooperative hints.
- **The Lumen Grove:** a shared constellation that grows visibly as the team
  matches pairs.
- **The Solar Wind:** a pressure mechanic represented by motion, sound, and a
  clearly accessible progress meter.

Store character portrait references, labels, accent colors, and voice/copy
style in `src/theme/characters.ts`. Store semantic colors such as
`--color-signal-aqua` and `--color-bloom-orchid` in `theme.ts`; components
should consume tokens rather than hard-coded hex values. Use CSS animations as
feedback, never as the source of game state.

## Team responsibilities

Operate as a small Scrum team with one shared definition of done:

| Role | Owns | Must provide |
| --- | --- | --- |
| Scrum Master / architect | Sprint goal, boundaries, sequencing, blockers, review checklist | Daily delta, decision log, architecture guardrails |
| Product owner | Cooperative fantasy, player value, acceptance criteria, scope cuts | Prioritized backlog and explicit decisions |
| UX / visual designer | Character identity, interaction states, responsive layout, accessibility | Theme tokens, states, and annotated reference screens |
| Frontend engineer | React features, typed state flow, responsive UI, local mock transport | Vertical slices with tests and demoable behavior |
| Multiplayer engineer | Room lifecycle, authoritative commands, reconnect behavior, protocol | Versioned transport contract and server verification |
| QA engineer | Rules, two-client scenarios, accessibility, responsive regression | Repro steps, test evidence, release recommendation |

For a small agent team, one agent may hold multiple roles, but ownership of a
decision stays explicit. Every agent works in a focused feature branch or
worktree, writes tests with behavior changes, and reports outcome, verification,
blockers, and next step. No agent silently changes the protocol or theme
tokens owned by another role.

## Fast implementation plan

### Slice 0 — bootstrap and boundaries (half day)

1. Create a Vite React TypeScript app alongside the existing prototype; do not
   delete the prototype until the new build reaches feature parity.
2. Enable strict TypeScript, ESLint, formatting, and a basic CI check.
3. Add the folder boundaries above and a minimal `App` shell.
4. Record the visual baseline: current copy, room panel, crew, mission, board,
   session log, and help dialog.

### Slice 1 — playable local vertical slice (one day)

1. Move pure card matching, turn changes, bloom progress, and solar-wind rules
   into `domain/game` tests.
2. Build `constellation`, `crew`, and `mission` features against a mock
   session store.
3. Add Astra and Mica character data plus the first theme tokens.
4. Match the strongest visual identity and responsive behavior, not every
   implementation detail of the static prototype.

### Slice 2 — lobby and two-client simulation (one day)

1. Add `lobby` room creation/join/ready states.
2. Implement `mockTransport` with two browser tabs or two simulated clients.
3. Render connection, turn ownership, opponent presence, and reconnect states.
4. Test command rejection for wrong turn, duplicate reveal, and stale room.

### Slice 3 — real multiplayer transport (one to two days)

1. Freeze the typed command/snapshot protocol with the multiplayer engineer.
2. Replace only the transport adapter with WebSocket or the selected hosted
   realtime service.
3. Keep domain rules executable on the authoritative server or shared rules
   package; clients remain presentation and intent dispatchers.
4. Add reconnect/resync and room cleanup before adding cosmetic polish.

### Slice 4 — contest-ready polish (one day)

1. Add bloom transitions, character reactions, sound toggle, and reduced
   motion behavior.
2. Run keyboard, screen-reader, mobile-width, and two-client smoke tests.
3. Capture a short demo path: create room, join room, coordinate a match,
   complete the grove, recover from a disconnect.
4. Ship only after the Scrum Master confirms the Definition of Done.

## Definition of done

- `npm run build`, lint, and tests pass in CI.
- Two players can join the same room, see the same snapshot, and complete a
  round without a refresh.
- Server or authoritative game logic rejects invalid commands and clients
  recover from a reconnect.
- Astra, Mica, Lumen Grove, and Solar Wind are visually coherent across
  desktop and mobile layouts.
- Keyboard focus, dialog semantics, card labels, status announcements, color
  contrast, and reduced-motion behavior are verified.
- Each feature has a clear owner, a focused test, and no forbidden cross-layer
  imports.
- The original static prototype remains available as a fallback/reference
  until the React implementation is accepted.

## Immediate backlog

1. Create the React/Vite TypeScript shell and CI checks.
2. Extract pure game rules from `game.js` into tested domain functions.
3. Define the snapshot/command protocol and mock transport.
4. Build the constellation board as the first feature vertical slice.
5. Apply Astra/Mica theme assets and responsive layout.
6. Add lobby and two-client simulation.
7. Integrate authoritative multiplayer and run the Definition of Done review.

