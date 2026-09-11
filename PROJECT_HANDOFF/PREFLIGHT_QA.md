# Everthread — Canonical Pre-Deployment QA

Everthread uses a two-stage verification model:

1. **Preflight Green** — the exact candidate passes the canonical code/regression/build verifier before packaging or deployment.
2. **CI Green** — GitHub independently runs the same canonical verifier and then successfully creates the certified-source artifact and GitHub Pages deployment.

CI Green remains the release authority. Preflight Green improves iteration speed and catches deterministic failures before upload; it does not replace deployment verification.

## Canonical commands

`npm run preflight` runs the standard release gate:

- engine TypeScript check;
- test TypeScript check;
- the complete regression wall through `npm test` (including all dedicated suites and the AI Interaction Testbench wired into `runRegression.ts`);
- production build.

`npm run preflight:deep` runs the same standard gate plus:

- content audit;
- the existing 1,000-life bulk simulation.

Targeted subsystem tests, focused fixtures, larger simulations, save diagnostics, device QA, accessibility QA, and other specialized techniques remain separate tools and continue to run when relevant. The canonical runner orchestrates existing QA; it does not replace or weaken it.

## Machine-readable evidence

The canonical runner writes `.everthread/preflight-report.json` on both pass and failure. The report records:

- standard/deep mode;
- package version;
- verified commit/baseline when available;
- Node/platform information;
- every stage, command, exit status, and duration;
- failed stage when applicable;
- overall pass/fail status.

`.everthread/` is generated evidence and is not source-controlled.

## Dependency reproducibility

The workflow uses `package-lock.json` + `npm ci` once the lock exists. The first infrastructure run is allowed to bootstrap the missing lockfile exactly once, commit it through the existing build-bot identity, and immediately reinstall from that lock before running the canonical preflight. Future runs fail naturally if `package.json` and the lockfile diverge rather than silently resolving a different dependency graph.

## Certified source baseline

After a successful canonical GitHub preflight, CI creates an `everthread-certified-source-<verified commit>` artifact. It contains:

- `everthread-certified-source.tar.gz` — `git archive` of the exact verified tracked source commit;
- `preflight-report.json` — the successful verifier evidence;
- `certified-source.json` — commit, archive SHA-256, repository, Node major, and artifact metadata.

The artifact is retained for 90 days. It is intended to give future development sessions a byte-exact green source baseline even when ordinary sandbox GitHub cloning is unavailable.

## Candidate development flow

For future feature/fix work:

1. Start from the latest CI-Green certified source artifact.
2. Apply only the candidate changes.
3. Run targeted QA for affected systems.
4. Run `npm ci` and `npm run preflight` against the exact candidate.
5. Package `everthread-source.zip` only after Preflight Green.
6. GitHub imports the overlay, runs the same `npm run preflight`, creates a new certified source artifact, and deploys Pages.
7. Promote the change only after CI Green.

For substantial balance/system milestones, run `npm run preflight:deep` and any additional domain-specific stress/simulation work before standard release preflight.

## Non-negotiable preservation rule

No regression suite, AI testbench, fixture, simulation, invariant check, migration test, or specialized QA technique is removed merely because the canonical preflight exists or because a check is inconvenient. Retiring or replacing a QA asset requires an explicit project decision with a documented reason and equivalent-or-better coverage.
