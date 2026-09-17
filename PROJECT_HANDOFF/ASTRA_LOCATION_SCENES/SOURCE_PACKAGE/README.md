# Exact Astra v1 source-package preservation

This directory preserves the original `everthread-location-scenes-v1.zip` as a lossless, non-runtime handoff artifact.

The original archive is 89,718,869 bytes and has SHA-256:

`220503b851ef4e49a79ff3bc553ca887effb7e23733de1ab2f6e30e555d2f3f1`

GitHub browser/mobile uploads cap a single file at 25 MiB, so the archive is split into four raw byte parts. `PARTS.sha256` records the expected part hashes. Upload all four files together into `parts/` without renaming them. `parts/README.md` contains reconstruction instructions.

The extracted lightweight references most useful during audits are mirrored under `../SOURCE_REFERENCE/`, so a fresh chat normally does not need to reconstruct the 86 MiB source ZIP just to select or inspect the next location.

This package is design provenance only. Do not feed it to the Everthread overlay importer and do not bulk-copy it into runtime `public/` assets.
