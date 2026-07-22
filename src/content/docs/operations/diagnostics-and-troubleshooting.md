---
title: Diagnostics and troubleshooting
description: Troubleshoot from evidence with bounded tools, logs, and a recoverable change path.
channels: [devel, stable]
packages: [Diagnostics, Automation]
last_verified_release: development
---

Troubleshooting is safest when it starts with an expected path and observable evidence. Record the interface, source, destination, protocol, time, and change that preceded the problem before changing configuration.

## Network Diagnostics package

The supported **Network Diagnostics** package consolidates allow-listed MTR, Nmap top-port, iperf3 client, and ARP tools. It validates targets, ports, and interfaces rather than accepting arbitrary shell input. Use it to test a specific hypothesis, not as a replacement for broad scanning policy.

## A useful sequence

1. Check link state, interface address, gateway status, and time.
2. Inspect the relevant firewall, service, or package logs.
3. Confirm DNS resolution independently from reachability.
4. Test the route and path with bounded diagnostics.
5. Make one reversible change and repeat the observation.

## Recovery

Keep console access for interface, firewall, and routing changes. Export the configuration before maintenance. If an incident involves a package, capture its service state and logs before restarting it; restart can erase the most useful evidence.
