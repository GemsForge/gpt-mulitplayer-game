# Product Brief: Lanternwake

## One-line pitch

Two players are the only night keepers who can guide a migrating sky-whale through a storm by combining different pieces of information: one reads the living weather, while the other conducts the whale's memory-song.

## Why this is unique

Lanternwake is a cooperative communication game, not a shared board with duplicated controls. Each player has an intentionally incomplete view of the same crisis. Success comes from translating observations into short, actionable directions under pressure. The game makes the relationship between players the main mechanic: nobody can solve a route alone, and both players' actions visibly change the world.

## Custom world and characters

- **The setting:** The Lumen Belt, a hand-painted midnight sky where floating reefs, storm ribbons, and memory-lanterns drift around sleeping sky-whales.
- **Mira Quill, the Weather Listener:** Reads wind lanes, hazards, and hidden safe currents. Mira can briefly reveal a route fragment, but cannot steer the whale.
- **Oru, the Songwright:** Shapes three-note memory-songs to make the whale turn, rise, or rest. Oru can steer, but cannot see the correct route.
- **The whale, Nettleback:** A character rather than a vehicle. Its mood, scars, and remembered lantern colors change between rounds and provide emotional feedback.

## Core loop

1. A five-minute migration begins with a randomly assembled route and a shared storm meter.
2. Mira scans the weather map and calls out landmarks, hazards, and a safe sequence using natural language or quick-ping icons.
3. Oru interprets the callout and performs the matching three-note input to steer Nettleback through the next gate.
4. Correct teamwork lights a memory-lantern, expands the whale's trust, and reveals more of the route; mistakes reshape the storm and remove time.
5. The pair reaches the aurora gate, or the storm catches them. A short “what we learned” recap and a new route seed make replay immediate.

The MVP uses a synchronized room with two roles, a deterministic round seed, role-specific information, shared state updates, reconnect-safe turn/action handling, and a visible event log so players can understand cause and effect.

## MVP scope

- Create/join a room with a short code and nickname.
- Assign or swap the two roles before the round starts.
- One playable migration route with at least three gates, three hazard types, and a five-minute pressure timer.
- Distinct role views: Weather Listener sees route information; Songwright sees song controls and whale feedback.
- Shared state: storm meter, trust/lantern progress, current gate, round result, and activity feed.
- Real-time cooperative actions with clear success, error, reconnect, and “other player is thinking” states.
- Custom illustrated UI theme, character cards, responsive layout, sound-safe visual feedback, and keyboard-accessible controls.
- A lightweight end-of-round result that shows route outcome, teamwork score, and a “play again” action.

## Contest-facing acceptance criteria

The MVP is accepted when:

- Two browser clients can join the same room and complete or fail a full round together without refresh.
- The two clients receive materially different information and neither role can complete the route independently.
- At least one correct and one incorrect collaboration path produce visibly different synchronized outcomes.
- Every player action gets an immediate local acknowledgement and a shared result within one second on a normal connection; duplicate or late actions do not corrupt the round.
- A disconnected player can reconnect to the active room and recover the current round state, or receives a clear recoverable error.
- The custom characters, setting, color system, and feedback are present throughout the playable flow; no placeholder “generic card game” screen remains.
- A first-time player can understand the objective and make a meaningful first action in under 60 seconds without external instructions.
- The game is playable with keyboard navigation, readable focus states, sufficient contrast, and text/icon feedback that does not depend on color alone.
- The interface works at mobile and desktop widths, and the happy path has no console errors.
- A reviewer can run the app from the repository README and see a working React + TypeScript build with feature-oriented source boundaries.

## React + TypeScript architecture direction

Use a small feature-oriented structure so agents can work in parallel without editing one giant component:

```text
src/
  app/                 # routing, providers, app shell
  features/lobby/      # room creation, join, role selection
  features/migration/  # route, storm, gates, round state
  features/roles/      # Weather Listener and Songwright experiences
  features/realtime/   # room connection and event protocol
  features/results/    # outcome, teamwork score, replay
  shared/ui/           # buttons, panels, modal, status primitives
  shared/theme/        # tokens, illustrations, character assets
```

Keep domain state and event types separate from rendering. The first implementation can use a minimal room service or a local development adapter behind the same realtime interface; the contest demo must make the collaboration experience real and observable.

## Scrum team and first slice

- **Product Owner / Game Designer:** owns this brief, player value, scope, and acceptance decisions.
- **UX / Visual Designer:** defines the Lumen Belt visual language, character sheets, role-view wireframes, and accessible feedback.
- **Frontend Engineer:** builds the React + TypeScript shell, feature boundaries, role views, and responsive interaction.
- **Realtime Engineer:** defines room events, synchronization, reconnect behavior, and the local adapter.
- **QA Engineer:** writes the acceptance checklist, tests two-client flows, keyboard access, responsive behavior, and failure states.
- **Scrum Master / Integrator:** keeps the GitHub issue board current, protects small vertical slices, and coordinates integration.

First vertical slice: two clients join one room, receive different role views, exchange one scan/song action, and see the same lantern light up. Do not build a full content system before this slice proves the unique collaboration mechanic.

## Definition of done for the contest demo

The repository is on GitHub with a reproducible README setup, a focused issue/PR history, a passing production build, and a playable two-client demo. The demo must show the unique asymmetric-information loop in the first minute, retain the Lumen Belt identity from lobby through results, and include QA evidence for both success and failure paths.
