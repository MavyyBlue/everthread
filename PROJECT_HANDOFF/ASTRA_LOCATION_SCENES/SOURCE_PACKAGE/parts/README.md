# Astra source archive parts

This directory is intentionally created by the documentation/handoff overlay before the large binary pieces are uploaded.

The exact original `everthread-location-scenes-v1.zip` is **89,718,869 bytes** and could not be committed through GitHub's browser/mobile path as one file; that path also rejected the initial 24 MiB split (24 MiB = 25,165,824 bytes). The archive is therefore preserved losslessly as five raw byte parts, each no larger than 20,000,000 bytes. Run #222 certifies all five authoritative parts present here, with no duplicate archive chunks remaining elsewhere in the repository.

Reconstruct from the repository root on a local checkout:

```bash
cat PROJECT_HANDOFF/ASTRA_LOCATION_SCENES/SOURCE_PACKAGE/parts/everthread-location-scenes-v1.zip.part-* \
  > /tmp/everthread-location-scenes-v1.zip
sha256sum /tmp/everthread-location-scenes-v1.zip
```

The reconstructed SHA-256 must equal the value in `../ORIGINAL_PACKAGE.sha256`:

`220503b851ef4e49a79ff3bc553ca887effb7e23733de1ab2f6e30e555d2f3f1`

Then extract the ZIP into a temporary review directory. Never copy the full source archive into `public/` and never treat the original Astra action map as gameplay authority. Only the selected background/prop for one certified location slice belongs in runtime assets.
