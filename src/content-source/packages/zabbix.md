---
title: Zabbix agent and proxy
description: Monitor FreeSense from a Zabbix server with the Zabbix 7.0 agent, or run a Zabbix 7.0 proxy on the firewall.
---

FreeSense has two Zabbix packages, both for the **Zabbix 7.0 LTS** release line:

- **Zabbix 7.0 Agent** (`zabbix-agent7`) runs `zabbix_agentd` so a Zabbix server or proxy can
  monitor the firewall itself.
- **Zabbix 7.0 Proxy** (`zabbix-proxy7`) runs `zabbix_proxy`, which collects data from agents and
  devices in a remote site and passes it to the central Zabbix server.

The 1.1.0 Stable repository ships `FreeSense-pkg-zabbix-agent7` 1.1_1 with **zabbix7-agent
7.0.31**, and `FreeSense-pkg-zabbix-proxy7` 1.1_1 with **zabbix7-proxy 7.0.31**.

Use the agent when your Zabbix server should see the firewall's CPU, memory, file systems,
interfaces and custom checks. Add the proxy only when a site needs local collection: many
monitored hosts behind the firewall, an unreliable link to the server, or networks the server
can't reach directly. Each package works on its own. You can install both.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Install **Zabbix 7.0 Agent** (`FreeSense-pkg-zabbix-agent7`, *Lightweight*), **Zabbix 7.0
   Proxy** (`FreeSense-pkg-zabbix-proxy7`, *Moderate*), or both. Both are in the *Monitoring*
   category.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64.

:::caution[Kernel tunables]
Every time either package saves its settings, it writes System V IPC values to
`/etc/sysctl.conf` (`kern.ipc.shmall`, `kern.ipc.shmmax`, `kern.ipc.semmsl`) and to
`/boot/loader.conf` (`kern.ipc.semopm`, `kern.ipc.semmni`, `kern.ipc.semmns`,
`kern.ipc.shmmni`). The loader values take effect at the next boot. Removing the package does
not remove these lines.
:::

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → Zabbix Agent 7** | `/pkg_edit.php?xml=zabbixagent.xml&id=0`, tab **Agent** |
| **Services → Zabbix Proxy 7** | `/pkg_edit.php?xml=zabbixproxy.xml&id=0`, tab **Proxy** |

Both entries are in the *Monitoring* group of the **Services** menu.

## Zabbix agent

### First-time setup

1. Open **Services → Zabbix Agent 7** and check **Enable**.
2. In **Server**, enter the Zabbix server or proxy address that runs passive checks, for example
   `192.168.1.50`.
3. For active checks, enter **Server Active**, for example `192.168.1.50:10051`.
4. Enter **Hostname** exactly as the host is named in Zabbix. It is case-sensitive.
5. Set **Listen IP** to the firewall address the server connects to, for example `192.168.1.1`,
   instead of the default `0.0.0.0`.
6. Choose **Save**. FreeSense writes `/usr/local/etc/zabbix7/zabbix_agentd.conf` and restarts the
   agent.
7. In Zabbix, create the host with an agent interface at `192.168.1.1:10050` and link a FreeBSD
   template.

### Agent settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Runs the agent. When unchecked, the service stops and its rc script is removed. | unchecked |
| **Server** | Comma-separated IP addresses or host names allowed to run passive checks. Required when enabled. | empty |
| **Server Active** | Comma-separated `host:port` pairs for active checks | empty |
| **Hostname** | Host name sent with active checks. Must match the host in Zabbix. Required. | empty |
| **Listen IP** | Comma-separated addresses to listen on. Each must be configured on the firewall, or one of `0.0.0.0`, `127.0.0.1`, `::` or `::1`. | `0.0.0.0` |
| **Listen Port** | Passive-check port | `10050` |
| **Refresh Active Checks** | Seconds between active-check list refreshes (1–86400) | `120` |
| **Timeout** | Seconds to spend on one check (1–30) | `3` |
| **Buffer Send** | Seconds to keep values in the buffer (1–3600) | `5` |
| **Buffer Size** | Values held in memory before sending (2–65535) | `100` |
| **Start Agents** | Pre-forked processes for passive checks (0–100). `0` turns off passive checks and the listening port. | `3` |
| **User Parameters** (advanced) | `UserParameter=` lines appended to the configuration, for example `UserParameter=users,who\|wc -l` | empty |

