---
title: syslog-ng
description: Run an independent syslog-ng log server on FreeSense to receive, store, rotate, and review logs from other devices.
---

The **syslog-ng** package runs the [syslog-ng](https://www.syslog-ng.com/) log server as a second,
independent syslog service on the firewall. It receives syslog messages from other devices over UDP,
TCP, or TLS, writes them to files under a directory you choose, rotates them with
[logrotate](https://github.com/logrotate/logrotate), and shows them in a built-in log viewer. It does
not replace or reconfigure the FreeSense system log: the firewall's own logs stay under
**Status → System Logs** and are not written by this package.

At the 1.1.0 release lock the package (`FreeSense-pkg-syslog-ng` 1.16.5_4) depends on syslog-ng
4.12.0 and logrotate 3.22.0 from the pinned FreeBSD ports tree. The generated configuration's
`@version` line is taken from the installed syslog-ng version, so it always matches the daemon.

Use it when you need a small central log collector for switches, access points, or servers on a
network the firewall already serves, or when you need syslog-ng's filtering, parsing, and
forwarding objects. For high-volume or long-retention logging, send logs to a dedicated log server
instead and use [Remote logging](/operations/monitoring-and-logs/) from the firewall itself.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **syslog-ng** (category Monitoring, resource profile Moderate) and select **Install package**,
   then **Confirm**.
3. Wait for the installation log to finish before leaving the page.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64. See [Installing packages](/packages/installing-packages/)
for repository and update behavior.

## Where to find it

After installation the package adds:

| Menu path | Page |
| --- | --- |
| **Services → Syslog-ng** (Monitoring group) | **General** tab: listener, default log file, and rotation settings |
| **Services → Syslog-ng → Advanced** | List of custom syslog-ng objects (options, sources, destinations, logs, filters, parsers, rewrites, templates) |
| **Services → Syslog-ng → Log Viewer** | Viewer for the log files written by file destinations |

The service is listed as **syslog-ng** (description *Syslog-ng Syslog Server*) under
**Status → Services**.

<!-- needs verification: the Package Manager "Open configuration" button uses the catalog path /pkg_edit.php?xml=syslog-ng.xml, but the package installs syslogng.xml; confirm on a 1.1.0 system whether the button opens the General tab. -->

## First-time setup

1. Open **Services → Syslog-ng**.
2. Select **Enable**.
3. In **Interface Selection**, select each interface that should accept syslog traffic, for example
   **LAN**. The listener binds to that interface's IPv4 address.
4. Choose a **Default Protocol**. UDP is the most widely supported by network devices.
5. Set **Default Port**. The field suggests `514`; if that port is already in use on the firewall,
   saving fails with *The port specified in the 'Default Port' field is already in use* - pick
   another port such as `5140`.
6. Keep **Default Log Directory** (`/var/syslog-ng`) and **Default Log File** (`default.log`), or
   change them. `/var/log` is reserved for FreeSense and is rejected.
7. Set the rotation options (**Archive Frequency**, **Compress Archives**, **Compress Type**,
   **Max Archives**).
8. Select **Save**. The package writes the configuration, runs `syslog-ng --syntax-only` against it,
   and refuses to save if the syntax test fails.
9. Add a firewall pass rule for the listener (see
   [Firewall rules and interfaces](#firewall-rules-and-interfaces)).
10. Point a test device at the firewall's interface address and port, then open the **Log Viewer**
    tab to confirm messages arrive.

## Settings reference

### General tab

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Starts syslog-ng and the hourly logrotate cron job. Clearing it stops the service and removes the generated configuration and rc script. | Off |
| **Interface Selection** | Interfaces to listen on (required, multiple). A `syslog()` listener is added for each selected interface's IPv4 address; interfaces without an IPv4 address are skipped. | - |
| **Default Protocol** | Transport for the default listener: **UDP**, **TCP**, or **TLS**. | UDP |
| **CA** | Certificate authority for TLS. Written to `/var/etc/syslog-ng/ca.d/` and used as `ca-dir()`. | None |
| **Certificate** | Server certificate (with private key) for TLS. Written to `/var/etc/syslog-ng/syslog-ng.cert` and `syslog-ng.key`. | None |
| **Default Port** | Listening port (required). Must be a valid port that no other process already uses. | `514` |
| **Default Log Directory** | Directory for the default log file, without a trailing slash. Created when the service starts. `/var/log` is not allowed. | `/var/syslog-ng` |
| **Default Log File** | File name of the default destination. | `default.log` |
| **Archive Frequency** | How often logrotate rotates the log files: **Daily**, **Weekly**, or **Monthly**. | Daily |
| **Compress Archives** | Compress rotated files. | Off in the form <!-- needs verification: syslogng_resync() sets compress_archives to 'on' whenever the key is not stored; confirm whether leaving the box unchecked really disables compression. --> |
| **Compress Type** | **Gzip** or **Bzip2** for rotated files. | Gzip |
| **Max Archives** | Number of rotated files to keep per log. | `30` |
| **Include SCL** | Adds `@include "scl.conf"` so syslog-ng standard configuration library blocks can be used in custom objects. | Off |

The General tab generates three objects named `_DEFAULT`: a `source` (syslog-ng `internal()` plus
one `syslog()` listener per interface), a `destination` writing to
`<Default Log Directory>/<Default Log File>`, and a `log` path that joins them. These objects cannot
be created or edited on the Advanced tab.

### Advanced tab

Each entry is one syslog-ng configuration object.

| Field | What it does |
| --- | --- |
| **Object Name** | Name used to reference the object, for example `s_switches` or `d_firewalls` (required). `_DEFAULT` is reserved. |
| **Object Type** | **Options**, **Source**, **Destination**, **Log**, **Filter**, **Parser**, **Rewrite**, or **Template**. |
| **Object Parameters** | The object body in syslog-ng syntax, including the braces, for example `{ file("/var/syslog-ng/switches.log"); };` (required). |
| **Description** | Free-text note shown in the list. |

For **Log** and **Options** objects, the name is not written to the configuration (syslog-ng does
not name those statements); only the parameters are used. Every save re-runs the syntax test on the
complete configuration and is rejected if syslog-ng reports an error.

Example that sends one switch's messages to its own file:

```text
Type: Filter       Name: f_switch1       Parameters: { host("192.168.1.20"); };
Type: Destination  Name: d_switch1       Parameters: { file("/var/syslog-ng/switch1.log"); };
Type: Log          Name: l_switch1       Parameters: { source(_DEFAULT); filter(f_switch1); destination(d_switch1); };
```

Any `file()` destination you add is also rotated by logrotate and appears in the Log Viewer file
list.

### Log Viewer tab

| Control | What it does |
| --- | --- |
| Log file | Selects one of the files written by a `file()` destination. Only files from the saved configuration can be chosen. |
| **Filter** | `grep` pattern (case-insensitive) applied to the file. |
| **Limit** | Shows the last 10, 20, 50 (default), 100, 250, or 500 matching lines. |
| **Inverse (NOT)** | Shows lines that do *not* match the filter. |
| **Include archives** | Also searches rotated files, using `zgrep` or `bzgrep` for compressed archives. |
| **Refresh** / **Reset** | Re-runs the query, or returns to the default file and limits. |

Lines in the classic `Mon DD HH:MM:SS host program[pid]: message` format, or with an ISO 8601
timestamp, are split into **Time**, **Host**, **Program**, and **Message** columns. Other lines are
shown unparsed. The table also has a search box and an error/warning filter for the lines currently
shown.

## Firewall rules and interfaces

- Add a pass rule on each listening interface under
  [Firewall → Rules](/configure/firewall-rules-aliases/): protocol UDP or TCP (TCP for TLS),
  source the sending devices or their network, destination **This Firewall** or the interface
  address, destination port the **Default Port**.
- The package declares a firewall rule hook, but in 1.1.0 it does not produce any rule; rely on
  your own pass rule.
  <!-- needs verification: confirm on 1.1.0 that no automatic pass rule for the syslog-ng port appears in /tmp/rules.debug. -->
- Listeners bind only to the IPv4 address of each selected interface. To listen on IPv6, add a
  custom **Source** object on the Advanced tab.
- Do not expose the listener on a WAN interface unless it is restricted to known senders; plain
  UDP and TCP syslog are unauthenticated.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `syslog-ng` (**Status → Services**) |
| rc script | `/usr/local/etc/rc.d/syslog-ng.sh` (generated only while enabled) |
| Configuration | `/usr/local/etc/syslog-ng.conf` (generated, do not edit) |
| PID file | `/var/run/syslog-ng.pid` |
| Rotation | `/usr/local/etc/logrotate.conf`, run hourly at minute 0 from cron; sends `HUP` to syslog-ng after rotating |
| Received logs | `/var/syslog-ng/default.log` by default, plus any custom file destinations |
| TLS material | `/var/etc/syslog-ng/` |
| Package messages | Start, reload, and stop messages are written to the system log with the `syslog-ng` prefix (**Status → System Logs**) |

Saving any tab restarts or reloads syslog-ng (`HUP`) and reloads the firewall filter.

## Upgrade, backup, and removal

- Settings are stored in `config.xml` under `installedpackages/syslogng` (General) and
  `installedpackages/syslogngadvanced` (objects) and are included in configuration backups.
  Received log files are **not** part of the configuration backup; back up the log directory
  separately if you need them.
- If a CA or certificate is selected and TLS is enabled, the certificate manager shows it as used by
  *Syslog-ng*, which prevents accidental deletion.
- Removing the package removes the logrotate cron job, `/usr/local/etc/logrotate.conf`, and
  `/usr/local/etc/syslog-ng.conf`, and stops the service. In 1.1 the Package Manager stops a
  package's services before deleting their entries, so syslog-ng no longer keeps running after
  removal.
- The log directory and its files are left in place after removal.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| *Syslog-ng syntax test failed* when saving | The full generated configuration did not pass `syslog-ng --syntax-only`. The message includes syslog-ng's error; fix the object it names. A failing custom object blocks saving the General tab too. |
| *The port specified in the 'Default Port' field is already in use* | Another process listens on that protocol and port. Choose a different port. |
| *You must enter a valid directory ... /var/log is reserved for FreeSense* | Use a directory outside `/var/log`, such as `/var/syslog-ng`. |
| No messages arrive | Check the pass rule on the receiving interface, that the device sends to the interface's IPv4 address and port, and that the protocol matches. Use **Diagnostics → Packet Capture** on the interface to confirm packets reach the firewall. |
| Service stopped after saving | Check **Status → System Logs** for syslog-ng errors. For TLS, confirm both a certificate with a private key and a CA are selected. |
| A custom log file is missing from the Log Viewer | Only `file("...")` destinations are listed, and only once the file exists and is not empty. |
| Disk fills up | Lower **Max Archives**, enable **Compress Archives**, or move the log directory to larger storage. |

:::note[Changes in FreeSense 1.1]
- The **Log Viewer** tab was rebuilt in the FreeSense log style: parsed Time, Host, Program, and
  Message columns, a search box, an error/warning filter, and a **Reset** link. The selectable log
  file is now limited to files from configured `file()` destinations, the line limit is restricted
  to the listed values, and the file path is shell-escaped (freesense-packages `3c04f05`).
- The menu entry carries the **Monitoring** group, so it appears in that group of the
  **Services** panel (freesense-packages `4ae11df`).
- The General and Advanced tabs use the rebuilt 1.1 package form and list pages (freesense
  `cdc1221`).
- Removing the package now stops syslog-ng (freesense `c767de3`), and a service started by a
  package install script is now started after the package operation finishes instead of being
  killed with the script (freesense `746b03c`).
:::
