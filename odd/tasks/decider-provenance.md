# Decider and Bedrock provenance

## Objective
Make the hackathon decision path use the published Strands Decider HTTP contract when configured, and distinguish real inference from local fallback throughout the API and demo.

## Problem and rationale
The current selector accepts an ad hoc wire format and reports a heuristic fallback as `strands-decider-2b`. Bedrock synthesis can also fall back silently. These claims are not sufficient evidence for the hackathon's required Decider 2B and Bedrock pairing.

## Scope and constraints
- Local source, tests, and documentation only. Do not access AWS credentials, call a configured endpoint, deploy, push, or publish without separate authorization.
- Preserve a useful offline demo, but label simulated decisions and summaries explicitly.
- Use the upstream `POST /v1/systemone` typed choice contract and validate its response before attributing a decision to Decider.
- Use the existing Next.js 16 in-tree documentation before changing route or client behavior.
- TDD mode: not configured (no strict TDD project setting found); use ordinary test-first where practical. Runner: `npm test`.
- Delivery strategy: `ask-on-risk`; user-selected chain strategy: `feature-branch-chain` (standing preference). Forecast: roughly 350-500 authored changed lines. Keep work-unit commits as separate review slices rather than shrinking code to fit a size budget.

## Authorized scope
The user's approval covers implementing a verifiable Decider 2B and Bedrock integration with clearly identified demo fallbacks. Remote execution and credentials are not authorized.

## Tasks
- [x] T1 — Implement the upstream Decider choice request/response contract, runtime validation, configured endpoint wiring, and honest fallback provenance with focused tests. Route: delegated writer (multiple non-trivial files and preparation reads). Acceptance: a valid mocked `/v1/systemone` response yields real-engine provenance; absent/failed/malformed responses yield explicit local fallback. Checks: focused Vitest 22/22, full `npm test` 31/31, `npx tsc --noEmit` pass, targeted ESLint pass, `git diff --check` pass. Commit: `5c14947` (`feat(decider): integrate typed choice API with fallback provenance`). Native assessment: medium, under budget; no review due yet.
- [x] T2 — Make Bedrock synthesis provenance explicit and usable with the AWS SDK default credential chain only when deliberately enabled; cover success, failure, and offline paths with tests. Route: delegated writer (multiple non-trivial files). Acceptance: real Bedrock attribution only after successful Converse response; offline/failure never masquerades as model output. Checks: focused Vitest 6/6, full `npm test` 36/36, `npx tsc --noEmit` pass, targeted ESLint pass, `git diff --check` pass. Commit: `fdc9e9b` (`feat(bedrock): identify live and local synthesis`). Native assessment: medium at 409 changed lines; user granted candidate-scoped review, reliability lens found no blocker, and acknowledgement burned authority for the two-commit slice (`review-bc74290dc3a458f0`).
- [x] T3 — Surface provenance in the demo and reconcile reusable-pattern/submission documentation with actual capabilities, without unmeasured latency or energy claims. Route: delegated writer (multiple non-trivial files). Acceptance: UI and documentation clearly distinguish remote endpoint responses from local simulation; no claim of a live AWS invocation without evidence. Checks: full `npm test` 39/39, `npx tsc --noEmit` pass, targeted ESLint pass, `git diff --check` pass, local HTTP smoke 200 for `/` and `/api/prospect`, documentation structural readback pass. Production build unavailable because Google Fonts could not be fetched in the restricted environment. Commits: `f4af1a5` (UI), `6a2142e` (README/pattern), `e64bd60` (article), `e1fdcba` (bilingual outline), `8c33052` (demo script). Native assessment: UI medium and review acknowledged (`review-a3ba8de2acee2053`); each documentation commit passive, no review due.

## Evidence and next step
- Baseline: 24/24 tests pass; lint has a pre-existing `SolarHeatmap.tsx` error; build is blocked by Google Fonts network access in the sandbox.
- Delivery count: 1,867 native-assessed changed lines across the reviewed T1+T2 range, T3 UI, and four documentation slices (409 + 547 + 183 + 309 + 200 + 219). Proposed feature-branch-chain PR boundaries: T1 `5c14947` (255 Git shortstat lines), T2 `fdc9e9b` (156 Git shortstat lines), T3 UI `f4af1a5` (547 lines, needing a cohesive split or `size:exception`), then documentation commits `6a2142e`, `e64bd60`, `e1fdcba`, and `8c33052` as separate ≤400-line slices. This is a plan, not created PR branches. No PR or push is authorized now.
- T3 UI/API/code/tests committed as `f4af1a5` and reviewed with no finding; local dev smoke returned HTTP 200 for `/` and `/api/prospect` with explicit local fallback labels. The build remained blocked by Google Fonts network access. Documentation now explains that contract/model-name checks cannot independently prove the configured endpoint's binary or checkpoint, and that map tiles/build-time fonts require network access.
- Next: obtain separate authorization and an independently verifiable endpoint/AWS run before claiming actual paired Decider 2B and Bedrock inference. Before opening any PR, resolve the over-budget T3 UI slice under the chosen feature-branch-chain strategy; no remote work is authorized yet.
