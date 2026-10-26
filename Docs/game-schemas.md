# Chromalock Game Schemas

> **Status:** Canonical architecture contract  
> **Scope:** Domain and content data for the Chromalock cooperative color puzzle game  
> **Audience:** Product, design, frontend, multiplayer, and QA agents

This document defines the canonical content schemas for Chromalock. It is the
source of truth for color libraries, obstacles, character upgrades, rules,
levels, story progression, scoring, instructions, tips, and graphics metadata.
Application code should consume these contracts rather than hard-code level
content inside React components.

## Design principles

- Every level introduces one primary new idea.
- Both players must contribute meaningful information or actions.
- The shared objective and next actionable step must be visually obvious.
- Color is never the only carrier of meaning; use labels, symbols, patterns,
  or state text as well.
- Content is declarative. Rules and multiplayer authority remain in the domain
  layer, while features render validated content.
- IDs are stable, unique, lowercase kebab-case strings. References use IDs,
  never display names.

## Common types

```ts
type Id = string;
type LevelNumber = number;
type Seconds = number;

type LocalizedText = {
  short: string;
  long?: string;
};

type UnlockRequirement = {
  levelNumber: LevelNumber;
  requiredScore?: number;
  requiredUpgradeIds?: Id[];
};

type AccessibilityCue = {
  label: string;
  symbol: string;
  pattern?: string;
  ariaLabel: string;
};
```

## Color libraries

The library is grouped into four canonical families. A color definition must
include a semantic name, display value, non-color cue, and mixing behavior.

```ts
type ColorFamily = "pastel" | "primary" | "blue-ish" | "grayscale";
type ColorMode = "light" | "pigment" | "neutral";

type ColorDefinition = {
  id: Id;
  name: string;
  family: ColorFamily;
  mode: ColorMode;
  hex: `#${string}`;
  textColor: `#${string}`;
  cue: AccessibilityCue;
  meaning: string;
  mixesWith: Id[];
  unlock: UnlockRequirement;
};

type ColorLibrary = {
  id: Id;
  family: ColorFamily;
  colors: ColorDefinition[];
};
```

Canonical family intent:

- `pastel`: the soft visual identity and early approachable targets.
- `primary`: teach the basic ingredients used to create secondary colors.
- `blue-ish`: cool factory signals, routing, and later communication puzzles.
- `grayscale`: onboarding, hidden-color challenges, and contrast states.

## Obstacles

Obstacles modify movement, visibility, timing, or color state. They should
create a communication problem, not random punishment.

```ts
type ObstacleKind =
  | "color-leak"
  | "rotating-filter"
  | "conveyor"
  | "locked-channel"
  | "fogged-symbol"
  | "false-panel"
  | "timed-clue"
  | "reset-gate";

type Obstacle = {
  id: Id;
  name: string;
  kind: ObstacleKind;
  description: string;
  behavior: string;
  counterplay: string;
  affectedPlayerIds?: Id[];
  visualAssetId: Id;
  introducedAt: LevelNumber;
  severity: 1 | 2 | 3;
  recovery: "retry-step" | "lose-time" | "lose-points" | "reset-level";
};
```

## Character upgrades

Workers begin visually bland. Upgrades communicate story progression and may
only affect gameplay when explicitly marked as functional.

```ts
type CharacterId = "worker-a" | "worker-b";

type CharacterUpgrade = {
  id: Id;
  characterId: CharacterId | "shared";
  name: string;
  description: string;
  levelUnlocked: LevelNumber;
  visualChange: string;
  assetIds: Id[];
  gameplayEffect?: {
    type: "reveal" | "ping" | "stabilize" | "none";
    description: string;
    usesPerLevel?: number;
  };
};
```

## Rules

Rules are player-facing constraints or mechanics introduced by a level. They
are distinct from implementation code and should be testable by ID.

```ts
type RuleKind =
  | "movement"
  | "interaction"
  | "mixing"
  | "cooperation"
  | "timer"
  | "accessibility"
  | "failure";

type GameRule = {
  id: Id;
  title: string;
  kind: RuleKind;
  statement: string;
  playerAction?: string;
  introducedAt: LevelNumber;
  enforced: boolean;
  validationNotes: string[];
};
```

## Levels

Levels compose the other schemas. They should not embed arbitrary UI logic.

```ts
type LevelObjective = {
  id: Id;
  title: string;
  description: string;
  orderedSteps: string[];
  targetColorId?: Id;
  requiredPlayerRoles: CharacterId[];
};

type Level = {
  id: Id;
  number: LevelNumber;
  title: string;
  locationId: Id;
  objective: LevelObjective;
  obstacleIds: Id[];
  ruleIds: Id[];
  colorLibraryIds: Id[];
  storyCueId: Id;
  instructionIds: Id[];
  tipCueIds: Id[];
  graphicIds: Id[];
  timeLimitSeconds?: Seconds;
  pointsAvailable: number;
  nextLevelId?: Id;
};
```

## Story progression cues

Story is delivered through concise visual and text changes rather than long
cutscenes. A cue may update the factory, workers, or the shared Spark.

```ts
type StoryCueKind = "level-intro" | "level-complete" | "upgrade" | "ending";

type StoryProgressionCue = {
  id: Id;
  levelNumber: LevelNumber;
  kind: StoryCueKind;
  objective: string;
  location: string;
  obstacles: string[];
  message: LocalizedText;
  visualChanges: string[];
  characterUpgradeIds: Id[];
  sparkProgress: 0 | 1 | 2 | 3 | 4 | 5;
};
```

## Point system

Scoring rewards cooperation and clarity, not only speed. The server or domain
rules engine is authoritative for points.

```ts
type PointEventKind =
  | "step-complete"
  | "cooperative-action"
  | "correct-mix"
  | "helpful-ping"
  | "clue-used"
  | "mistake"
  | "timeout";

