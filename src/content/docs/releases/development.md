---
title: Development channel
description: Documentation for the current FreeSense development line.
channel: devel
support_tier: development
---

The Development channel follows current FreeSense work. It is for contributors, integration
testing, and disposable lab systems. It is not a production support line.

Use this channel when you need to validate new platform behaviour or package integration before a
candidate is cut. Expect feature changes, short retention windows, and recovery by reinstall when
an experiment cannot be rolled forward.

## What this documentation promises

Development documentation describes the code and package catalog currently built by FreeSense. A
page is only considered current when it has been checked against the source tree, ports tree,
OS-definition repository, or a documented lab test. The exact release set remains available from
the download manifest and the build provenance attached to each artifact.

Before testing, read [Updates and release channels](/guides/updates-and-channels/) and make an
exported configuration backup. Package availability is defined by the
[curated catalog](/packages/catalog/), not by a generic FreeBSD repository.
