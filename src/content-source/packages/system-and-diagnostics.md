---
title: System, diagnostics, and virtualization packages
description: Operate the official tools that extend diagnostics, automation, and virtual-machine integration.
---

These optional packages add bounded operating capabilities; they do not replace the Base OS
configuration backup, console recovery, or access-control model.

| Package | Use it for | Verify before enabling |
| --- | --- | --- |
| Automation | Scheduled jobs and service-watchdog behavior | Job owner, command scope, notification route, and rollback action |
| Network Diagnostics | Guarded MTR, Nmap, iperf3, and ARP diagnostics | Target authorization, interface selection, and collection impact |
| Open VM Tools | Guest integration for supported VMware deployments | Hypervisor support, guest time, shutdown behavior, and no conflict with host policy |

## Operating boundaries

Use the built-in diagnostics for a first investigation. Add Network Diagnostics only when its
allow-listed tools are required and the appliance has sufficient resources. Treat scan and traffic
generation tools as security-sensitive: obtain authorization, select the interface deliberately,
and save findings outside the firewall if they are needed as evidence.

Automation executes change-adjacent work. Keep every job small, named, reviewed, and observable.
Do not make it the only mechanism for restoring connectivity or applying a critical security fix.

Open VM Tools improves integration with a VMware host; it does not make snapshots a substitute for
a FreeSense configuration backup or a tested restore procedure.

Next: [diagnostics and troubleshooting](/operations/diagnostics-and-troubleshooting/).