type PointEvent = {
  id: Id;
  kind: PointEventKind;
  points: number;
  description: string;
  isShared: boolean;
};

type LevelScore = {
  levelId: Id;
  basePoints: number;
  earnedPoints: number;
  deductions: number;
  cooperationBonus: number;
  completionTimeSeconds?: Seconds;
  events: PointEvent[];
};
```

## Game instructions

Instructions explain stable controls and concepts. They are not the same as
context-sensitive tips.

```ts
type InstructionTrigger =
  | "first-play"
  | "level-start"
  | "new-mechanic"
  | "help-request";

type GameInstruction = {
  id: Id;
  title: string;
  body: string;
  trigger: InstructionTrigger;
  levelNumber?: LevelNumber;
  controls?: Record<string, string>;
  dismissible: boolean;
  priority: 1 | 2 | 3;
};
```

Canonical controls are `WASD` or arrow keys to move, `E` to interact, `Space`
to activate, `Q` to send a partner ping, and `R` to retry the current puzzle
step. Controls must be remappable later without changing level content.

## Tip cues

Tips are short, contextual, and non-blocking. They should appear after a
detectable player need, such as inactivity or a recoverable mistake.

```ts
type TipTrigger =
  | "inactivity"
  | "first-mistake"
  | "timer-low"
  | "missing-cooperation"
  | "new-obstacle";

type TipCue = {
  id: Id;
  text: string;
  trigger: TipTrigger;
  levelNumber?: LevelNumber;
  delaySeconds?: Seconds;
  displaySeconds?: Seconds;
  maxDisplaysPerSession: number;
  relatedRuleId?: Id;
  relatedObstacleId?: Id;
};
```

## Graphics library

Graphics are referenced by stable metadata so assets can change without
changing gameplay content.

```ts
type GraphicCategory =
  | "character"
  | "factory"
  | "color"
  | "obstacle"
  | "ui"
  | "effect";

type GraphicAsset = {
  id: Id;
  name: string;
  category: GraphicCategory;
  path: string;
  altText: string;
  width?: number;
  height?: number;
  animation?: "none" | "pulse" | "float" | "glow";
  supportsHighContrast: boolean;
  license?: string;
};

type GraphicsLibrary = {
  id: Id;
  assets: GraphicAsset[];
};
```

## Relationships

```text
Level
 ├─ objective.targetColorId ──> ColorDefinition
 ├─ obstacleIds ──────────────> Obstacle[]
 ├─ ruleIds ──────────────────> GameRule[]
 ├─ storyCueId ───────────────> StoryProgressionCue
 ├─ instructionIds ───────────> GameInstruction[]
 ├─ tipCueIds ────────────────> TipCue[]
 └─ graphicIds ───────────────> GraphicAsset[]

ColorDefinition ── mixesWith ──> ColorDefinition[]
Obstacle ───────── visualAssetId -> GraphicAsset
CharacterUpgrade ─ assetIds ────> GraphicAsset[]
LevelScore ─────── events ──────> PointEvent[]
```

## Validation rules

1. All referenced IDs must resolve within the content manifest.
2. IDs must be unique within their schema collection and stable across releases.
3. A level must have one objective, one location, and at least one
   cooperation requirement.
4. `requiredPlayerRoles` must contain both players for a cooperative level.
5. `targetColorId` must resolve to a color available from the level's listed
   libraries or be explicitly produced by `mixesWith` dependencies.
6. Every obstacle must have a counterplay, visual asset, recovery behavior,
   and introduction level no greater than the level that uses it.
7. `pointsAvailable` and all positive point values must be non-negative.
8. Deductions may not reduce a level score below zero.
9. Every color must have a name, hex value, and non-color accessibility cue.
10. Timed clues must define both a trigger and a finite display duration.
11. Every instruction and tip must be keyboard dismissible or otherwise
    reachable through the documented control scheme.
12. Graphics must include alt text and must not be the sole carrier of a
    gameplay-critical state.
13. A level may introduce only one primary rule or obstacle unless the product
    owner explicitly marks it as a review exception.

## Small example

```ts
const levelTwo: Level = {
  id: "level-02-production-error",
  number: 2,
  title: "Production Error",
  locationId: "dye-room",
  objective: {
    id: "objective-correct-mint-door",
    title: "Correct the door color",
    description: "Work together to make the door mint.",
    orderedSteps: ["Activate blue", "Activate yellow", "Open the door"],
    targetColorId: "pastel-mint",
    requiredPlayerRoles: ["worker-a", "worker-b"],
  },
  obstacleIds: ["rotating-filter"],
  ruleIds: ["mix-two-colors", "cooperative-activation"],
  colorLibraryIds: ["pastel-library", "primary-library"],
  storyCueId: "story-level-02",
  instructionIds: ["instruction-color-mixing"],
  tipCueIds: ["tip-partner-controls-other-color"],
  graphicIds: ["door-mint", "filter-rotating", "worker-a-badge"],
  timeLimitSeconds: 90,
  pointsAvailable: 500,
  nextLevelId: "level-03-restricted-access",
};
```

This example demonstrates the intended composition: content declares what a
level contains and how it communicates its purpose; feature code interprets
the IDs, domain code validates actions, and the multiplayer server owns the
authoritative result.
