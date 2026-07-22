---
title: Release process
description: How FreeSense builds, verifies, versions, and publishes the Stable and Development lines.
---

FreeSense has two active release lines with different promises:

| Line | Purpose | Support policy |
| --- | --- | --- |
| **Stable 1.0.x** | Production and normal use | Supported; sealed except for explicit maintenance or security patch releases |
| **Development 1.1** | Integration testing, contributors, and disposable labs | **Experimental; no support** |

The release identity is preserved with Git tags. `1.0.0` identifies the original Stable release;
if a necessary security or maintenance fix is made, its tested source is tagged and published as a
new patch release such as `1.0.1`. Routine feature development does not enter the 1.0.x line.

## Independent System and package builds

The System repository and optional-package repository have separate immutable input fingerprints.
That separation avoids rebuilding optional packages for every System change.

1. At 06:00 UTC each day, the System planner resolves the FreeSense source, OS definition, and
   pinned FreeBSD inputs. It builds and publishes a new System repository only when that System
   fingerprint is new.
2. After a successful System check, the optional-package planner resolves the current package
   sources against the selected System closure. It starts a package build only when the package
   fingerprint is new.
3. If only System code changes while package sources and the FreeBSD platform remain compatible,
   the existing optional-package repository is reused.
4. A package-source change or an accepted FreeBSD pin change produces a new package fingerprint and
   therefore a new optional-package build. Shared runner concurrency queues that work safely.

The FreeBSD source, ports, world seed, worker image, and worker tools are content-addressed and
pinned as one reviewed platform input. A scheduled check runs daily at 02:00 UTC but performs the
expensive rollover work only near the end of the active window. It advances the pin by exactly 14
days through one reusable pull request.

## Repository verification and ISO publication

System and optional-package repositories are signed and verified independently. Rolling 1.1
workflows never promote their repositories into Stable. A Stable patch is published manually from
an exact checked 1.0.x release lock, and the Stable pointer can move only to a higher 1.0 patch as
one verified System and optional-package pair.

An installer build consumes an exact matching repository pair. Publication is ordered so a channel
can never advertise an installer that is not actually downloadable:

1. assemble the ISO from the selected signed System and optional-package repositories;
2. verify its completion marker, SHA-256 checksum, size, and build provenance;
3. boot-smoke that exact ISO in KVM;
4. upload it to an immutable path on `downloads.freesense.org` and verify the public object; then
5. publish the small `stable.json` or `devel.json` channel document on `pkg.freesense.org`.

The website keeps no release version in its source. It reads those two channel documents at request
time, so Stable and Development can be published independently without rebuilding the website or
overwriting the other channel.

## Upgrade boundary

Moving from Stable 1.0.x to Development 1.1 is a one-way updater transition. The updater does not
offer a package downgrade from 1.1 to 1.0. To return, boot an intact 1.0 boot environment or install
a tagged 1.0.x image, then continue on the Stable update path from that running 1.0 system.

Before testing Development, export the configuration and keep verified recovery media. Development
is experimental and receives no production or support commitment.

Security issues should be reported privately through GitHub private vulnerability reporting, not
in a public issue.
