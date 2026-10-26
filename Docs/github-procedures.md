# Chromalock GitHub Procedures

## Purpose

Chromalock follows the same issue-driven development practices used across the other GemsForge projects. Work is planned in GitHub Issues, implemented on issue branches, reviewed through pull requests, verified by automated checks, and merged only after the required gates pass.

## Repository standards

- The default branch is protected.
- Direct pushes to the default branch are prohibited.
- Every code change begins with a GitHub Issue.
- Every implementation change uses an issue branch.
- Every issue branch is merged through a pull request.
- Pull requests must pass required CI checks before merge.
- Code coverage must be reported and meet the project threshold.
- Review comments must be resolved or explicitly accepted before merge.
- Secrets, credentials, and local environment files must never be committed.

## Issue workflow

Create or confirm an issue before implementation. The issue title must use one of these formats:

```text
<type>: #<story-number> <imperative story description>
<type>(<scope>): #<story-number> <imperative story description>
```

Example:

```text
feat: #42 add cooperative color-matching level
feat(ui): #42 add cooperative color-matching level
```

The pull request title must be exactly the same as the story title, including the
story number. Do not create a different PR title or add a second title convention.

The issue should contain:

- User or player value
- Scope and non-goals
- Acceptance criteria
- Relevant feature area
- Testing expectations
- Dependencies or blockers

Simple label and commit vocabulary:

```text
feat
fix
docs
chore
refactor
```

Use the same type vocabulary for issue and pull request labels where possible. Add a
scope only when it improves routing or review clarity. Approved scopes are:

```text
ui
api
ci
<feature-specific-scope>
```

Examples of feature-specific scopes include `colors`, `levels`, `multiplayer`,
`avatars`, and `accessibility`.

## Branch policy

Branches must be created from the current default branch and named with the issue number and a short purpose. The issue and pull request titles must use the same story-number format:

```text
feature/123-color-mixing-level
fix/124-room-reconnect
chore/125-add-playwright
docs/126-hosting-procedure
```

Rules:

- Use the issue number in every branch name.
- Keep one coherent change per branch.
- Do not reuse a completed branch for unrelated work.
- Do not develop directly on `main`.
- Rebase or update the branch before final review when required by repository policy.

## Commit policy

Commits should be focused, readable, and traceable to the issue.

Recommended format:

```text
<type>(<scope>): #<story-number> <imperative summary>
```

Examples:

```text
feat(colors): #123 add pastel target contracts
fix(multiplayer): #124 reject stale room commands
docs(github): #126 define pull request gates
chore(ci): #127 add coverage workflow
refactor(ui): #128 isolate room controls
```

Allowed commit types and scopes:

```text
feat      new behavior
fix       defect correction
docs      documentation only
chore     tooling or maintenance
refactor  structural change without behavior change

ui        interface and player interaction
api       server, transport, or persistence boundary
ci        automation, checks, and delivery workflow
feature   a named Chromalock feature area, such as colors or levels
```

Commit rules:

- Keep commits small enough to review.
- Do not mix formatting-only changes with behavior changes.
- Do not commit generated build output unless explicitly required.
- Do not commit `.env`, `.env.local`, Supabase service-role keys, database passwords, or private credentials.
- Mention verification in the pull request rather than hiding it in a vague commit message.

## Pull request procedure

Open a pull request from the issue branch into the protected default branch.

The pull request title must exactly match the issue title, including the issue number. The pull request body must include the authoritative issue link. The pull request must also include:

- A clear summary of the user-facing outcome
- The linked issue using `Closes #123` or `Fixes #123`
- Scope and non-goals
- Screenshots or a short recording for UI/gameplay changes
- Test commands and results
- Coverage result or changed coverage statement
- Accessibility checks for player-facing changes
- Deployment or migration notes when applicable
- Known limitations and follow-up issues

Suggested pull request template:

```md
## Outcome

## Linked issue
Closes #

## Scope
-

## Verification
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:coverage`
- [ ] `npm run build`
- [ ] Keyboard smoke test
- [ ] Multiplayer browser smoke test

## Evidence

