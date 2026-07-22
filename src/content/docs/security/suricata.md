---
title: Suricata 8
description: Deploy the supported FreeSense IDS/IPS integration with validated configuration and bounded event review.
channels: [devel, stable]
packages: [suricata]
capabilities: [packet-inspection, firewall-modification, scheduled-downloads]
last_verified_release: development
---

FreeSense integrates **Suricata 8** as its supported IDS/IPS package. The interface is organized around an overview, protected interfaces, policies and rules, events, network lists, updates, advanced settings, maintenance, and high availability.

## Before enabling inspection

1. Confirm the appliance has capacity for the intended traffic and log retention.
2. Decide whether the deployment is alert-only or inline prevention.
3. Identify management, VPN, and infrastructure networks that need careful pass-list treatment.
4. Plan where alerts will be reviewed and retained.

## Safe configuration changes

FreeSense writes a candidate configuration, validates it with Suricata before activation, and retains the last known-good configuration when validation fails. Use the explicit validation action after substantial rule, interface, or advanced-setting changes. Do not treat a restarted service as proof that policy behaves as intended.

## Events and rules

The Events view reads bounded EVE data and supports interface and event-type filtering. Start by reviewing alerts in detection mode, then tune suppressions, pass lists, and local rules against observed traffic. Move to blocking only after confirming that legitimate traffic is not being matched.

## Operations

- Keep ruleset update schedules intentional and observe failed downloads.
- Test service restart behavior during a maintenance window.
- Record local exceptions with their owner and review date.
- Export or forward security logs before local retention limits are reached.

Suricata is an intensive package. Combine it with ntopng or large block feeds only after confirming memory, storage, and CPU headroom.
