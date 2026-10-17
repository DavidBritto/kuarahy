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
- Delivery strategy: `ask-on-risk`. Forecast: roughly 350-500 authored changed lines; review commits as separate work units and ask before a PR chain if the accumulated authored count exceeds 400.

## Authorized scope
The user's approval covers implementing a verifiable Decider 2B and Bedrock integration with clearly identified demo fallbacks. Remote execution and credentials are not authorized.

## Tasks
- [ ] T1 — Implement the upstream Decider choice request/response contract, runtime validation, configured endpoint wiring, and honest fallback provenance with focused tests. Route: delegated writer (multiple non-trivial files and preparation reads). Acceptance: a valid mocked `/v1/systemone` response yields real-engine provenance; absent/failed/malformed responses yield explicit local fallback. Checks: focused Vitest, full `npm test`, typecheck, lint on touched files. Commit: pending.
- [ ] T2 — Make Bedrock synthesis provenance explicit and usable with the AWS SDK default credential chain only when deliberately enabled; cover success, failure, and offline paths with tests. Route: delegated writer (multiple non-trivial files). Acceptance: real Bedrock attribution only after successful Converse response; offline/failure never masquerades as model output. Checks: focused Vitest, full `npm test`, typecheck, lint on touched files. Commit: pending.
- [ ] T3 — Surface provenance in the demo and reconcile reusable-pattern/submission documentation with actual capabilities, without unmeasured latency or energy claims. Route: delegated writer (multiple non-trivial files). Acceptance: UI and documentation clearly distinguish live from simulated behavior; no claim of a live AWS invocation without evidence. Checks: full `npm test`, typecheck, lint, build if environment permits, structural readback. Commit: pending.

## Evidence and next step
- Baseline: 24/24 tests pass; lint has a pre-existing `SolarHeatmap.tsx` error; build is blocked by Google Fonts network access in the sandbox.
- Next: implement T1 with upstream schema fixtures and no live network calls.
