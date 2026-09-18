# Exact Astra v1 source-package preservation

This directory preserves the original `everthread-location-scenes-v1.zip` as a lossless, non-runtime handoff artifact.

The original archive is 89,718,869 bytes and has SHA-256:

`220503b851ef4e49a79ff3bc553ca887effb7e23733de1ab2f6e30e555d2f3f1`

GitHub's mobile/web commit path rejected the initial 24 MiB split because 24 MiB equals 25,165,824 bytes. The archive is therefore split into five raw byte parts, each no larger than 20,000,000 bytes. `PARTS.sha256` records the expected part hashes. Run #222 certifies all five exact parts present under `parts/`, with no stray duplicates outside that folder. Concatenating them in lexical order reconstructs the original archive and must produce the SHA-256 above. `parts/README.md` contains reconstruction instructions.

The extracted lightweight references most useful during audits are mirrored under `../SOURCE_REFERENCE/`, so a fresh chat normally does not need to reconstruct the 86 MiB source ZIP just to select or inspect the next location.

This package is design provenance only. Do not feed it to the Everthread overlay importer and do not bulk-copy it into runtime `public/` assets.
