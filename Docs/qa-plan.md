# Collaborative Multiplayer Game — QA Plan

## 1. Purpose and scope

This plan defines the smallest reliable test strategy for the game as it moves
from the current static hot-seat prototype toward a React + TypeScript,
collaborative multiplayer release.

The tested experience must include:

- A player creating or joining a room with a valid room code.
- Two named characters seeing the same game state in separate browser sessions.
- Turn ownership, card reveals, matches, misses, blooms, rounds, and win/loss
  state remaining synchronized.
- Recovery from refresh, reconnect, duplicate actions, and a disconnected peer.
- A custom theme and character presentation that does not reduce usability or
  accessibility.

The current repository is a dependency-free HTML/CSS/JavaScript hot-seat
prototype. It has no `package.json`, React/TypeScript toolchain, or automated
test harness, and its README describes synchronization as future work. Those
facts are release risks, not reasons to waive the multiplayer gates below.

## 2. Quality risks and test priorities

| Priority | Risk | Test focus |
| --- | --- | --- |
| P0 | Two clients diverge or both act out of turn | Authoritative state, turn locking, ordered events, reconnect/resync |
| P0 | A room or player can access another room's state | Room isolation, join authorization, invalid/expired codes |
| P0 | A game can be declared complete incorrectly | Deterministic win/loss rules, countdown boundary, duplicate-event handling |
| P1 | Refresh or network loss destroys progress | Snapshot restore, reconnect, graceful leave/rejoin |
| P1 | Theme/characters obscure game feedback | Contrast, focus, reduced motion, readable status announcements |
| P1 | Browser-specific interaction failures | Desktop/mobile smoke matrix and clipboard/dialog behavior |
| P2 | Poor onboarding or unclear collaboration | Join flow, turn affordance, how-to-play, empty/error states |

## 3. Test layers and ownership

### Unit tests — developer-owned, QA reviewed

Test pure domain functions in isolation:

- Board generation creates valid pairs with no accidental unmatched color.
- Shuffle/randomization preserves the card count and pair count.
- A match increments blooms exactly once.
- A miss advances the turn exactly once.
- Solar-wind depletion clamps at zero and cannot become negative.
- Round reset and new-round transitions restore the documented initial state.
- Invalid actions—wrong player, already revealed card, duplicate event, or
  action after game over—are rejected without state mutation.
- Character and room identifiers are validated and escaped at the UI boundary.

### Integration tests — developer/QA pair

Use a test server or deterministic multiplayer adapter to verify:

- Create room → join room → both clients receive the same initial snapshot.
- Player A acts → Player B receives the same ordered update and UI result.
- Player B cannot act during Player A's turn; the server remains authoritative
  even if the client sends a forged action.
- A matching pair, miss, round change, reset, and game completion propagate to
  both clients exactly once.
- Simultaneous actions resolve deterministically and leave both clients on the
  same state/version.
- Reconnect rehydrates the latest state without replaying an action twice.
- Room teardown prevents a former participant from receiving later events.

### End-to-end/browser tests — QA-owned

Run with two isolated browser contexts, not two tabs sharing storage. Capture
screenshots or logs for each release-candidate run. Prefer deterministic test
fixtures so a known pair can be selected without relying on random play.

## 4. Acceptance checks

### Room and collaboration

- [ ] A host can create a room and receives a shareable code.
- [ ] A second browser can join with the valid code and sees the same room,
  characters, round, board, turn, and progress.
- [ ] Invalid, expired, full, and malformed codes show actionable errors and do
  not expose room data.
- [ ] A third participant is rejected or handled according to the product rule;
  the behavior is documented and tested.
- [ ] Each player has a distinct identity/character and the active player is
  obvious without relying on color alone.

### Core game rules

- [ ] Only the active player can reveal a card.
- [ ] A player cannot reveal the same card twice or reveal while the board is
  resolving a pair.
- [ ] A correct pair is shown to both players, counted once, and remains
  matched after refresh/reconnect.
- [ ] An incorrect pair is shown briefly, then hidden consistently for both
  players; turn ownership changes once.
- [ ] Bloom progress, round number, and solar-wind value remain identical in
  both clients after every state-changing action.
- [ ] The game ends at the documented win condition or when solar wind reaches
  zero; no further gameplay action is accepted.
- [ ] Reset and new-round controls require the documented permission/confirmation
  and update both clients.
- [ ] The session log communicates meaningful events without duplicating events
  after reconnect.

### Theme and character experience

- [ ] Character names, avatar states, ready/connected state, and turn state are
  visible in the custom theme.
- [ ] Loading, waiting, disconnected, error, and completed states have designed
  UI rather than raw errors or silent failure.
- [ ] The visual theme remains legible at 200% browser zoom and on a narrow
  mobile viewport.

## 5. Browser smoke suite

Run this short suite on every pull request that changes gameplay, networking,
layout, or accessibility. Use latest stable Chrome, Firefox, and Safari on
desktop; latest iOS Safari and Android Chrome for the mobile pass.

1. Load the app with no console errors and no failed required network requests.
2. Create a room, copy the code, and confirm the copy status/fallback message.
3. Join from a second isolated browser context; verify both players and the
   initial board are present.