## Known limitations
```

## Coverage policy

Coverage is a merge gate, not an optional report.

Minimum expectations:

- Pure color-mixing rules: 100% branch coverage where practical
- Level and obstacle rules: 90% or higher
- Multiplayer command validation: 90% or higher
- Feature components: meaningful interaction coverage, not snapshot-only coverage
- Critical paths: room creation, joining, player commands, level completion, reconnect, and scoring

The exact global threshold should be set in the test runner after the first baseline measurement. A temporary lower threshold may be accepted only when the pull request documents the gap and creates a follow-up issue.

## Required CI checks

GitHub Actions should run for every pull request:

```text
typecheck
lint
unit-tests
coverage
production-build
accessibility-smoke
```

### Workflow validation rule

Workflow changes must be checked for YAML and shell quoting before they are relied
on as merge gates. Bash regular expressions inside a YAML `run` block must use the
number of backslashes Bash receives at runtime; do not double-escape a regex merely
because it is embedded in YAML. For example:

```bash
pattern='^(feat|fix|docs|chore|refactor)(\([a-z0-9-]+\))?: #[0-9]+ .+'
```

After changing a workflow, verify the rendered workflow on a real pull request and
confirm both a valid and an invalid commit message produce the expected result.
Record any intentional failing gate in the PR instead of treating a successful build
as proof that all policy checks ran.

Playwright should cover at least:

- Two browser contexts joining the same room
- Keyboard-only movement and interaction
- Shared objective updates
- Correct color combination
- Incorrect action recovery
- Level completion and upgrade unlock
- Reconnect or refresh behavior

## Code review policy

Every pull request requires review before merge.

Reviewers should confirm:

- The change matches the issue and acceptance criteria.
- Feature boundaries are respected.
- Domain rules are not embedded in React components.
- Multiplayer state is validated outside the client.
- Color is not the only clue signal.
- Keyboard and accessibility behavior are preserved.
- Tests cover the changed behavior.
- No secrets or unsafe configuration were introduced.
- The change does not silently expand scope.

Review outcomes:

- `Approve`: ready for merge and all gates pass.
- `Request changes`: a required correction remains.
- `Comment`: non-blocking feedback or a documented follow-up.

The developer resolves requested changes and pushes new commits to the same issue branch. The reviewer rechecks the updated pull request.

## Merge and issue closure

Only merge after:

1. Required CI checks pass.
2. Coverage is acceptable.
3. Code review is approved.
4. QA evidence is present for user-facing behavior.
5. Any required product or security gate is complete.

Use the pull request body to close the issue automatically:

```text
Closes #123
```

After merge:

- Confirm the issue closed automatically.
- Confirm the pull request is merged, not merely closed.
- Record any follow-up issues.
- Delete the remote issue branch when safe.
- Keep the default branch deployable.

## Roles and responsibility

### Product Owner

- Defines player value and acceptance criteria.
- Confirms the feature outcome.
- Creates linked follow-up issues when scope changes.

### Scrum Master

- Keeps issue, branch, and PR workflow aligned.
- Tracks blockers and dependencies.
- Confirms process gates are visible.

### Developer

- Implements the issue on its issue branch.
- Adds tests and coverage.
- Updates the PR with verification evidence.
- Resolves review feedback.

### QA

- Rechecks acceptance criteria.
- Runs browser, keyboard, accessibility, and multiplayer scenarios.
- Invokes `@Code Review` on the pull request when code review is required.
- Leaves actionable remarks directly on the pull request for defects, risks, missing tests, or maintainability concerns.
- Approves only when evidence supports readiness and all required remarks are resolved.

### QA and Code Review sequence

1. Developer opens the issue branch pull request with test and coverage evidence.
2. QA runs the required validation scenarios.
3. QA invokes `@Code Review` and reviews the returned findings.
4. QA leaves actionable PR remarks for every blocking issue or required change.
5. Developer fixes the remarks on the same issue branch and pushes new commits.
6. QA rechecks the changed behavior and confirms the remarks are resolved.
7. QA records approval only after the acceptance criteria, coverage, automated checks, and Code Review findings are clear.

QA approval must not be inferred from a green sibling workflow, a successful build alone, or a merged related pull request.

### Reviewer

- Reviews code, boundaries, tests, security, and maintainability.
- Approves or requests changes with actionable feedback.

## Definition of done

An issue is complete only when:

- The acceptance criteria are met.
- The implementation is on an issue branch.
- Tests and coverage are added or updated.
- Required CI checks pass.
- Code review is approved.
- QA evidence is recorded when applicable.
- The pull request is merged into the protected default branch.
- The linked issue is closed by the pull request.
- No secrets or generated clutter were committed.

## Recommended repository files

```text
.github/
├── workflows/
│   ├── pull-request.yml
│   └── deploy.yml
├── ISSUE_TEMPLATE/
│   ├── bug.md
│   └── feature.md
└── pull_request_template.md
```

These procedures should be treated as the project governance baseline before Chromalock begins multiplayer implementation.
