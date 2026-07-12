---
title: Candidate channel
description: Documentation for immutable FreeSense release candidates.
channel: candidate
support_tier: preview
---

Candidate is the preview channel for a sealed FreeSense build set. A candidate is tested as a
specific combination of FreeSense source, ports, OS definition, and FreeBSD revisions. Promotion
changes a channel pointer; it never recompiles the validated artifacts.

Use it for pre-production acceptance testing, compatibility testing, and release feedback. Do not
depend on it for a production support commitment while FreeSense remains on its current development
base.

## Reading a candidate document set

Candidate release notes identify the artifact version, source revisions, package catalog revision,
known limitations, and verification data. If a document needs to differ from Development guidance,
the candidate release notes take priority and link to the appropriate frozen documentation snapshot.

See [Release process and provenance](/guides/release-process/) for the acceptance gates and
[Version compatibility](/releases/compatibility/) for the supported platform boundaries.
