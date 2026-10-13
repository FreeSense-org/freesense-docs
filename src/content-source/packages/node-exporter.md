---
title: Prometheus Node Exporter
description: Expose FreeSense host and interface metrics to Prometheus with the node_exporter package.
---

The **Prometheus Node Exporter** package runs the Prometheus
[node_exporter](https://github.com/prometheus/node_exporter) on the firewall. It serves host
metrics, such as CPU, memory, file systems, network interfaces and load, on an HTTP endpoint
that a Prometheus server scrapes. FreeSense adds a small collector that publishes each
configured FreeSense interface with its name, description and enabled state. The 1.1.0 Stable
repository ships `FreeSense-pkg-node_exporter` 0.18.1_10 with **node_exporter 1.11.0**.

Use it when you already run Prometheus (often with Grafana) and want the firewall in the same
dashboards. For a push model, use [Telegraf](/packages/telegraf/) instead.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Prometheus Node Exporter** (package `FreeSense-pkg-node_exporter`, category
   *Monitoring*, resource profile *Lightweight*) and choose **Install**.

The install pulls in `node_exporter` and `python312`, which runs the FreeSense interface
collector. Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64.

On the first install the package saves default settings: the default collector set, port
`9100` and extra flags `--log.level=warn`. It doesn't start the exporter until you choose an
interface and enable it.

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → Prometheus node_exporter** | `/pkg_edit.php?xml=node_exporter.xml`, a single settings page |

## First-time setup

1. Open **Services → Prometheus node_exporter** and check **Enable node_exporter**.
2. Choose the **Interface** that Prometheus reaches the firewall on, usually LAN or a management
   interface. WAN is not offered.
3. Keep **Listen port** at `9100` unless that port is taken.
4. Keep the default **Collectors** selection unless you need a specific extra collector.
5. Choose **Save**. The exporter listens on the interface's IPv4 address, for example
   `192.168.1.1:9100`.
6. Add a scrape job in Prometheus:

   ```yaml
   scrape_configs:
     - job_name: freesense
       static_configs:
         - targets: ['192.168.1.1:9100']
   ```

7. Open `http://192.168.1.1:9100/metrics` from the Prometheus host to check the endpoint.

## Settings reference

| Field | What it does | Default |
| --- | --- | --- |
| **Enable node_exporter** | Starts the exporter. When unchecked, the service stops and the rc script is removed. | unchecked |
| **Interface** | Interface whose IPv4 address the endpoint listens on. Required. WAN interfaces are hidden. | none |
| **Listen port** | TCP port of the metrics endpoint. Must be a valid port. | `9100` |
| **Collectors** | Collectors passed to node_exporter as `--collector.<name>` flags. Entries marked `(*)` form the default set: boottime, cpu, exec, filesystem, loadavg, meminfo, netdev, textfile and time. Others offered: buddyinfo, ntp, runit, supervisord, devstat. | default set |
| **Extra flags** | Additional command-line flags appended to the exporter's arguments | `--log.level=warn` |

:::caution[Collector selection]
Selecting a collector adds `--collector.<name>`, which turns it on. Deselecting a collector does
not add `--no-collector.<name>`, so collectors that node_exporter enables by default keep running.
To turn one off, add `--no-collector.<name>` under **Extra flags**. Some listed collectors
(buddyinfo, runit, supervisord) are not built for FreeBSD or have been removed from current
node_exporter versions. Selecting one of them can stop the exporter from starting.
:::
<!-- needs verification: node_exporter 1.11.0 on FreeBSD rejects --collector.buddyinfo/runit/supervisord flags; default collectors stay enabled when deselected. -->

### Interface metrics added by FreeSense

A cron job runs `/usr/local/share/FreeSense-pkg-node_exporter/interface-collector.py` every
minute at low priority. It reads `/conf/config.xml` and writes
`/var/tmp/node_exporter/freesense.prom` for the **textfile** collector:

| Metric | Labels | Value |
| --- | --- | --- |
| `node_freesense_interface_up` | `name` (for example `lan`, `opt1`) | `1` if the interface is enabled, else `0` |
| `node_freesense_interface_info` | `name`, `interface` (device such as `igc1`), `description` | Same as above |

Keep the **textfile** collector selected for these metrics.

## Firewall rules and interfaces

- The endpoint listens on TCP **9100** (or your port) on the selected interface's address.
- The endpoint has no authentication or TLS by default and reveals operational detail about the
  firewall. Allow it only from the Prometheus server: on the selected interface, add a pass rule
  under **Firewall → Rules** for TCP 9100 from the Prometheus host, and keep other sources
  blocked.
- If the selected interface has no IPv4 address, the generated listen address has no IP part
  (`:9100`), and the exporter listens on all addresses. Pick an interface with a static IPv4
  address.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `node_exporter` in **Status → Services** |
| rc script | `/usr/local/etc/rc.d/node_exporter.sh`, a copy of the upstream `/usr/local/etc/rc.d/node_exporter` script |
| Settings for the rc script | `/usr/local/etc/rc.conf.d/node_exporter` (`node_exporter_listen_address`, `node_exporter_args`) |
| Textfile output | `/var/tmp/node_exporter/freesense.prom` |

Package messages, such as a failed write of the rc.conf.d file, appear in the system log with
the `node_exporter` prefix under **Status → System Logs**.
<!-- needs verification: where the upstream node_exporter rc script sends the exporter's own log output on FreeSense 1.1.0 (syslog tag). -->

## Upgrade, backup, and removal

- Settings are saved in `config.xml` under `installedpackages/nodeexporter`.
- Before removal, the package stops the service, deletes `node_exporter.sh` and the rc.conf.d
  file, and removes the interface-collector cron job. The settings stay in the configuration.
- After upgrading from 1.0, update dashboards and alerts: the FreeSense interface metrics are
  named `node_freesense_interface_up` and `node_freesense_interface_info`. The old
  `node_pfsense_*` names and the `pfsense.prom` file no longer exist.

## Troubleshooting

- **"You must select an interface to listen to"**: choose an interface before saving.
- **The service doesn't start after a collector change**: remove the collector you just added,
  especially buddyinfo, runit or supervisord, and save again.
- **Prometheus can't reach the endpoint**: check the firewall rule on the selected interface and
  that the target uses that interface's address, not another firewall address.
- **Grafana panels for interfaces are empty after the upgrade**: the queries still use
  `node_pfsense_interface_*`. Rename them to `node_freesense_interface_*`.

:::note[Changes in FreeSense 1.1]
- The interface metrics are renamed to `node_freesense_interface_up` and
  `node_freesense_interface_info` and written to `freesense.prom`. The collector deletes the old
  `pfsense.prom` file, so `node_pfsense_*` series stop (freesense-packages 8312aa4).
- The menu entry is in the *Monitoring* group of the **Services** menu (4ae11df).
- The 1.1.0 Stable repository ships node_exporter 1.11.0, built for the FreeBSD 16.0-CURRENT base.
:::
