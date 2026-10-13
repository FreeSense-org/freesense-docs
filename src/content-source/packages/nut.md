---
title: Network UPS Tools (NUT)
description: Monitor a UPS from FreeSense with Network UPS Tools and shut the firewall down cleanly before the battery runs out.
---

The **nut** package (shown as **Network UPS Tools** in the Package Manager) integrates
[Network UPS Tools](https://networkupstools.org/) to monitor an uninterruptible power supply. It
supports a UPS connected directly to the firewall over USB or serial, and remote UPS units reached
through another NUT server, apcupsd, the netxml protocol, or SNMP. When the UPS reports a critical
low-battery condition, FreeSense shuts itself down cleanly.

At the 1.1.0 release lock the package (`FreeSense-pkg-nut` 2.8.2_12) depends on NUT 2.8.5 from the
pinned FreeBSD ports tree.

Use it on any firewall that runs on a UPS, so that a long power cut ends in a clean shutdown instead
of a crash and a possibly damaged file system.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Network UPS Tools** (category System, lightweight) and select **Install package**, then
   **Confirm**.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64. See [Installing packages](/packages/installing-packages/).

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → UPS** (Monitoring group) | **UPS Status** tab: summary and full UPS variable list |
| **Services → UPS → UPS Settings** | UPS type, driver, and advanced configuration |
| Dashboard | **UPS Status** widget |

The service appears as **nut** (*UPS monitoring daemon*) under **Status → Services**.

## First-time setup

The example below covers the most common case, a UPS connected by USB.

1. Connect the UPS USB cable to the firewall.
2. Open **Services → UPS** and select the **UPS Settings** tab.
3. Set **UPS Type** to **Local USB**.
4. Enter a **UPS Name**, for example `ups` (letters, digits, `_` and `-` only).
5. Select a **Driver**. **usbhid** (`usbhid-ups`) works for most current UPS models; check the NUT
   Hardware Compatibility List linked under the field if unsure.
6. Optionally select **Enable notifications** under **Notifcations** to receive e-mail or other
   alerts on power events.
7. Select **Save**. You are taken to the **UPS Status** tab.
8. Check that **Summary status** shows **On line** and that battery charge and runtime are
   reported.
9. Add the **UPS Status** widget to the dashboard if wanted.

For a UPS that another server monitors, choose **Remote NUT server**, enter the server's address,
the UPS name as configured on that server, and a NUT user name and password that the server
accepts.

## Settings reference

### General Settings

| Field | What it does | Default |
| --- | --- | --- |
| **UPS Type** | **Disabled**, **Local USB**, **Local serial**, **Local serial (genericups)**, **Remote NUT server**, **Remote apcupsd**, **Remote netxml**, **Remote snmp**, or **Dummy UPS**. **Disabled** stops NUT and removes its generated files while keeping the entered values. | Disabled |
| **UPS Name** | Name of the UPS (required unless disabled); `[a-zA-Z0-9_-]` only. For **Remote NUT server** it must match the name on the remote server. | Empty |
| **Notifcations → E-Mail** | **Enable notifications** sends power events (online, on battery, low battery, forced shutdown, communication lost/restored, shutdown, replace battery, no communication, no parent) to the methods configured under **System → Advanced → Notifications**. | Off |

### Driver Settings

The fields shown depend on **UPS Type**.

| Field | Used by | What it does |
| --- | --- | --- |
| **Driver** (USB) | Local USB | USB driver: usbhid, apc_modbus, bcmxcp, blazer, atcl, qx, richcomm, riello, tripplite. The port is set to `auto`. |
| **Driver** (serial) | Local serial | Serial driver, for example apcsmart, bcmxcp, blazer, powerpanel, qx, tripplite, victronups, and others from NUT. |
| **Serial port** | Local serial, genericups | Detected `/dev/cuau*` and `/dev/cuaU*` devices. |
| **Generic Ups Type** | genericups | `upstype` value for contact-closure UPS cables, 0-22. |
| **Remote protocol** | Remote netxml | `http` or `https`. |
| **Remote IP address or hostname** | Remote NUT, apcupsd, netxml, snmp | Address of the remote server or UPS network card. |
| **Remote port (optional)** | Remote NUT, apcupsd, netxml | Non-default port. |
| **Remote username** / **Remote password** | Remote NUT (required), netxml | Credentials for the remote server. |
| **Dummy port** | Dummy UPS | File or `host` definition used by the `dummy-ups` driver, useful for testing. |
| **Extra Arguments to driver (optional)** | Local and remote driver types | Additional `ups.conf` lines for this UPS, one per line, for example `community=private` or `snmp_version=v2c` for SNMP, or `pollinterval=15`. |

### Advanced settings

Select **Display Advanced** to show these fields. Each adds raw lines to the generated NUT file.

| Field | Appended to | Notes |
| --- | --- | --- |
| **Additional configuration lines for upsmon.conf** | `upsmon.conf` | All types, for example `FINALDELAY` or `DEADTIME`. |
| **Additional configuration lines for ups.conf** | Top of `ups.conf` (global section) | Local and driver-based remote types. |
| **Additional configuration lines for upsd.conf** | `upsd.conf` | For example additional `LISTEN` lines so other hosts can use this UPS. |
| **Additional configuration lines for upsd.users** | `upsd.users` | Users for other NUT clients. |

FreeSense generates the rest itself: `upsd` listens on `127.0.0.1` and `::1` only, and the local
monitor connects as an internal `local-monitor` user with a random password that changes on every
save.

## Firewall rules and interfaces

- Local USB or serial UPS: no rules needed.
- Remote NUT, apcupsd, netxml, or SNMP: the firewall connects outward to the remote server or UPS
  card (NUT uses TCP 3493, apcupsd TCP 3551, SNMP UDP 161 by default). Make sure that path is open
  on any device in between.
- To let other hosts monitor a UPS attached to the firewall, add a `LISTEN` line for an interface
  address in the upsd.conf field, add a user with `upsmon secondary` (or `upsmon slave`) in the
  upsd.users field, and add a pass rule for TCP 3493 from those hosts on that interface. Keep this
  on a trusted network.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `nut` (status follows `upsmon`) |
| rc script | `/usr/local/etc/rc.d/nut.sh` starts the driver (`upsdrvctl`), `upsd`, and `upsmon` for local and driver-based types, or only `upsmon` for **Remote NUT server** |
| Shutdown hook | `/usr/local/etc/rc.d/shutdown.nut.sh`, run at system shutdown; if `upsmon -K` reports a forced shutdown, it tells the UPS to cut power (`upsdrvctl shutdown`) |
| Configuration | `/usr/local/etc/nut/ups.conf`, `upsd.conf`, `upsd.users`, `upsmon.conf` (generated, do not edit) |
| Shutdown command | `/sbin/shutdown -p +0`, with power-down flag `/etc/killpower` |
| State directory | `/var/db/nut` (recreated automatically, also after a RAM-disk boot) |
| Status page | **Services → UPS**: name, summary status, alarm, runtime, load, battery charge and voltage, input voltage and frequency, last test result, and all variables from `upsc` |
| Widget | **UPS Status**, with load and battery bars and an alert when the UPS needs attention |
| Logs | NUT events go to the system log (**Status → System Logs**); package messages use the `NUT` prefix |

The summary status translates NUT flags into words: **On line**, **On battery**, **Low battery**,
**Charging**, **Discharging**, **Replace battery**, **Overloaded**, **Bypass**, **Calibrating**,
**Voltage trim**, **Voltage boost**. On battery, low battery, replace battery, bypass, overload, or
any UPS alarm raise an alert on the status page and widget.

## Upgrade, backup, and removal

- Settings are stored in `config.xml` under `installedpackages/nut` and are included in
  configuration backups. The remote password is stored in the configuration, so protect backups.
- Configurations from the older NUT package format (with a `monitor` setting) are migrated when the
  settings page is opened; a warning asks you to review and save.
- Removing the package stops NUT and deletes the generated configuration files, rc script, and
  shutdown hook.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| *UPS name cannot be empty* / *Name may contain [a-zA-Z0-9_-] only* | Enter a simple name such as `ups`. |
| *Remote IP Address / Host must be a valid IP address or hostname* | Correct the remote address. |
| *Remote username cannot be empty* / *Remote password cannot be empty* | Remote NUT servers require both. |
| *UPS Monitor pending* | Shown during the first minute after boot. Wait. |
| *UPS Daemon pending* | The local `upsd` started less than a minute ago. Wait and refresh. |
| *UPS Monitor not running* | `upsmon` is stopped. Check **Status → System Logs**, then start **nut** under **Status → Services**. |
| *Failed to retrieve status* | The driver cannot talk to the UPS. Try another driver, check the cable and USB port, and add driver options in **Extra Arguments to driver**. For SNMP, check the community string and version. |
| Serial port list is empty | No `/dev/cuau*` or `/dev/cuaU*` device is present; check the cable or USB-serial adapter. |
| No notifications | Enable notifications in the package and configure a method under **System → Advanced → Notifications**. |
| Firewall shut down but the UPS kept power | Some UPS models ignore the power-off command or need driver options (for example `offdelay`). Test the full shutdown sequence during a maintenance window. |

:::note[Changes in FreeSense 1.1]
- The menu entry carries the **Monitoring** group in the **Services** panel (freesense-packages
  `4ae11df`).
- Removing the package now stops NUT in the Package Manager's own removal step as well (freesense
  `c767de3`).
:::
