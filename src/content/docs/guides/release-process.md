---
title: Release process
description: How FreeSense candidates are tested, promoted, retained, and rolled back.
---

FreeSense stable releases will be promoted from immutable release candidates. Building and publishing
Stable are separate operations: the release team tests a candidate, records the results, and changes
the Stable channel pointer only after approval. Promotion never recompiles the tested artifacts.

:::caution[Current status]
The 1.0 milestone is an **RC Preview** based on FreeBSD 16-CURRENT. It is unsupported, is not intended
for production, and cannot be promoted to Stable. Stable promotion remains disabled until the base
uses an upstream-supported FreeBSD release.
:::

## Versioning

- `1.0.0-rc.1`: unsupported RC Preview
- `1.0.0`: stable feature release
- `1.0.1`: maintenance or security release
- `1.1.0-dev.<date>.<sequence>`: development snapshot

## Acceptance gates

A release must install in BIOS and UEFI VMs, complete web-UI updates on two independent VMs, preserve
configuration and services, pass FreeSense/pfSense/OPNsense import checks, verify all signatures and
hashes, and complete a rollback drill. Known issues and exact source, ports, OS-definition, and
FreeBSD revisions are recorded with the release.

## Support

There is currently no supported Stable line. RC Preview and Development builds are testing channels
without production support guarantees. Once Stable exists, the current minor line will be supported
and its predecessor will receive critical fixes for at least 90 days.

Security issues should be reported privately through GitHub private vulnerability reporting, not in
a public issue.
