---
title: Telegraf
description: Send FreeSense system, pf and network metrics to InfluxDB, Elasticsearch or Graphite with the Telegraf package.
---

The **Telegraf** package runs the [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/)
metrics agent on the firewall and pushes metrics to a collector. Out of the box it reports CPU,
disk, disk I/O, kernel, memory, network, process, swap, system and **pf** (packet filter)
statistics. It can also add HAProxy statistics, ping round-trip times and netstat counters. The
1.1.0 Stable repository ships `FreeSense-pkg-Telegraf` 0.9.3_1 with **Telegraf 1.40.1**.

Use Telegraf when you already run InfluxDB (1.x API), Elasticsearch or Graphite, perhaps with
Grafana on top, and want the firewall to push metrics to it. If your monitoring system pulls
metrics instead, use [Prometheus Node Exporter](/packages/node-exporter/) or the
[SNMP agent](/packages/net-snmp/).

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Telegraf** (package `FreeSense-pkg-Telegraf`, category *Monitoring*, resource profile
   *Moderate*) and choose **Install**.

The install pulls in the `telegraf` package. Stable packages are published for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64.

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → Telegraf** | `/pkg_edit.php?xml=telegraf.xml`, a single settings page |

## First-time setup

These steps send metrics to an InfluxDB 1.x server at `192.168.1.23`.

1. Open **Services → Telegraf** and check **Enable**.
2. Leave **Update Interval** empty for the default of 10 seconds, or enter another number of
   seconds.
3. In **Telegraf Output**, select **InfluxDB** only.
4. Enter **InfluxDB Server** as a full URL, for example `http://192.168.1.23:8086`.
5. Enter the **InfluxDB Database**, for example `freesense`. It is created if it doesn't exist.
6. If your InfluxDB requires authentication, enter **InfluxDB Username** and
   **InfluxDB Password**.
7. Choose **Save**. FreeSense writes `/usr/local/etc/telegraf.conf` and starts or restarts the
   service.
8. Check your collector for new series from this host.

## Settings reference

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Runs Telegraf. When unchecked, the service stops and its rc script and configuration file are removed. | unchecked |
| **Update Interval** | Collection interval in seconds | 10 when empty |
| **Telegraf Output** | Output plugin: InfluxDB, ElasticSearch or Graphite. The list allows several selections, but select only one (see Troubleshooting). | none |
| **\*InfluxDB Server** | Full HTTP or UDP URL of the InfluxDB server, for example `http://192.168.1.23:8086` | empty |
| **\*InfluxDB Database** | Target database, created if it doesn't exist | empty |
| **InfluxDB Username** | User name, if InfluxDB requires one | empty |
| **InfluxDB Password** | Password, if InfluxDB requires one | empty |
| **Skip SSL verify** | Uses HTTPS but skips certificate chain and host name checks. Applies to the InfluxDB output only. | unchecked |
| **Short Hostname** | Reports the short host name from **System → General Setup** instead of the FQDN | unchecked |
| **\*ElasticSearch Servers** | Full HTTP URL of Elasticsearch, for example `http://192.168.1.23:9200` | empty |
| **\*Graphite Server** | Graphite endpoint as `host:port` | empty |
| **Graphite Prefix** | Prefix for Graphite metric names | `monitor` when empty |
| **Graphite Timeout** | Timeout for Graphite writes, in seconds | 2 when empty |
| **HAProxy** | Adds the HAProxy input | unchecked |
| **HAProxy Port (optional)** | Port of the HAProxy internal statistics page | 2200 when empty |
| **Enable Netstat Monitor** | Adds the netstat input | unchecked |
| **Enable Ping Monitor** | Adds the ping input for up to four hosts | unchecked |
| **Ping Host 1** to **Ping Host 4** | IP addresses or host names to ping | empty |
| **Additional configuration for Telegraf** | Raw TOML appended to `telegraf.conf`, for example extra inputs or an `[[outputs.influxdb_v2]]` section | empty |

Fields marked with `*` are required for the output they belong to.

### Generated inputs and outputs

- Telegraf always collects `cpu` (per CPU and total), `disk` (excluding tmpfs, devtmpfs and
  devfs), `diskio`, `kernel`, `mem`, `net`, `processes`, `swap`, `system` and `pf`.
- The HAProxy input reads `http://127.0.0.1:<port>/haproxy/haproxy_stats.php?haproxystats=1`.
  Set the matching **Internal stats port** in the [HAProxy](/packages/haproxy/) package
  settings.
- The InfluxDB output uses the 1.x API (database, user name and password). For InfluxDB 2.x or
  later, leave **Telegraf Output** empty and add an `[[outputs.influxdb_v2]]` section in
  **Additional configuration for Telegraf**.
- If the firewall has CAs under **System → Certificates**, all of them are written to
  `/usr/local/etc/telegraf.ca` and used to verify the InfluxDB server's certificate.

## Firewall rules and interfaces

Telegraf only makes outbound connections from the firewall to the collector, for example TCP
8086 for InfluxDB, 9200 for Elasticsearch or 2003 for Graphite. No inbound rule is needed. Traffic
from the firewall itself is allowed by default, so you only need a rule if you filter it.
Use HTTPS for the InfluxDB and Elasticsearch URLs when the path to the collector is not trusted.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `telegraf` (*Telegraf daemon*) in **Status → Services** |
| rc script | `/usr/local/etc/rc.d/telegraf.sh` (runs Telegraf under `daemon`) |
| Configuration | `/usr/local/etc/telegraf.conf` (generated) |
| Log | `/var/log/telegraf.log` (Telegraf's error output) |
| PID file | `/var/run/telegraf.pid` |

## Upgrade, backup, and removal

- Settings are saved in `config.xml` under `installedpackages/telegraf`. The InfluxDB password is
  stored base64-encoded, not encrypted, so protect configuration backups.
- The generated `telegraf.conf` contains the InfluxDB password in plain text. It is created with
  default file permissions.
  <!-- needs verification: mode and owner of /usr/local/etc/telegraf.conf on a 1.1.0 system. -->
- The package has no deinstall step of its own. The generic package removal stops the service
  and keeps the settings in the configuration.

## Troubleshooting

- **No data reaches the collector, and the configuration has no output section**: the output is
  chosen with an if/else on **Telegraf Output**, so only one output is ever written: InfluxDB
  first, then Elasticsearch, then Graphite. Selecting several outputs is not supported and may
  produce no output at all. Select exactly one, and add others through **Additional configuration
  for Telegraf**.
  <!-- needs verification: how pkg_edit stores a multi-select value for telegraf_output on 1.1.0 and whether two selections produce no output section. -->
- **Errors after a save**: read `/var/log/telegraf.log`. TOML syntax errors in **Additional
  configuration for Telegraf** stop Telegraf from starting.
- **HAProxy metrics are missing**: the HAProxy internal statistics port isn't set, or it doesn't
  match **HAProxy Port (optional)**.
- **Certificate errors with HTTPS InfluxDB**: import the issuing CA under
  **System → Certificates**, then save the Telegraf settings again. Use **Skip SSL verify** only
  for tests.

:::note[Changes in FreeSense 1.1]
- Rebuilt for the FreeBSD 16.0-CURRENT base. The 1.1.0 Stable repository ships Telegraf 1.40.1.
- The menu entry is in the *Monitoring* group of the **Services** menu (freesense-packages
  4ae11df).
- There are no functional changes to the package itself in 1.1.
:::
