---
title: Version compatibility
description: How FreeSense documentation, release channels, artifacts, and support state stay aligned.
channels: [devel, candidate, stable]
last_verified_release: development
---

FreeSense documentation follows the same release contract as its artifacts. A published release records four immutable inputs:

| Field | Meaning |
| --- | --- |
| Source | FreeSense core commit |
| Ports | FreeSense ports commit |
| OS definition | Build definition and pinned platform state |
| FreeBSD | Upstream FreeBSD commit used for the artifact |

## Documentation channels

- [Development](/devel/) documents the active development line and can change frequently.
- [Candidate](/candidate/) documents a named release candidate used for acceptance testing.
- [Stable](/stable/) documents a promoted, supported release and must remain immutable.

The site root is a channel chooser. A future stable release will retain its own route, for example `/stable/1.0.0/`, even after a newer stable line exists.

## Compatibility labels

Pages use channel and verification metadata. When behavior differs by channel or release, the page must state the oldest supported version, the current verification target, and the upgrade or rollback boundary. A package guide must not claim support for a retired wrapper or an untested version.

## Current state

The current FreeSense line is Development on FreeBSD 16-CURRENT. Candidate and Stable pages describe the publication model, but they do not imply that a supported Stable artifact exists.
