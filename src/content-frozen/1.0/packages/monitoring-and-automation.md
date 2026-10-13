---
title: Monitoring and automation packages
description: Extend observability and maintenance without turning the firewall into an unbounded job runner.
channels: [devel, stable]
last_verified_release: 1.0.5
---

The catalog includes **Telegraf**, **Zabbix 7 agent and proxy**, **node_exporter**, **net-snmp**, **softflowd**, **ntopng**, **Traffic Totals**, **syslog-ng**, **LLDP**, **Neighbor Watch**, **NUT**, and **Open VM Tools**. Use the smallest integration that gives the monitoring system the data it needs.

## Automation

The **Automation** package replaces separate cron, shell-command, and service-watchdog wrappers. It manages scheduled root tasks and service checks through one guarded interface. Schedules are validated and shell control operators are rejected to reduce accidental unsafe composition.

Use automation for small, documented operational tasks. Do not turn the firewall into a general-purpose orchestration host. Put complex provisioning, secrets management, and application deployment in a dedicated automation system.

## Select the data path deliberately

Monitoring agents export information; they should not silently become a second control plane. For
each integration, document the collector address, transport security, credential owner, firewall
rule, data classification, retention, and failure alert. Allow monitoring only between the appliance
and known collectors.

| Package | Use it for | Operational boundary |
| --- | --- | --- |
| Telegraf | Metrics collection and export | Protect output credentials and restrict the collector destination. |
| Zabbix 7 Agent | Host monitoring by a Zabbix server | Permit only the expected server/proxy and test active or passive checks explicitly. |
| Zabbix 7 Proxy | Buffered Zabbix monitoring | Plan local storage and the proxy-to-server credential and network path. |
| Prometheus Node Exporter | Prometheus-format host metrics | Bind and firewall the metrics endpoint; it exposes operational detail. |
| SNMP Agent | Network-management polling and traps | Use strong credentials, narrow managers, and avoid broad read access. |
| softflowd | Flow export | Confirm collector reachability, selected interfaces, sampling/volume, and privacy expectations. |
| ntopng | Local traffic analysis | Intensive: define inspected interfaces, flow retention, disk budget, and UI access. |
| syslog-ng | Structured log forwarding or storage | Send to an approved collector and protect transport, storage, and sensitive log content. |
| Traffic Totals | Local traffic history | Bound retention and confirm its behavior across the expected reboot model. |
| LLDP Service | Neighbor discovery | Enable only on intended layer-2 interfaces; neighbor data reveals topology. |
| Neighbor Watch | Neighbor visibility | Treat discovered addresses and names as operational data, not authorization. |
| Network UPS Tools | UPS monitoring and coordination | Limit control to the intended UPS and protect monitor credentials. |
| Open VM Tools | VMware guest integration | Enable only for supported virtual appliances and restrict hypervisor access. |

## Automation

The **Automation** package replaces separate cron, shell-command, and service-watchdog wrappers.
It manages scheduled root tasks and service checks through one guarded interface. Schedules are
validated and shell control operators are rejected to reduce accidental unsafe composition.

Use automation for small, documented tasks with a named owner. Record command purpose, schedule,
expected output, failure alert, service dependency, and removal condition. Do not turn the firewall
into a general-purpose orchestration host; put complex provisioning and secret handling elsewhere.

## Rollout and verification

1. Start with one collector and a small metric or flow scope.
2. Add a narrow firewall rule and verify encrypted or authenticated transport where supported.
3. Confirm the collector receives expected data with correct timestamps, labels, and source address.
4. Measure CPU, memory, disk, and packet-processing impact during representative traffic.
5. Test collector loss and recovery. Monitoring failure should be visible without causing an outage.
6. Revisit retention and credentials whenever a collector, tenant, or administrator changes.

## Resource planning

ntopng and long-term logging can be intensive. Keep dashboards, flow export, remote metrics, and local retention aligned with the appliance’s CPU, memory, disk, and network capacity.
