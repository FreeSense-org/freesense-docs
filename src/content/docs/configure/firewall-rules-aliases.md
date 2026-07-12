---
title: Firewall rules and aliases
description: Express policy clearly, review it safely, and avoid unmaintainable one-off rules.
channels: [devel, candidate, stable]
last_verified_release: development
---

FreeSense evaluates firewall policy at interfaces. Start with the question: **which source is allowed to reach which destination, using which protocol and port?** Write that answer as a narrow, reviewable rule.

## Rule design

- Put specific allow or block rules before broad rules.
- Scope rules to the ingress interface where traffic enters the firewall.
- Use descriptions that name the service owner and intent.
- Enable logging temporarily when validating a new policy.
- Keep a known-good management path above rules that might block it.

## Aliases

Aliases turn repeated addresses, networks, ports, URLs, or tables into named policy objects. Use them to keep rules readable and to centralize changes. For feeds or package-owned tables, distinguish between data you own and data an integration refreshes automatically.

The CrowdSec integration writes decisions to a reserved FreeSense-owned table. Do not edit its generated table as if it were a hand-maintained alias; manage it through the CrowdSec interface.

## Change workflow

Make one policy change at a time, apply it while console access is available, validate the intended flow, and inspect the relevant firewall log entries. Save a configuration backup before a broad policy rewrite or remote maintenance window.