4. Reveal one known pair in the active client; verify both clients update.
5. Reveal a known miss; verify the pair hides, turn changes, and both logs agree.
6. Attempt an out-of-turn click from the other client; verify no state changes.
7. Complete a bloom and confirm progress, feedback, and solar-wind decrement.
8. Refresh each client at different points; verify the latest shared state is
   restored and no action is duplicated.
9. Simulate offline/online or close one client; verify the remaining player sees
   a clear presence/reconnect state and the room remains consistent.
10. Open and close How to Play with mouse and keyboard; finish with reset/new
    round and confirm both clients agree.

Smoke failure is a release blocker for the affected browser or feature.

## 6. Accessibility strategy

Target WCAG 2.2 AA for the playable flow.

- Keyboard-only: every interactive control is reachable in logical order;
  cards have meaningful accessible names; focus is visible and never trapped
  outside an open modal.
- Screen reader: announce room/join status, whose turn it is, card reveal/miss,
  bloom progress, solar-wind changes, errors, and game completion through
  appropriate live regions without noisy duplicate announcements.
- Semantics: use real buttons for cards/actions, headings in order, a labelled
  game region, and a correctly labelled modal with Escape and close behavior.
- Color and contrast: do not use color as the only signal for player identity,
  turn, match, or error. Check text, controls, focus indicators, and status
  states against AA contrast requirements.
- Motion: honor `prefers-reduced-motion`; no required information may depend on
  animation timing. Ensure the card-resolution delay remains usable.
- Responsive/reflow: test 320 CSS px width, landscape mobile, 200% zoom, and
  text-only/forced-colors conditions where supported.
- Automated checks: run axe or equivalent in CI, but require manual keyboard
  and screen-reader checks because automation cannot verify collaboration or
  interaction clarity.

## 7. Network and resilience checks

Use controlled latency, packet loss, disconnect, and reconnect conditions.

- 0 ms, 200 ms, and 1 s latency: UI must show pending state without allowing
  duplicate actions.
- Temporary disconnect during card reveal, match resolution, reset, and round
  transition: reconnect must converge on the server snapshot.
- Duplicate, delayed, reordered, and stale messages: clients must ignore or
  safely reconcile them using an event ID/version.
- Reconnect after the peer wins or loses: the terminal state remains terminal.
- Refresh before join, during join, and after join: errors are recoverable and
  do not leak a previous room.
- Room expiration and server restart: users see a clear recovery path and no
  false success.

## 8. Defect severity and evidence

- **P0:** security/room isolation issue, data divergence, unrecoverable crash,
  incorrect winner, or a core multiplayer action that cannot complete.
- **P1:** broken join/reconnect, wrong turn/progress, inaccessible core action,
  or failure in a supported browser.
- **P2:** non-blocking visual, copy, or secondary-state issue with a workaround.
- **P3:** polish issue that does not affect comprehension or play.

Every P0/P1 defect should include build/commit, browser and viewport, both
player identities, room/test fixture, exact steps, expected vs actual result,
console/network evidence, and a screenshot or short recording when useful.

## 9. Release gates

### Required before QA sign-off

- [ ] Product acceptance criteria and multiplayer state model are documented.
- [ ] React + TypeScript build, lint, typecheck, unit tests, and integration
  tests pass in CI.
- [ ] Two-context end-to-end suite passes with deterministic fixtures.
- [ ] Chrome, Firefox, Safari, mobile smoke checks pass.
- [ ] No open P0/P1 defects; P2/P3 work is explicitly accepted or ticketed.
- [ ] Room isolation, reconnect, duplicate-event, and terminal-state checks pass.
- [ ] Manual keyboard and screen-reader review is complete; automated
  accessibility scan has no unreviewed critical findings.
- [ ] Production build has no uncaught console errors, secret leakage, or
  debug/test controls enabled.

### Release-candidate gate

- [ ] QA re-runs the smoke suite against the exact release candidate.
- [ ] A fresh-room test and a reconnect test pass in the production-like
  environment.
- [ ] Performance is acceptable on a representative mobile device: initial
  playable screen, join flow, and state update remain responsive under normal
  network conditions.
- [ ] Observability confirms room creation, join, disconnect, reconnect, game
  completion, and server errors without logging sensitive room/player data.
- [ ] Rollback/build artifact and known-issues list are available.

### Current repository disposition

The present static prototype may be smoke-tested as a single-browser visual
demo, but it does **not** satisfy the collaborative release gates because it
has no real room transport, server-authoritative state, separate-client sync,
React/TypeScript build, or automated CI test harness. QA should report those as
P0/P1 readiness gaps for the multiplayer milestone rather than approving them
through visual polish alone.

## 10. Suggested first QA increment

1. Define the shared game-state schema and allowed client actions.
2. Add the React + TypeScript test/build baseline and deterministic fixture.
3. Implement one two-browser happy path: create → join → reveal → match.
4. Add the out-of-turn, reconnect, and duplicate-action tests before expanding
   character/theme polish.
5. Gate each new feature by the browser smoke and accessibility checks above.
