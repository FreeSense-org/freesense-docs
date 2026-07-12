---
title: WebUI menu reference
description: Navigate FreeSense by operational intent while the full generated menu reference is expanded.
channels: [devel, candidate, stable]
last_verified_release: development
---

The WebUI is organized around configuration, status, diagnostics, services, VPN, firewall, and packages. Names may evolve as the Bootstrap 5 modernization continues, so documentation links should prefer the operational destination over a screenshot of a transient navigation layout.

| Intent | Primary area |
| --- | --- |
| Install, update, and manage packages | System and Package Manager |
| Define interfaces, VLANs, gateways, and routes | Interfaces and Routing |
| Create policy and translation | Firewall |
| Configure resolver, DHCP, certificates, and local services | Services |
| Create tunnels and remote access | VPN |
| Review events, logs, traffic, and health | Status and Diagnostics |

Packages add their own Configure and Status paths. The package catalog exposes those paths along with services and capabilities so operators can find an integration without memorizing old menu locations.

The next iteration of this reference will be generated from core menu definitions and package XML, with a CI check that rejects references to removed pages.
