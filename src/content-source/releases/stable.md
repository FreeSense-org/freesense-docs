---
title: Stable channel
description: The supported, immutable FreeSense 1.0.x production line.
channel: stable
support_tier: supported
---

Stable is the supported FreeSense 1.0.x production line. Its source and build inputs are identified
by Git tags so a published release can be audited and recreated.

The original release is tagged `1.0.0`. Routine feature development is frozen on this line. If a
necessary maintenance or security correction is accepted, it is built, tested, tagged, and
published as an explicit patch release such as `1.0.1`; the earlier artifact remains immutable.

Stable release metadata is published independently at
`https://pkg.freesense.org/v1/releases/stable.json`. Its installer URL points to an immutable object
on `downloads.freesense.org`. The channel document is updated only after the exact installer passes
integrity checks and a KVM boot smoke test and is publicly downloadable.

Moving from Stable to [Development](/releases/development/) is possible, but the updater cannot
downgrade a running 1.1 system back to 1.0. Read [Updates and release channels](/guides/updates-and-channels/)
before changing channels.
