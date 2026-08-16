---
title: Firewall and NAT
description: Build auditable traffic policy, address objects, translations, shaping, and virtual IPs.
---

Firewall policy decides what traffic may cross an interface. Model the desired flow first: source,
destination, protocol, port, direction, translation, logging, owner, and rollback. Use aliases for
reused addresses, networks, ports, and external lists so policy remains readable.

## Rules and aliases

Use **Firewall → Rules** for interface policy and **Firewall → Aliases** for reusable objects.
Rules are evaluated in order, so place narrow exceptions ahead of broader policy and log only what
an operator can review. Test the deny path as well as the allowed path.

## Translation and published services

Use **Firewall → NAT** for port forwards, outbound NAT, 1:1 mappings, and NPt. Every published
service needs a matching translation, interface rule, destination service, certificate or identity
plan where appropriate, and test from outside the source network. Avoid exposing management
services through broad NAT rules.

## Traffic control

Traffic Shaper, limiters, schedules, and virtual IPs affect both application behavior and firewall
matching. Introduce one mechanism at a time and observe queues, states, and traffic graphs before
combining policies.

See [firewall rules and aliases](/configure/firewall-rules-aliases/) and [NAT](/configure/nat/).
