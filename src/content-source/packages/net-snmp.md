---
title: SNMP agent (NET-SNMP)
description: Run the NET-SNMP agent and trap daemon on FreeSense with SNMPv3 users, communities, traps and DTLS/TLS transport.
---

The **SNMP Agent** package installs [Net-SNMP](http://www.net-snmp.org/) and gives the
firewall a full-featured SNMP agent (`snmpd`) and trap receiver (`snmptrapd`). Compared with
the built-in SNMP service under **Services → SNMP**, it adds SNMPv3 users with authentication
and encryption, certificate-based DTLS and TLS transports, per-community source and OID
restrictions, extend commands, disk and load monitors, and trap forwarding. The 1.1.0 Stable
repository ships `FreeSense-pkg-net-snmp` 0.1.5_17 with **net-snmp 5.9.5.2**.

Use it when your network management system needs SNMPv3, SET access, or traps with more
control than the built-in service offers. For basic read-only SNMPv2c polling, the built-in
service is enough.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **SNMP Agent** (package `FreeSense-pkg-net-snmp`, category *Monitoring*, resource profile
   *Lightweight*) and choose **Install**.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64.

On install, the package creates an SNMPv3 user named `manager` with a random password and
passphrase. It also sets `manager` as the **Internal Query User**, which `snmpd` uses for its
own monitors.

## Where to find it

| Menu path | Opens |
| --- | --- |
| **Services → SNMP (NET-SNMP)** | `/pkg_edit.php?xml=netsnmp.xml` |
| **Services → SNMP Trap Daemon (NET-SNMP)** | `/pkg_edit.php?xml=net-snmptrapd.xml` |

Both entries are in the *Monitoring* group of the **Services** menu.

| Agent tab (**NET-SNMP**) | Purpose |
| --- | --- |
| **General** | Enable `snmpd`, interface binding, engine ID, DTLS/TLS certificates, rate limits |
| **Host Information** | System location, contact, name, description; interface, disk and load monitoring; extend commands |
| **Users** | SNMPv3 users (USM) and certificate mappings (TSM) |
| **Communities** | SNMPv1/v2c communities |
| **Trap Generation** | Trap and inform destinations, default monitors, custom monitors |
| **[SNMP Trap Daemon]** | Link to the trap daemon pages |

| Trap daemon tab (**NET-SNMP Trap Daemon**) | Purpose |
| --- | --- |
| **General** | Enable `snmptrapd`, binding, logging and authorization switches |
| **Community Auth** | Communities whose traps are logged, executed or forwarded |
| **User Auth** | SNMPv3 users whose traps are accepted |
| **Formats** | Output formats for logged traps |
| **Trap Handles** | Programs to run when a trap arrives |
| **Trap Forwards** | Hosts to forward traps to |
| **[SNMP Daemon]** | Link back to the agent pages |

## First-time setup

This example sets up read-only SNMPv3 polling from a monitoring server at `192.168.1.50`.

1. If the built-in service under **Services → SNMP** is enabled, disable it. Both use UDP port
   161 by default.
2. Open **Services → SNMP (NET-SNMP)**. On **General**, check **Enable snmpd**.
3. Under **Interface Binding**, add a row with **Transport** *UDP*, **IP Address/Hostname**
   `192.168.1.1` (the LAN address) and **Port** `161`. Without a row, `snmpd` listens on all
   addresses.
4. Choose **Save**.
5. On **Users**, edit `manager`. Set a new **Password** and **Passphrase**, and set
   **Min USM Security Level** to *Private (Encryption Required)*. Save.
6. Add a user for the monitoring server, for example `monitor`, with **Read/Write Access** *Read
   Only*, **Authentication Type** *SHA*, **Privacy Protocol** *AES*, a password and a passphrase.
7. On **Host Information**, fill in **Location** and **Contact**. Save.
8. Test from the monitoring server:
   `snmpwalk -v3 -l authPriv -u monitor -a SHA -A '<password>' -x AES -X '<passphrase>' 192.168.1.1 system`

:::caution[Secure the default manager user]
The `manager` user is created with **Read/Write** access and **Min USM Security Level** set to
*Unauthenticated*. The agent then grants SET access to requests that only name that user,
without a password. Before you enable `snmpd`, change its minimum level, bind the agent to a
management address and allow UDP 161 only from your management hosts.
:::
<!-- needs verification: whether raising the manager user's minimum level to priv affects snmpd's internal monitors (iquerySecName / agentSecName manager, defaultMonitors). -->

## Settings reference

### General

| Field | What it does | Default |
| --- | --- | --- |
| **Enable snmpd** | Runs the agent. When unchecked, the service stops and its rc script is removed. | unchecked |
| **Interface Binding** | Rows of **Transport** (UDP, UDP6, TCP, TCP6, DTLS/UDP, TLS/TCP), **IP Address/Hostname** (blank for all addresses; DTLS and TLS need a host name) and **Port**. The same transport and port can't be used twice. | none (UDP 161 on all addresses) |
| **Engine ID Type** | How the SNMP engine ID is built: a string, the firewall IPv4 address, IPv6 address or MAC address | Firewall IPv4 Address |
| **Engine ID** | Engine ID when the type is *String* | empty |
| **CA Certificate** | CA for DTLS/TLS client certificates | none |
| **Server Certificate** | Agent certificate for DTLS/TLS | none |
| **Use Transport Prefix** | Adds the transport to TSM user names, for example `dtls:myuser` | unchecked |
| **Max Get Bulk Repeats** | Responses per variable in a GETBULK request. `-1` unlimited, `0` system default. | `0` |
| **Max Get Bulk Responses** | Total responses in a GETBULK request. `-1` unlimited, `0` system default. | `0` |
| **Custom Options** (advanced) | Lines added to `snmpd.conf` as written | empty |

### Host Information

| Field | What it does | Default |
| --- | --- | --- |
| **Location**, **Contact**, **Name** | `sysLocation`, `sysContact`, `sysName` | empty |
| **Description** | `sysDescr`. When empty: `FreeSense <hostname>.<domain> <version> <OS> <release> <arch>`. | empty |
| **Interface Fadeout** | Seconds a removed interface stays in the interface table | `300` |
| **Replace Old Interfaces** | When an interface comes back before the fadeout ends, reuse its record (checked) or give it a new interface index (unchecked) | checked |
| **Disk Usage Warning** | Sets `dskErrorFlag=1` for a file system with less than this percentage free (`includeAllDisks`). No trap is sent for disk usage. | `20` |
| **Load Monitoring**, **5m**, **15m** | Load-average thresholds for the 1, 5 and 15 minute values | empty |
| **Extended Commands** | `extend` or `extendfix` rows with **MIB OID**, **Name**, **Program** and **Arguments**. The program runs as root when the OID is queried. | none |

### Users

| Field | What it does | Default |
| --- | --- | --- |
| **Username** | SNMPv3 user name | empty |
| **Entry Type** | *User Entry (USM)*, *Certificate Mapping (TSM)* or both | USM |
| **Read/Write Access** | Read only, or read/write (SET) | Read Only |
| **Base OID** | Restricts the user to a subtree | empty |
| **Authentication Type** | SHA or MD5 | SHA |
| **Password** | Authentication password | empty |
| **Privacy Protocol** | AES, DES or None | AES |
| **Passphrase** | Encryption passphrase. The password is used when empty. | empty |
| **Min USM Security Level** | Lowest level accepted: Private, Authenticated or Unauthenticated | Private |
| **User Certificate**, **Certificate Field**, **Security Name**, **Priority**, **Min TSM Security Level** | Certificate mapping for DTLS/TLS users | — |

### Communities

| Field | What it does | Default |
| --- | --- | --- |
| **Community Name** | SNMPv1/v2c community string | empty |
| **Read/Write Access** | Read Only (`rocommunity`) or Read/Write (`rwcommunity`) | Read Only |
| **Address Family** | IPv4, IPv6, or both | IPv4 |
| **Source Restriction** | Network allowed to use the community, for example `192.168.1.0/24`. Use `default` to set a Base OID without a source restriction. | empty |
| **Base OID** | Restricts the community to a subtree. Needs a source restriction. | empty |

### Trap Generation

| Field | What it does | Default |
| --- | --- | --- |
| **Trap Community Name** | Default community for v1/v2c traps | empty |
| **Authentication Traps** | Send a trap on failed authentication | Enabled |
| **Link Up/Down Traps** | Send link up and link down notifications | Enabled |
| **Default Monitors** | Turn on the standard Net-SNMP monitors | Enabled |
| **Internal Query User** | User for the agent's own queries | `manager` |
| **SNMPv1 Local Trap Agent Address** | Agent address in v1 traps | empty |
| **SNMPv1/SNMPv2c Trap Sink #1–#3**, **Inform Sink #1–#3** | Host, community and port for each destination | empty |
| **SNMPv3 Trap Sink #1–#3**, **SNMPv3 Inform Sink #1–#3** | Host, user, security level and port | Private |
| **Monitors** | Custom `monitor` rows with options, name, expression and events | none |

### Trap daemon

| Field | What it does | Default |
| --- | --- | --- |
| **Enable snmptrapd** | Runs the trap daemon | unchecked |
| **Interface Binding** | Transport, address and port rows, as for the agent | none |
| **Retain Notification Logs** | Keep received notifications in the notification log table | Retain |
| **Log Received Traps** | Log traps | Log Traps |
| **Ignore Auth Failure Traps** | Drop authentication-failure traps | Log them |
| **Use Authorization** | Require Community Auth or User Auth entries for traps | Enable Authorization |
| **Sub-Agent** | Runs `snmptrapd` as an AgentX sub-agent of `snmpd` (`-X`) | unchecked |
| **Custom Options** | Lines added to the trap daemon configuration | empty |

**Community Auth** and **User Auth** entries choose what happens to matching traps: log them,
run a trap handle, or forward them. **Trap Handles** run a program with arguments. **Trap
Forwards** send traps to other receivers.

:::caution[Trap daemon port]
The trap daemon's **Interface Binding** rows default to port 161, and a blank port also becomes
161. Traps normally use port **162**. Enter `162` explicitly, and don't share a port with the
agent's bindings.
:::

## Firewall rules and interfaces

- The agent listens on UDP 161 on all addresses unless you add binding rows. TCP, DTLS and TLS
  bindings listen only where you configure them.
- Add pass rules under **Firewall → Rules** for UDP 161 (or the configured transports) from
  your management hosts only. Don't allow SNMP from WAN.
- Traps and informs from the firewall go out to the configured sinks, normally on UDP 162. No
  rule is needed for traffic from the firewall itself.
- To receive traps from other devices, add a pass rule for UDP 162 to the trap daemon's address.

## Service, logs, and status

| Item | Agent | Trap daemon |
| --- | --- | --- |
| Service in **Status → Services** | `net-snmpd` (*NET-SNMP Daemon*) | `net-snmptrapd` (*NET-SNMP Trap Listening Daemon*) |
| rc script | `/usr/local/etc/rc.d/net-snmpd.sh` | `/usr/local/etc/rc.d/net-snmptrapd.sh` |
| Configuration | `/var/etc/netsnmpd.conf` and `/var/etc/netsnmpd-users.conf` | `/var/etc/netsnmptrapd.conf` |
| PID file | `/var/run/net_snmpd.pid` | `/var/run/snmptrapd.pid` |

- `snmpd` logs to syslog (daemon facility, priorities 0–6). Read it under **Status → System
  Logs**.
- DTLS/TLS certificates and keys are written under `/usr/local/share/snmp/tls/`.
- Both daemons load MIBs from `/usr/share/snmp/mibs/` and `/usr/local/share/snmp/mibs`.
<!-- needs verification: where snmptrapd writes received traps on 1.1.0 (its rc command has no -L option). -->

## Upgrade, backup, and removal

- Settings are saved in `config.xml` in several sections: `netsnmp`, `netsnmphostinfo`,
  `netsnmpusers`, `netsnmpcommunities`, `netsnmptrapgen` and the `netsnmptrapd*` sections, all
  under `installedpackages`. User passwords and community strings are stored in plain text, so
  protect configuration backups.
- The package has no deinstall step of its own. The generic package removal stops both services
  and keeps the settings.

## Troubleshooting

- **The agent doesn't answer**: check that the built-in **Services → SNMP** service isn't also
  using UDP 161, and that a firewall rule allows your manager.
- **"This port and protocol combination is already in use."**: two binding rows use the same
  transport and port.
- **"TLS modes require a hostname…"**: DTLS and TLS bindings need a host name, not an IP
  address, or a blank field.
- **SNMPv3 requests fail with authentication errors**: the user's **Min USM Security Level**
  is higher than the level your manager uses, or the passphrase is wrong. The password is used
  as the passphrase when **Passphrase** is empty.
- **Trap forwarding doesn't work**: in the 1.1.0 package code, the forward hosts on
  **Trap Forwards** are cleared before the configuration is written, so no `forward` lines are
  produced. Use a **Custom Options** line such as `forward default udp:192.168.1.50:162` on the
  trap daemon's **General** tab instead.
- **Trap formats are ignored**: in the 1.1.0 package code, the **Formats** tab is read from the
  wrong settings section, and both format fields share one field name. Set `format1` and
  `format2` through **Custom Options** instead.
<!-- needs verification: Trap Forwards and Formats behavior on a running 1.1.0 system (net-snmp.inc netsnmp_resync_snmptrapd). -->

:::note[Changes in FreeSense 1.1]
- The default `sysDescr` has spaces and a dot between its parts:
  `FreeSense <hostname>.<domain> <version> ...`. Before, the parts ran together
  (freesense-packages 1552781).
- Both menu entries are in the *Monitoring* group of the **Services** menu (4ae11df).
- The 1.1.0 Stable repository ships net-snmp 5.9.5.2, built for the FreeBSD 16.0-CURRENT base.
:::
