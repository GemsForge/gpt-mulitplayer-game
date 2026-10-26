# Challenge-ready release

## Purpose

This release gate prepares Chromalock for the Handshake challenge demonstration.

## Current checks

- GitHub Actions runs on pull requests and pushes to `master`.
- Dependencies are installed with `npm ci`.
- The production build runs with `npm run build`.
- TypeScript compilation is included in the production build command.

## Required before challenge submission

- Add automated unit tests and publish coverage results.
- Add keyboard-only and accessibility smoke checks.
- Test two browser sessions completing one cooperative level.
- Confirm the deployed build is playable by two users.
- Complete QA review and Code Review remarks before merge.

## Evidence

Every release PR must link its workflow run, record the test commands and results,
and include a short gameplay recording or screenshots for player-facing changes.
