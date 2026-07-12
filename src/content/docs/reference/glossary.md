---
title: Glossary
description: Terms used in FreeSense configuration, package, and release documentation.
channels: [devel, candidate, stable]
last_verified_release: development
---

**Build set** — The resolved source, ports, OS-definition, and FreeBSD revisions consumed by a build.

**Candidate** — An immutable release artifact undergoing acceptance testing before any Stable promotion.

**Channel** — Development, Candidate, or Stable publication stream with a distinct support promise.

**Capability** — A declared package behavior with security or operational impact, such as packet inspection or firewall modification.

**Intensive package** — A package expected to need notable CPU, memory, storage, or sustained I/O capacity.

**Package catalog** — The machine-readable inventory of supported package integrations and their services, capabilities, resource profiles, and WebUI destinations.

**Promotion** — Publishing an already-tested candidate as Stable without recompiling it.

**Reserved table** — A FreeSense-owned firewall table maintained by an integration, such as CrowdSec decisions.

**Sealed provenance** — The immutable commits recorded with a build artifact and its documentation.
