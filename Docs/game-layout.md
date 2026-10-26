# Chromalock Game Layout

## Purpose

Chromalock uses a cooperative split-screen layout. Both players occupy the same factory level, but each player receives a different point of view. The layout makes the shared objective obvious while preserving enough private information to make communication necessary.

## Orientation

The game is a 2D top-down room puzzle.

- Players move through a contained factory room.
- Rooms are grid-based or gently tile-snapped for predictable movement.
- The camera does not freely scroll through a large world.
- The exit, active machines, obstacles, and current objective remain easy to locate.
- Players use `WASD` or arrow keys to move.

## Desktop split-screen layout

The desktop view is divided into three horizontal zones:

```text
┌─────────────────────────────────────────────────────────────┐
│ SHARED OBJECTIVE / LEVEL / TIMER                            │
├───────────────────────────┬─────────────────────────────────┤
│ PLAYER A POV               │ PLAYER B POV                   │
│ Astra's private clues     │ Mica's private clues            │
│                             │                                 │
│ room view                  │ room view                       │
│                             │                                 │
├───────────────────────────┴─────────────────────────────────┤
│ SHARED STATUS / EVENT LOG / CONTROL HINTS                   │
└─────────────────────────────────────────────────────────────┘
```

### Shared objective bar

The objective bar remains visible to both players and contains:

- Level number and title
- One-sentence objective
- Target door color
- Color name, symbol, and pattern
- Numbered task steps
- Shared danger or timer meter
- Current level progress

Example:

```text
LEVEL 03 · RESTRICTED ACCESS
Make the door match the target.

TARGET: MINT GREEN  ●  dotted pattern
1. Activate BLUE       DONE
2. Activate YELLOW     ACTIVE
3. Open the door        LOCKED
```

## Player point of view

Each player sees the same room geometry but receives a different information layer.

### Player A: Astra, the Prism Worker

Astra's point of view emphasizes color sources and physical routes.

Visible to Astra:

- Color emitters
- Light beams
- Movable mirrors
- Safe walking paths
- Astra's own interaction range
- Partner location and communication pings

Private information:

- Which color sources are currently active
- Which route a light beam can follow
- Some machine connection indicators

### Player B: Mica, the Filter Worker

Mica's point of view emphasizes filters, timing, and hidden visual clues.

Visible to Mica:

- Filters and lenses
- Timing indicators
- Door symbols and patterns
- Obstacle states
- Mica's own interaction range
- Partner location and communication pings

Private information:

- Which filter changes the target color
- Temporary text clues
- Some door sequence indicators

## Shared versus private information

The design must create cooperation without creating confusion.

### Always shared

- Player locations
- Shared objective
- Door location
- Current level
- Completed task steps
- Danger meter
- Successful actions
- Failure messages

### Player-specific

- Different clue highlights
- Different machine controls
- Temporary text clues
- Hidden route or sequence information
- Which action the player can perform

Private information should always be explainable through communication. It must never require a player to guess randomly.

## Visual hierarchy

The game uses a calm visual hierarchy:

1. Shared objective
2. Player-specific active clue
3. Interactable object
4. Partner ping
5. Background factory detail

Decorative factory elements must remain low contrast and must not compete with active clues.

## Clue language

Every important clue uses at least two signals:

- Color plus a name
- Color plus a symbol
- Color plus a pattern
- Highlight plus an icon
- Timer plus a written countdown

Color is never the only way to understand an objective.

### Highlight rules

- Soft yellow outline: interactable object
- Player-color outline: object assigned to one player
- Pulsing mint outline: next objective step
- Cyan marker: partner ping
- Coral flash: incorrect action
- Lavender glow: temporary clue
- Green check: completed action

## Movement and interaction

Standard keyboard controls:

| Action | Keyboard |
|---|---|
| Move | `WASD` or arrow keys |
| Interact | `E` |
| Activate / confirm | `Space` |
| Place partner ping | `Q` |
| Reset current puzzle step | `R` |
| Pause / controls | `Esc` |

The current interaction target receives a visible outline and a small `E INTERACT` prompt.

## Bottom status bar

The bottom bar is shared and contains:

- Recent communication messages
- Partner pings
- Current interaction instructions
- Error explanation
- Timer announcements

It should show short, actionable text rather than story paragraphs.

Examples:

- `MICA PINGED: FILTER ROOM`
- `ASTRA ACTIVATED BLUE`
- `TARGET UPDATED: ADD YELLOW`
- `CLUE EXPIRES IN 05 SECONDS`

## Responsive behavior

### Desktop and tablet

Use side-by-side split screen. Each player receives an equally sized POV panel.

### Narrow screens

Use a stacked split screen:

```text
┌─────────────────────┐
│ SHARED OBJECTIVE    │
├─────────────────────┤
│ PLAYER A POV        │
├─────────────────────┤
│ PLAYER B POV        │
├─────────────────────┤
│ SHARED STATUS       │
└─────────────────────┘
```

The game should not shrink both views until the board becomes unreadable. A player POV may become temporarily expandable on small screens, but the shared objective must remain pinned.

## Layout acceptance criteria

- Both players can identify their own POV immediately.
- Both players can see the shared objective without switching views.
- Each private clue is visually distinct from shared information.
- Active objects are visible without searching the entire room.
- The player can understand the next action within five seconds.
- The layout works with keyboard controls.
- The game remains understandable without relying on color alone.
- Background decoration never overwhelms task information.
