---
title: CrowdSec
description: Use behavioral security decisions as a managed FreeSense firewall input.
channels: [devel, candidate, stable]
packages: [CrowdSec]
capabilities: [firewall-modification, network-monitoring, credential-storage]
last_verified_release: development
---

CrowdSec analyzes configured signals and produces security decisions. The FreeSense integration synchronizes those decisions into a reserved FreeSense-owned firewall table and installs a FreeSense-owned WAN block rule for that table.

## Enrollment and credentials

Use the package interface to configure enrollment. Treat enrollment tokens as one-time secrets: do not store them in tickets, shell history, screenshots, or documentation. Verify that the service is healthy before relying on decisions for blocking.

## Decision flow

1. CrowdSec receives and evaluates configured signals.
2. `cscli` exposes current decisions.
3. FreeSense synchronizes the decisions into its reserved table atomically.
4. The managed firewall rule evaluates that table on WAN traffic.

The decision table is generated data. Manage exceptions or removals through CrowdSec, not by manually editing the generated file.

## Rollout advice

Begin with visibility: inspect decisions, affected addresses, and potential false positives. Keep console access and an out-of-band management path while introducing blocking. Document who owns blocklist review and how urgent false-positive removal is handled.
