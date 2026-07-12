---
title: Hardware and virtualization
description: Choose a FreeSense appliance or virtual machine that can sustain its enabled services.
channels: [devel, candidate, stable]
last_verified_release: development
---

FreeSense targets **amd64** systems and supports both UEFI and legacy BIOS boot. Treat the firewall as an appliance: select hardware for the traffic, encryption, inspection, and log retention you actually enable rather than for the base install alone.

## Starting profiles

| Profile | CPU | Memory | Storage | Network |
| --- | --- | --- | --- | --- |
| Lab or light edge | 64-bit dual core | 4 GB | 16 GB SSD | 2 interfaces or VLAN-capable NIC |
| VPN and services | 4 cores | 8 GB | 32 GB SSD | Intel or well-supported multi-port NIC |
| Inspection and retention | 4+ cores | 16 GB+ | 64 GB+ SSD | NICs sized for sustained traffic |

Suricata, ntopng, pfBlockerNG feed processing, large log retention, and encrypted VPN throughput can move a system from the first profile into the third. The Package Manager labels packages as lightweight, moderate, or intensive to make that tradeoff visible before installation.

## Interfaces

An appliance normally uses a dedicated WAN and LAN interface. A single physical interface can be used for a lab or trunk design when the upstream switch carries VLANs, but that design requires a reliable management VLAN and careful recovery planning.

Use predictable, well-supported NICs. Before deploying remotely, test link state, VLAN tagging, offload behavior, and console access on the actual hardware.

## Virtual machines

FreeSense can run as a virtual appliance when the hypervisor can present stable virtual NICs and serial or virtual-console access. Keep WAN and LAN on separate virtual networks, reserve resources for inspection workloads, and take a configuration backup before changing virtual switches.

Install **Open VM Tools** only when the virtualization platform uses it. The package is part of the supported catalog and is documented as a guest-integration service, not as a firewall feature.

Next: [install FreeSense](/getting-started/installation/).
