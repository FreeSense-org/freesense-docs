---
title: Monitoring and logs
description: Use metrics, flow data, traffic analysis, and logs without losing the operational signal.
channels: [devel, stable]
last_verified_release: development
---

Monitoring starts with a question: capacity, reachability, security, or auditability. Enable the smallest collection and retention set that answers that question, then review it regularly.

## Supported integrations

- **Telegraf**, **node_exporter**, **Zabbix 7**, and **SNMP** expose metrics.
- **softflowd** exports flow records.
- **ntopng** provides traffic analysis and requires an intensive resource profile.
- **Traffic Totals** preserves lightweight usage accounting.
- **syslog-ng** forwards and stores log streams.
- **LLDP** and Neighbor Watch provide local topology signal.

## Log design

Synchronize time first. Give every log forwarder a reachable destination and test delivery during a planned change. Define retention, access, and incident-review expectations before turning on high-volume inspection or verbose firewall logging.

## Capacity signal

Watch CPU saturation, memory pressure, disk consumption, interface errors, packet drops, and queue behavior. A monitoring system that reports only “up” can miss the resource exhaustion that makes a firewall unreliable.