The generated configuration also sets `DebugLevel=3` and `LogFileSize=1` (MB).

## Zabbix proxy

### First-time setup

1. In the Zabbix frontend, create the proxy with a name, for example `branch-fw`, and choose
   active or passive mode.
2. Open **Services → Zabbix Proxy 7** and check **Enable**.
3. Enter **Server** (the Zabbix server address) and **Server Port** (`10051`).
4. Enter **Hostname** exactly as the proxy is named in Zabbix. The default `localhost` almost
   never matches.
5. Choose **Proxy Mode**: *Active* (the proxy connects to the server) or *Passive* (the server
   connects to the proxy).
6. Choose **Save**. FreeSense writes `/usr/local/etc/zabbix7/zabbix_proxy.conf` and restarts the
   proxy.
7. Point agents and devices in the site at the firewall's address on port 10051.

### Proxy settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Runs the proxy | unchecked |
| **Server** | Zabbix server address or addresses. Required. | `127.0.0.1` |
| **Server Port** | Trapper port on the Zabbix server. Required. | `10051` |
| **Hostname** | Proxy name, as known to the server. Required. | `localhost` |
| **Listen IP** | Addresses the trapper listens on | `0.0.0.0` |
| **Listen Port** | Trapper listen port | `10051` |
| **Proxy Mode** | *Active* or *Passive* | Active |
| **Config Frequency** | Seconds between configuration downloads from the server. Ignored in passive mode. Required. | `3600` |
| **Trapper Timeout** | Seconds a trapper may spend on new data (1–300) | `300` |
| **Start Trappers** | Pre-forked trapper processes (0–1000) | `5` |
| **Start SNMP Trapper** | Starts the SNMP trapper process | Disabled |
| **SNMP Trapper File** | File shared with `zabbix_trap_receiver.pl` or SNMPTT | `/tmp/zabbix_traps.tmp` |
| **Advanced Parameters** (advanced) | Extra lines appended to the configuration, for example `StartDiscoverers=10` | empty |

The proxy keeps its local database at `/var/db/zabbix-proxy/proxy.db` and uses
`/usr/local/sbin/fping` for ICMP checks.
<!-- needs verification: zabbix7-proxy 7.0.31 in the 1.1.0 repo is the SQLite flavor and pulls in fping; Zabbix 7.0 still accepts ConfigFrequency (deprecated in favor of ProxyConfigFrequency). -->

## TLS settings (agent and proxy)

Both pages have the same **TLS-RELATED Parameters** section.

| Field | What it does | Default |
| --- | --- | --- |
| **TLS Connect** | How outgoing connections (active checks, active proxy) are made: `unencrypted`, `psk` or `cert` | `unencrypted` |
| **TLS Accept** | Which incoming connections are accepted. Several values are allowed. | `unencrypted` |
| **TLS CA** | CA from **System → Certificates** for verifying the peer | none |
| **TLS CA System** | Uses the operating system's CA bundle (`/usr/local/etc/ssl/cert.pem`) instead of **TLS CA** | unchecked |
| **TLS CRL** | Certificate revocation list | none |
| **TLS Cert** | Certificate and key for this agent or proxy. Only certificates with RSA keys are listed. | none |
| **TLS PSK Identity** | PSK identity string, case-sensitive | empty |
| **TLS PSK** | Pre-shared key in hexadecimal | empty |

