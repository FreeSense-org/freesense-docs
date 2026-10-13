---
title: Monitoring and automation packages
description: Choose between the FreeSense packages for metrics, flow export, logging, traffic analysis, neighbor discovery, UPS monitoring and scheduled tasks.
---

FreeSense has twelve Optional Packages for watching the firewall and the networks around it,
plus one for scheduled maintenance. Some export data to a monitoring system you already run,
and some keep the data on the firewall. This page compares them and links to a full guide for
each one. All of them are installed from **System → Package Manager → Available Packages**, as
[Installing and managing packages](/packages/installing-packages/) describes.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64.

## The packages

| Package | Package name | What it does | Where it appears | Resource profile |
| --- | --- | --- | --- | --- |
| [Automation](/packages/automation/) | `Automation` | Runs root commands on a cron schedule and restarts stopped services | **Services → Automation** | Lightweight |
| [ntopng](/packages/ntopng/) | `ntopng` | Inspects traffic on chosen interfaces and shows hosts, flows and applications in its own web interface | **Diagnostics → ntopng Settings**, **Diagnostics → ntopng** | Intensive |
| [Telegraf](/packages/telegraf/) | `Telegraf` | Pushes system, pf and network metrics to InfluxDB, Elasticsearch or Graphite | **Services → Telegraf** | Moderate |
| [Prometheus Node Exporter](/packages/node-exporter/) | `node_exporter` | Serves host and interface metrics for a Prometheus server to scrape | **Services → Prometheus node_exporter** | Lightweight |
| [Zabbix agent and proxy](/packages/zabbix/) | `zabbix-agent7`, `zabbix-proxy7` | Zabbix 7.0 agent for monitoring the firewall; Zabbix 7.0 proxy for collecting a site's data | **Services → Zabbix Agent 7**, **Services → Zabbix Proxy 7** | Lightweight (agent), Moderate (proxy) |
| [SNMP agent (NET-SNMP)](/packages/net-snmp/) | `net-snmp` | SNMPv1/v2c/v3 agent with traps, DTLS/TLS and a trap receiver | **Services → SNMP (NET-SNMP)**, **Services → SNMP Trap Daemon (NET-SNMP)** | Lightweight |
| [syslog-ng](/packages/syslog-ng/) | `syslog-ng` | Collects, stores and forwards logs with flexible routing | **Services → Syslog-ng** | Moderate |
| [softflowd](/packages/softflowd/) | `softflowd` | Exports NetFlow/IPFIX flow records to a collector | **Services → softflowd** | Lightweight |
| [Traffic Totals](/packages/traffic-totals/) | `Status_Traffic_Totals` | Keeps hourly, daily and monthly traffic totals per interface with vnStat | **Status → Traffic Totals** | Lightweight |
| [Neighbor Watch](/packages/andwatch/) | `ANDwatch` | Records IPv4 and IPv6 neighbors (address to MAC pairs) and reports changes | **Services → ANDwatch**, **Status → ANDwatch Database** | Lightweight |
| [LLDP](/packages/lldpd/) | `lldpd` | Announces the firewall and lists neighbors with LLDP and related protocols | **Services → LLDP** | Lightweight |
| [Network UPS Tools](/packages/nut/) | `nut` | Monitors a UPS and shuts the firewall down cleanly on low battery | **Services → UPS** | Lightweight |

In the Package Manager each package appears as `FreeSense-pkg-<package name>`. The monitoring
entries in the **Services** menu are grouped under *Monitoring*. Automation is under *Other*.

The built-in **Services → SNMP** service and the graphs under **Status** need no package. See
[Monitoring and logs](/operations/monitoring-and-logs/).

## How to choose

### By what you already run

| You run | Install |
| --- | --- |
| Prometheus and Grafana | [Prometheus Node Exporter](/packages/node-exporter/) |
| InfluxDB, Elasticsearch or Graphite | [Telegraf](/packages/telegraf/) |
| Zabbix | [Zabbix agent](/packages/zabbix/), plus the [Zabbix proxy](/packages/zabbix/#zabbix-proxy) for remote sites |
| An SNMP-based NMS (LibreNMS, Observium, PRTG and similar) | The built-in **Services → SNMP** for basic polling, or the [SNMP agent](/packages/net-snmp/) for SNMPv3, SET access and traps |
| A NetFlow/IPFIX collector | [softflowd](/packages/softflowd/) |
| A central syslog or SIEM | The built-in remote logging under **Status → System Logs**, or [syslog-ng](/packages/syslog-ng/) for filtering, local storage and several destinations |
| Nothing yet | [Traffic Totals](/packages/traffic-totals/) for usage history, [ntopng](/packages/ntopng/) for a detailed look at live traffic |

### By question

- **Which host is using the bandwidth right now?** [ntopng](/packages/ntopng/).
- **How much did each interface transfer this month?** [Traffic Totals](/packages/traffic-totals/).
- **Did a new device appear, or did an IP address change MAC address?**
  [Neighbor Watch](/packages/andwatch/).
- **Which switch port is the firewall plugged into?** [LLDP](/packages/lldpd/).
- **Will the firewall shut down cleanly when the power fails?** [Network UPS Tools](/packages/nut/).
- **Can a stopped service restart itself, or can a script run every night?**
  [Automation](/packages/automation/).

### Push or pull

- **Pull** (the collector connects to the firewall): Node Exporter, the Zabbix agent in passive
  mode and the SNMP agent. You need a firewall rule that admits the collector, and the listening
  service should be bound to a management address.
- **Push** (the firewall connects out): Telegraf, softflowd, syslog-ng forwarding, SNMP traps and
  Zabbix active checks. Outbound traffic from the firewall itself is allowed by default.

### Resource use

- ntopng is the only *Intensive* package here. It inspects packets on every monitored interface
  and keeps its history on disk. Size CPU and storage for it and monitor few interfaces.
- syslog-ng, Telegraf and the Zabbix proxy are *Moderate*: their cost grows with log volume,
  collection interval and the number of monitored hosts.
- The others are *Lightweight*.

## Rollout checklist

1. Start with one package and one collector.
2. Bind listening services to a management address, and add a firewall rule that admits only
   the collector.
3. Use authenticated or encrypted transport where the package supports it: SNMPv3, Zabbix PSK or
   certificates, HTTPS for InfluxDB and Elasticsearch.
4. Confirm the collector receives data with the right host name and timestamps.
5. Watch CPU, memory and disk on the firewall under normal traffic.
6. Stop the collector for a while and check that the firewall keeps working. Monitoring outages
   should be visible, but they should not cause a network outage.
7. Take a configuration backup. Package settings are part of `config.xml`, but data such as
   ntopng history or the Zabbix proxy database is not.

## Related packages

[Open VM Tools](/packages/open-vm-tools/) and the [Diagnostics](/packages/diagnostics/) tools are
described under [System and diagnostics packages](/packages/system-and-diagnostics/).
