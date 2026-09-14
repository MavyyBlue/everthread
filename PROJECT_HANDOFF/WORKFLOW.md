# Everthread — Development & Deployment Workflow

## Normal development loop

1. Read `PROJECT_HANDOFF/` and root tracking files.
2. Inspect the exact current repository files affected by the next slice.
3. Design the slice around existing system ownership and save behavior.
4. Implement locally without removing unrelated behavior.
5. Add or expand deterministic regression coverage.
6. Run local syntax/type/runtime sanity checks available in the workspace.
7. Package only intended changed/new/deleted files into `everthread-source.zip`.
8. Mavyy uploads that one ZIP to the repository root.
9. GitHub Actions imports the overlay, commits expanded source, installs dependencies, type-checks, runs regressions, builds, and deploys Pages.
10. Yuki inspects the exact expanded files and the newest Actions run.
11. Only call the slice green after deployment succeeds.
12. Sweep the central player-feedback state.
13. **Immediately synchronize every materially affected handoff/root tracking document before beginning the next implementation slice.**
14. Treat the certified docs-only sync as the newest repository source while retaining the prior gameplay-changing commit separately as the gameplay baseline.

## Mandatory post-cert documentation synchronization

Documentation synchronization is now a release gate, not deferred cleanup.

After every successfully certified **gameplay, feature, fix, migration, or architecture-changing expanded-source commit**, perform an immediate docs-sync pass before beginning the next implementation slice. Update all materially affected sources of truth, including as applicable:

- `PROJECT_HANDOFF/CURRENT_STATE.md`;
- the active phase/program handoff;
- `PROJECT_HANDOFF/ROADMAP.md` when sequencing/status changes;
- `PROJECT_HANDOFF/PLAYER_FEEDBACK.md` when feedback state changes;
- root `DEVELOPMENT.md`;
- root `CHANGELOG.md`;
- root `CONTENT.md` when content/counts changed.

Record the certified run and expanded source, schema, relevant regression counts, ownership decisions, caveats, feedback state, and exact next slice. Never let implementation continue while the handoff still describes the previous candidate as active.

**Recursion guard:** a documentation-only synchronization commit does not require another documentation-only synchronization merely to record its own SHA/run. Once its CI run is Green, it becomes the newest certified repository source; the previous gameplay-changing commit remains separately identified as the gameplay baseline. If the docs-only run exposes a material new fact or failure, correct that before gameplay work resumes.

For the active post-Phase-7 program, read `PROJECT_HANDOFF/LIVING_WORLD_PROGRAM.md`.

## The one-ZIP upload rule

Normal Everthread updates use exactly one file named:

`everthread-source.zip`

Mavyy uploads it to the repository root.

### Why this rule exists

Mavyy develops from mobile. Requiring manual navigation into `src/systems`, `src/tests`, UI folders, and replacement of several same-name files is slow and error-prone. It previously caused partial uploads where new files existed but old integration files remained.

The original bundle importer also used `rsync --delete`, which made partial source ZIPs dangerous: any repository file not present in the ZIP could be removed.

The workflow was changed to a safe overlay importer. The ZIP now contains only changed/new files plus `everthread-patch.json`. The importer overlays those files onto the existing repository and preserves all unrelated files.

### How the overlay works

The bundle contains repository-relative paths, for example:

- `src/systems/SomeSystem.ts`
- `src/screens/SomeScreen.tsx`
- `PROJECT_HANDOFF/CURRENT_STATE.md`
- `everthread-patch.json`

The workflow:

1. checks ZIP paths for traversal/absolute-path safety;
2. extracts into a temporary directory;
3. requires patch manifest format 1;
4. uses `rsync -a` without `--delete`;
5. excludes `.git/`, `.github/workflows/`, and the manifest itself;
6. applies only explicit manifest deletions when needed;
7. removes the uploaded ZIP;
8. commits expanded source back to `main` when permitted;
9. type-checks, tests, builds, and deploys the resulting repository.

Do not revert this to a delete-mirroring importer.

## Bundle rules

- File name for normal updates: `everthread-source.zip`.
- ZIP paths must be repository-relative.
- Include `everthread-patch.json`.
- `format` is currently `1`.
- `delete` must be explicit; never use broad implicit deletion.
- Never include local stubs, temporary compile shims, node_modules, build output, or scratch files.
- Include the handoff/root tracking files whenever current status, certified evidence, roadmap, quality decisions, content counts, or active-slice ownership changed; post-cert synchronization is mandatory before the next gameplay slice.
- Record the known base commit in the manifest for traceability, even though the current importer primarily validates the format.
- Do not include `.github/workflows/` in ordinary patch overlays. Workflow changes are exceptional and should be deliberate.

## Deployment verification

A successful local check is not the deployment gate.

After upload, inspect the newest workflow run and verify:

- Import source overlay: success.
- Install dependencies: success.
- Type-check engine/tests: success.
- Regression suite: success.
- Production build: success.
- Configure/upload Pages: success.
- Deploy Everthread: success.

Also inspect critical expanded files in `main` to prove the intended code, not stale wiring, was tested.

The desired final word is “green” only after all of the above.
