---
title: Monitoring and automation packages
description: Extend observability and maintenance without turning the firewall into an unbounded job runner.
channels: [devel, stable]
last_verified_release: development
---

The catalog includes **Telegraf**, **Zabbix 7 agent and proxy**, **node_exporter**, **net-snmp**, **softflowd**, **ntopng**, **Traffic Totals**, **syslog-ng**, **LLDP**, **Neighbor Watch**, **NUT**, and **Open VM Tools**. Use the smallest integration that gives the monitoring system the data it needs.

## Automation

The **Automation** package replaces separate cron, shell-command, and service-watchdog wrappers. It manages scheduled root tasks and service checks through one guarded interface. Schedules are validated and shell control operators are rejected to reduce accidental unsafe composition.

Use automation for small, documented operational tasks. Do not turn the firewall into a general-purpose orchestration host. Put complex provisioning, secrets management, and application deployment in a dedicated automation system.

## Resource planning

ntopng and long-term logging can be intensive. Keep dashboards, flow export, remote metrics, and local retention aligned with the appliance’s CPU, memory, disk, and network capacity.
