---
title: Core services
description: Operate DNS, DHCP, time, dynamic DNS, and certificate-related services as part of one network design.
channels: [devel, candidate, stable]
last_verified_release: development
---

Core services make the firewall useful to clients, but they also define availability and trust boundaries. Configure them after interfaces and policy have a known-good baseline.

## DHCP and DNS

Create a DHCP scope per client-facing network, reserve infrastructure addresses, and record any options that point clients to internal services. Choose one clear DNS model: a local resolver, an authoritative service such as BIND for hosted zones, or explicit forwarding. Avoid accidental loops between the firewall and another resolver.

## Time and dynamic DNS

Accurate time is required for certificates, logs, and security events. Configure reliable NTP sources before diagnosing TLS or authentication failures. Dynamic DNS should update only the public names that are intended to track a changing WAN address.

## Certificates

Use the ACME package for automated certificate enrollment and renewal where it fits the service design. Treat account keys and private keys as sensitive material, back them up appropriately, and test renewals before the current certificate expires.
