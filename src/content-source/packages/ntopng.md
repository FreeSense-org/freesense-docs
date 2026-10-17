---
title: ntopng
description: Install and configure ntopng traffic analysis on FreeSense, including monitored interfaces, the admin password, GeoLite2 data and disk use.
---

The **ntopng** package runs the [ntopng](https://www.ntop.org/products/traffic-analysis/ntop/)
network traffic analyzer on the firewall. ntopng inspects packets on the interfaces you choose
and shows hosts, flows, applications (through nDPI), throughput history and alerts in its own
web interface. In 1.1.0 the package follows FreeBSD's `net/ntopng` port. The Stable repository
ships `FreeSense-pkg-ntopng` 6.2.0_9 with **ntopng 7.0.d20260922**, a development snapshot of
ntopng, and **Redis 8.10.2** as its data store.

Use ntopng to investigate traffic on the firewall: top talkers, unknown applications, or bandwidth
spikes. It is an **intensive** package. Packet inspection uses CPU, and the traffic history uses
disk space. To send flow records to a separate collector instead, use
[softflowd](/packages/softflowd/).

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **ntopng Traffic Analysis** (package `FreeSense-pkg-ntopng`, category *Monitoring*,
   resource profile *Intensive*) and choose **Install**.

The install also pulls in `ntopng`, `redis`, `gdbm`, `graphviz`, `webfonts` and `libmaxminddb`.
Stable packages are published for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64.

## Where to find it

| Menu path | Page |
| --- | --- |
| **Diagnostics → ntopng Settings** | `/pkg_edit.php?xml=ntopng.xml`, the package settings |
| **Diagnostics → ntopng** | `/ntopng_redirect.php`, which opens the ntopng interface |

Both entries are in the *Tools* group of the **Diagnostics** menu. The settings page also has
an **Access ntopng** tab.

## First-time setup

1. Open **Diagnostics → ntopng Settings** and check **Enable ntopng**.
2. Enter the **ntopng Admin Password** twice. It needs at least 5 characters and must also pass
   the FreeSense password policy.
3. Leave **Server Interface** on *All*, or choose the LAN interface to limit where the ntopng web
   interface listens.
4. Under **Monitored Interfaces**, select the internal interfaces you want to analyze. The
   default is LAN.
5. Choose **Save**. FreeSense writes `/usr/local/etc/ntopng.conf`, starts Redis, stores the admin
   password in Redis and starts ntopng.
6. Choose **Diagnostics → ntopng** (or the **Access ntopng** tab). The browser opens port
   **3000** on the same address you use for the WebUI. Sign in as `admin` with the password from
   step 2.

ntopng uses the same protocol as the WebUI. If the WebUI uses HTTPS (set in
**System → Advanced → Admin Access**), ntopng serves HTTPS with the WebUI certificate.

## Settings reference

### General

| Field | What it does | Default |
| --- | --- | --- |
| **Enable ntopng** | Starts ntopng and Redis. When unchecked, the service is stopped and its rc script, configuration and certificate file are removed. | unchecked |
| **Keep Data/Settings** | Keeps the ntopng settings, graphs and traffic data when the package is removed, reinstalled or upgraded. | checked |
| **ntopng Admin Password** / **Confirm** | Password for the ntopng `admin` user. Required. | empty |

### HTTP(S) Server Options

| Field | What it does | Default |
| --- | --- | --- |
| **Server Interface** | Interface whose address the ntopng web server listens on, or *All*. WAN and loopback interfaces are not offered. | All |
| **Server IPv4** | Listen on IPv4 | checked |
| **Server IPv6** | Listen on IPv6. Ignored while **Server IPv4** is checked, because ntopng listens on one address family only. | unchecked |

The port is fixed at 3000.

### Monitoring Options

| Field | What it does | Default |
| --- | --- | --- |
| **Monitored Interfaces** | Interfaces ntopng captures on. Multiple selection. Monitoring WAN interfaces isn't recommended. | LAN |
| **Promiscuous Mode** | Puts monitored interfaces in promiscuous mode. Otherwise ntopng runs with `--no-promisc`. | unchecked |
| **DNS Mode** | How ntopng decodes DNS and resolves addresses: resolve local numeric IPs only (0), resolve all (1), decode but don't resolve (2), or neither (3). | 0 |

### Additional Local Networks

ntopng already treats the networks of monitored interfaces as local. Add other networks here,
for example networks behind a router or VPN.

| Field | What it does |
| --- | --- |
| **Network in cidr format** | A subnet such as `10.20.0.0/16` |
| **Name** | Optional label. Letters, digits and `_` only. |

### Advanced configuration

| Field | What it does |
| --- | --- |
| **Additional configuration for ntopng.conf** | Extra lines, one `--key=value` option per line, appended to the generated configuration file |

### Geolocation support

| Field | What it does |
| --- | --- |
| **GeoLite2 Account ID** | Your MaxMind account ID |
| **GeoLite2 License Key** | Your MaxMind license key. The **Update GeoLite2 DB** button downloads the GeoLite2-City and GeoLite2-ASN databases. |

You need a free MaxMind account for the download. The request identifies itself only as the
product name and version.

### Utilities

| Button | What it does |
| --- | --- |
| **Delete Data** | Stops ntopng, deletes cached entries in Redis and all `*.db` and `*.rrd` files under `/var/db/ntopng/`, then starts ntopng again. Use it when the disk is filling up. |
| **Reset ntopng** | Stops everything, deletes the whole `/var/db/ntopng/` directory, including ntopng preferences, and starts again. |

## Firewall rules and interfaces

- The ntopng web interface listens on TCP port **3000**. With **Server Interface** set to *All*,
  it listens on every IPv4 address, including WAN. FreeSense blocks unsolicited inbound WAN
  traffic by default. Don't add a WAN rule for port 3000.
- If a LAN rule set blocks traffic to the firewall itself, add a pass rule under
  **Firewall → Rules** for TCP 3000 from your administration hosts.
- Redis listens on `127.0.0.1` and `::1` only.
- ntopng only sees traffic that passes the monitored interfaces. For a switch-wide view, use a
  mirror port connected to a dedicated interface.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `ntopng` (*ntopng Network Traffic Monitor*) in **Status → Services** |
| rc script | `/usr/local/etc/rc.d/ntopng.sh` (starts `redis-server`, then `ntopng`) |
| Configuration | `/usr/local/etc/ntopng.conf` (generated, mode 0600) |
| Data directory | `/var/db/ntopng/`, including the Redis file `ntopng.rdb` |
| HTTPS certificate | `/usr/local/share/ntopng/httpdocs/ssl/ntopng-cert.pem` |
| GeoLite2 files | `/usr/local/share/ntopng/`, linked from `httpdocs/geoip/` |

Package messages, such as failed GeoLite2 downloads or a Redis that didn't start, are written
to the system log with the `ntopng` prefix. Read them under **Status → System Logs**.

## Upgrade, backup, and removal

- Package settings are saved in `config.xml` under `installedpackages/ntopng`.
- With **Keep Data/Settings** checked (the default), removing, reinstalling or upgrading the
  package keeps both the settings and `/var/db/ntopng/`.
- With it unchecked, the package's deinstall step deletes `/var/db/ntopng/` **and** the
  `installedpackages/ntopng` settings. The setting's help text warns that this also happens on a
  reinstall or upgrade.
- A configuration backup doesn't include the traffic history in `/var/db/ntopng/`.

## Troubleshooting

- **The ntopng page doesn't open**: check that the service runs in **Status → Services** and that
  port 3000 is reachable from your browser. The redirect always uses port 3000 and the host name
  you used for the WebUI.
- **"Configuration file missing. Re-save ntopng settings."** or **"Redis database file
  missing."** in the system log: the rc script found no `ntopng.conf` or `ntopng.rdb`. Open
  **Diagnostics → ntopng Settings** and choose **Save**.
- **"Cannot set admin password - redis-server is not running."**: Redis didn't start within
  10 seconds. Check free memory and disk, then save again.
- **The admin password changed back**: every save writes the password from the settings page
  into Redis. Change it on the settings page, not only inside ntopng.
- **"MaxMind GeoIP update failed--check account and license key."**: the download didn't return
  HTTP 200. Check the account ID and key, and that the firewall can reach
  `download.maxmind.com` over HTTPS (through the configured proxy, if any).
- **The disk is filling up**: use **Delete Data**, monitor fewer interfaces, or shorten
  retention with ntopng options in **Additional configuration for ntopng.conf**.
- **ntopng doesn't start when the WebUI uses HTTP**: in the 1.1.0 package code, the HTTP branch
  replaces the generated configuration instead of adding to it, so `ntopng.conf` loses its
  `--daemon`, `--pid` and `--data-dir` lines. Keep the WebUI on HTTPS while you use ntopng.
  <!-- needs verification: behavior of ntopng.conf and service start when system/webgui/protocol is http (ntopng.inc sets $config_lines = instead of .=). -->

:::note[Changes in FreeSense 1.1]
- The package no longer builds its own copy of ntopng pinned to the 6.6 stable branch. It now
  depends on FreeBSD's `net/ntopng` port, which builds against the current nDPI. The 1.1.0
  Stable repository ships ntopng 7.0.d20260922, a development snapshot
  (freesense-packages 8a7f457).
- GeoLite2 downloads no longer append a device ID to the user agent. They send only the product
  name and version (8d82a24).
- Both menu entries are in the *Tools* group of the **Diagnostics** menu (4ae11df).
:::
