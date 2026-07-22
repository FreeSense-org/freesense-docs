---
title: Version compatibility
description: How FreeSense documentation, artifacts, update boundaries, and support state stay aligned.
channels: [devel, stable]
last_verified_release: '1.0'
---

FreeSense documentation follows the same release contract as its artifacts. A published release
records four immutable inputs:

| Field | Meaning |
| --- | --- |
| Source | FreeSense core commit |
| Ports | FreeSense ports commit |
| OS definition | Build definition and pinned platform state |
| FreeBSD | Upstream FreeBSD commit used for the artifact |

## Documentation channels

- [Stable](/stable/) documents the supported, immutable 1.0.x production line.
- [Development](/devel/) documents the rolling 1.1 line and can change frequently. It is
  experimental and receives no support.

Candidate is not an active public channel in this release model. Historical Candidate links remain
only to explain that boundary.

## Update compatibility

The System repository and optional-package repository are separate, but a release always records a
compatible pair. Optional packages are reused across System updates while their package sources and
pinned FreeBSD platform fingerprint remain unchanged.

The updater permits 1.0.x to move to 1.1, but not 1.1 to downgrade to 1.0. Returning requires
booting an intact 1.0 boot environment or reinstalling a tagged 1.0.x image. Documentation must not
describe channel selection as a safe package downgrade.

When behavior differs by line, a page must state its verification target and support boundary. A
package guide must not claim support for an untested version or for experimental Development.