Key material is written next to the configuration file (for example
`/usr/local/etc/zabbix7/zabbix_agentd.psk`) with mode 0600 and owner `zabbix`. The Certificates
pages show which CA, certificate and CRL the agent uses.

For PSK, generate a key with `openssl rand -hex 32`, enter the same identity and key in Zabbix,
and set **TLS Connect** to `psk` and **TLS Accept** to `psk` only.

## Firewall rules and interfaces

| Flow | Direction | Port | Rule needed |
| --- | --- | --- | --- |
| Passive agent checks | Zabbix server or proxy → firewall | TCP 10050 | Pass rule on the interface the server comes from, source limited to the server |
| Active agent checks | Firewall → server or proxy | TCP 10051 | None for traffic from the firewall itself |
| Active proxy | Proxy (firewall) → Zabbix server | TCP 10051 | None for traffic from the firewall itself |
| Passive proxy | Zabbix server → proxy (firewall) | TCP 10051 | Pass rule from the server only |
| Agents in the site | Agents → proxy (firewall) | TCP 10051 | Pass rule on the site interfaces |

Add the rules under **Firewall → Rules**. Keep the default `0.0.0.0` listen address only if the
rules restrict the sources.

## Service, logs, and status

| Item | Agent | Proxy |
| --- | --- | --- |
| Service in **Status → Services** | `zabbix_agentd` | `zabbix_proxy` |
| rc script | `/usr/local/etc/rc.d/zabbix_agentd.sh` | `/usr/local/etc/rc.d/zabbix_proxy.sh` |
| Configuration | `/usr/local/etc/zabbix7/zabbix_agentd.conf` | `/usr/local/etc/zabbix7/zabbix_proxy.conf` |
| Log | `/var/log/zabbix-agent/zabbix_agentd.log` | `/var/log/zabbix-proxy/zabbix_proxy.log` |
| PID file | `/var/run/zabbix-agent/zabbix_agentd.pid` | `/var/run/zabbix-proxy/zabbix_proxy.pid` |
| Data | none | `/var/db/zabbix-proxy/proxy.db` |

Read the log files under **Diagnostics → Command Prompt** or over SSH, for example with
`tail -n 50 /var/log/zabbix-agent/zabbix_agentd.log`.

## Upgrade, backup, and removal

- Agent settings are saved under `installedpackages/zabbixagentlts`, and proxy settings under
  `installedpackages/zabbixproxylts`. These are the same names pfSense uses, so settings from an
  imported pfSense configuration are picked up.
- On removal, the agent package deletes its configuration file, log and PID directories. The
  proxy package also deletes `/var/db/zabbix-proxy/`, so the proxy's buffered data is lost. The
  settings stay in `config.xml`.
- The sysctl and loader tunables described under [Install](#install) are left in place.

## Troubleshooting

- **"Hostname field is required."** or **"Server field is required."**: the agent needs both when
  **Enable** is checked.
- **"… is not a configured IP address for 'Listen IP'."**: the address isn't on any interface.
  Use a firewall address or `0.0.0.0`.
- **Active checks fail with "host not found"**: **Hostname** doesn't exactly match the host
  name in Zabbix, including case.
- **Passive checks time out**: check the pass rule for TCP 10050, the **Listen IP**, and that
  **Start Agents** is not `0`.
- **The proxy never appears as seen in Zabbix**: **Hostname** still says `localhost`, or the mode
  in Zabbix doesn't match **Proxy Mode**.
- **TLS handshake errors**: **TLS Connect** and **TLS Accept** must match the encryption settings
  of the host or proxy in Zabbix. Certificates with EC keys aren't offered in **TLS Cert**.

:::note[Changes in FreeSense 1.1]
- Both menu entries are in the *Monitoring* group of the **Services** menu (freesense-packages
  4ae11df).
- The 1.1.0 Stable repository ships Zabbix 7.0.31, built for the FreeBSD 16.0-CURRENT base.
- There are no functional changes to either package in 1.1.
:::
