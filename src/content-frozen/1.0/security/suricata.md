---
title: Suricata 8
description: Deploy the supported FreeSense IDS/IPS integration with validated configuration and bounded event review.
channels: [devel, stable]
packages: [suricata]
capabilities: [packet-inspection, firewall-modification, scheduled-downloads]
last_verified_release: 1.0.5
---

FreeSense integrates **Suricata 8** as its supported IDS/IPS package. Its WebUI is organized around
an overview, protected interfaces, policies and rules, events, network lists, updates, advanced
settings, maintenance, and high availability. Suricata is an **intensive** package: size the
appliance for its inspected traffic, enabled features, event volume, and retention policy.

## Before enabling inspection

1. Confirm CPU, memory, and storage capacity for the intended traffic and log retention.
2. Decide whether the first deployment is IDS (alert-only) or inline IPS. Start in IDS unless the
   policy and recovery plan have already been exercised.
3. Identify management, VPN, infrastructure, monitoring, and asymmetric flows that need careful
   pass-list treatment.
4. Define `HOME_NET`, external networks, and the protected interface before enabling rules.
5. Plan where alerts and engine logs are reviewed, forwarded, and retained.

## First deployment

1. Install **Suricata** from **System → Package Manager**, then open **Services → Suricata**.
2. Add one protected interface. Give it a recognizable description and choose IDS or inline IPS for
   that interface. Inline IPS relies on FreeBSD netmap support; verify the installed NIC and driver
   are suitable before choosing it.
3. Configure the network lists used for `HOME_NET`, external networks, and any pass list. Keep
   administration and critical infrastructure reachable during the learning period.
4. Configure rule sources and an update schedule. Rule changes are production changes: record their
   owner and avoid enabling a broad category simply because it is available.
5. Save the interface, use the Overview to validate its configuration, and start or restart the
   service. The Overview reports each configured interface's running state and whether the active
   generated configuration is currently valid.
6. Generate representative permitted and suspicious test traffic, then inspect events before
   considering prevention.

## Safe configuration changes

When a configuration is generated, FreeSense writes a candidate file, runs Suricata's configuration
test against it, and only then atomically replaces the active configuration. If validation fails,
the candidate is rejected and the active file remains in place. The Overview also provides an
explicit **Validate** action for the active configuration.

Use validation after substantial rule, interface, network-list, or advanced-setting changes. A
valid configuration means the engine can parse the generated configuration; it does not prove the
policy is correct or that inline prevention will not interrupt legitimate traffic.

## Rules, pass lists, and suppression

The Events view provides bounded EVE event review with interface and event-type filtering. Start by
reviewing alerts in detection mode. For every change, distinguish the intent:

- A **pass list** exempts specified networks or hosts from appropriate inspection/block behavior.
  Keep it narrow; broad pass lists create blind spots.
- A **suppression or threshold** reduces event noise for a specific, understood condition. It does
  not fix the underlying detection or traffic pattern.
- A **local rule** is a maintained detection policy. Give it an owner, rationale, and review date.
- A **rule enable, disable, or drop action** changes detection or blocking behavior across one or
  more interfaces. Test it with known traffic before relying on it.

Move to blocking only after confirming that legitimate traffic is not being matched and that the
team can quickly undo a false-positive block. In legacy blocking mode, the configured block duration
applies; inline IPS has separate behavior and should be tested as its own deployment mode.

## Rule and data updates

The global settings provide scheduled rule updates, optional live rule swap, and optional GeoLite2
database updates. Choose a schedule that has an owner and a maintenance expectation. A live swap
reloads rules without a full instance restart; if that causes trouble in your environment, disable
it and use the hard-restart behavior during a planned window.

External rule URLs and GeoIP credentials are security-sensitive operational inputs. Restrict who can
change them, record their purpose, and monitor update failures. Do not place account IDs or license
keys in tickets, screenshots, or local-rule comments.

## DNS and IP Blocklists (pfBlockerNG)

DNS and IP Blocklists is the supported pfBlockerNG integration. It downloads and processes DNS and
IP reputation feeds, then applies their results through FreeSense DNS and firewall behavior. It is
also intensive: begin with a small feed set, defined update schedule, and clear owner for false
positives before enabling broad categories.

For every feed, record the source, expected scope, update frequency, licensing or account boundary,
and exception process. Verify a known blocked test case and a known permitted business dependency.
Do not treat a feed as self-validating: failed downloads, changed source format, and over-broad
matches require routine review. Preserve access to a management path that does not depend on a
potentially blocked DNS or IP destination.

## Operate and troubleshoot

- Review the Overview for interface state, configuration validity, and last local rules change.
- Review Events and blocked-host information routinely, with a documented false-positive response
  path.
- Forward or export security logs before local retention limits are reached; treat payload and
  packet logging as potentially sensitive data.
- Test restart behavior in a maintenance window, particularly after changing interface mode,
  netmap-related settings, or ruleset sources.
- Before uninstalling, review the package setting that controls retention of Suricata settings and
  whether Suricata-created blocked hosts are cleared. Choose deliberately; do not assume removal
  preserves or clears either state.

Suricata can coexist with ntopng or feed processors, but do so only after confirming CPU, memory,
storage, and packet-processing headroom under representative load.
