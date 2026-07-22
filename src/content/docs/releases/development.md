---
title: Development channel
description: Experimental, unsupported documentation for the rolling FreeSense 1.1 line.
channel: devel
support_tier: development
---

:::danger[Experimental — no support]
Development 1.1 is experimental. It is intended for contributors, integration testing, and
disposable lab systems only. It receives no production support commitment.
:::

Development follows current 1.1 work. Builds can contain feature changes, short retention windows,
and defects that require recovery or reinstall. A build having passed signature, integrity, and
boot-smoke checks means it is the artifact the project produced; it does not make that build a
supported release.

The System and optional-package repositories move independently. System-only changes do not force
an optional-package rebuild. Optional packages rebuild when their sources change or an accepted
FreeBSD platform pin changes their input fingerprint.

Before testing, export the configuration, retain a tagged Stable installer, and read
[Updates and release channels](/guides/updates-and-channels/). Upgrading from 1.0.x to 1.1 is a
one-way updater transition: returning to 1.0 requires booting an intact 1.0 environment or
reinstalling a 1.0.x image.

The exact current build remains discoverable from the live Development release document and the
provenance attached to its artifact. Package availability is defined by the
[curated catalog](/packages/catalog/), not by a generic FreeBSD repository.
