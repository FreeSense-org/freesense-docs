---
title: Automation
description: Schedule root commands with cron and restart stopped services automatically using the FreeSense Automation package.
---

**Automation** is a small FreeSense package for two jobs: running commands on a cron schedule,
and restarting services that have stopped. FreeSense wrote it to replace three separate pfSense
packages (Cron, Shellcmd and Service Watchdog) with one page. It has no upstream project and
installs no extra software. The 1.1.0 Stable repository ships `FreeSense-pkg-Automation`
version 1.0.0_3.

Use it for short, well-understood maintenance jobs, such as a nightly script under
`/usr/local/bin`, or for keeping a service running that sometimes stops. Every task runs as
**root**. Complex provisioning, secrets handling and multi-step orchestration belong on a
separate automation host.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Automation** (package `FreeSense-pkg-Automation`, category *System*, resource profile
   *Lightweight*) and choose **Install**.
3. Confirm on the review page.

The package contains only PHP and has no architecture-specific dependencies. Stable packages
are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64.

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → Automation** | `/automation/automation.php`, with the **Scheduled tasks** and **Service watchdog** tables |

Access is controlled by the **WebCfg - Services: Automation** privilege
(`page-services-automation`). Give it only to administrators who may run commands as root.

## First-time setup

### Add a scheduled task

1. Open **Services → Automation** and choose **Add task**.
2. Enter a **Task name**.
3. Enter the **Command** as an absolute path with its arguments, for example
   `/usr/local/bin/example --safe-flag`.
4. Fill in the five **Schedule** fields: **Minute**, **Hour**, **Day**, **Month** and **Weekday**.
   Each field starts at `*`. For example, `30 2 * * *` runs every day at 02:30.
5. Leave **Enabled** checked and choose **Add task**.

The task is added to the system cron table straight away. The **Schedule** column shows the raw
cron fields and, for common patterns, a plain-language reading such as *Daily at 02:30*,
*Every 15 minutes* or *Weekdays at 06:00*.

### Watch a service

1. Choose **Watch service**.
2. Enter the **Service name** as **Status → Services** lists it, for example `unbound` or
   `ntpd`. The field suggests the services registered on this firewall.
3. Choose **Watch service**.

Every 5 minutes the watchdog checks each watched service. If one is not running, the watchdog
restarts it and logs a warning.

## Settings reference

### Scheduled task fields

| Field | What it does | Default |
| --- | --- | --- |
| **Task name** | Label shown in the table. Required. | empty |
| **Command** | Command line that cron runs as root. It must start with an absolute path under `/bin`, `/sbin`, `/usr/bin`, `/usr/sbin`, `/usr/local/bin`, `/usr/local/sbin` or `/usr/local/pkg`. | empty |
| **Minute** | Cron minute field | `*` |
| **Hour** | Cron hour field | `*` |
| **Day** | Cron day-of-month field | `*` |
| **Month** | Cron month field | `*` |
| **Weekday** | Cron weekday field. `0` and `7` are both Sunday. | `*` |
| **Enabled** | Unchecked tasks are saved but not added to cron | checked |

Each schedule field accepts `*`, a step such as `*/5`, a number, a range such as `1-5`, or a
list such as `1,15`. A range may be followed by a list (`1-5,7`), but a list cannot contain a
range after its first item (`1,3-5` is rejected). The form does not check that numbers are in
range, so cron receives a value such as `75` in the minute field as written.

### Service watchdog fields

| Field | What it does | Default |
| --- | --- | --- |
| **Service name** | Registered service to restart when it is not running. Letters, digits, `.`, `_` and `-`, up to 64 characters. | empty |

The watchdog table shows each entry as **Running**, **Stopped**, or **Not found** when no
registered service has that name. The tiles at the top count scheduled, enabled and watched
entries, and show **Stopped now** when a watched service is down.

### What the page cannot do

- There is no edit or enable toggle for an existing task. To change a task or enable a disabled
  one, delete it and add it again.
- The watchdog interval is fixed at 5 minutes.

## Firewall rules and interfaces

Automation doesn't listen on any port and needs no firewall rules. A command that contacts
other hosts needs the same outbound access as any other traffic from the firewall itself.

## Service, logs, and status

- Automation has no daemon of its own. Tasks run from the system cron table. The package marks
  its cron entries with the source `freesense-automation` and rewrites them on every save.
- When at least one service is watched, the package adds one more cron entry, which runs
  `/usr/local/pkg/automation/automation_watchdog.php` every 5 minutes.
- A watchdog restart is logged as a warning, `Automation watchdog restarting <service>`, in the
  system log. Read it under **Status → System Logs**.
- Task output is not shown on the page. Have the command write its own log file if you need a
  record.
<!-- needs verification: where cron sends task output (mail to root or discarded) on a 1.1.0 system. -->

## Upgrade, backup, and removal

- Tasks and watchdog entries are saved in `config.xml` under `installedpackages/automation`, so
  configuration backups include them and they survive package and system updates.
- On removal, the package deletes its cron entries. Its settings stay in the configuration. If
  you install it again, the post-install step adds the enabled tasks and the watchdog entry back
  to cron.
- Automation does not read settings left behind by the pfSense Cron, Shellcmd or Service
  Watchdog packages. Recreate those jobs here by hand.

## Troubleshooting

- **"Commands must use an absolute executable path…"**: the command doesn't start with one of
  the allowed directories. Use the full path, for example `/usr/local/bin/php` instead of `php`.
- **"Invalid minute schedule field."** (or hour, mday, month, wday): a schedule field uses a
  form the page doesn't accept, such as `1,3-5` or a named month like `JAN`. Use numbers.
- **The watchdog shows *Not found***: the name doesn't match a registered service. Copy the
  exact name from **Status → Services**.
- **A watched service keeps restarting**: the watchdog restarts a stopped service but doesn't
  find out why it stopped. Check the service's own log, and remove the watchdog entry while you
  investigate.
- **Saved settings disappeared after an upgrade from 1.0**: before 1.1, the package stored its
  lists in a form that made `config.xml` invalid. FreeSense then restored the previous
  configuration, so nothing saved on this page was kept. The system log showed
  `XML_ERR_NAME_REQUIRED`. Re-enter the tasks on 1.1.

:::caution[Treat the Command field as a root shell]
Cron runs each command through the shell as root. In 1.1.0 the operator check looks only at the
start of the command, so the page can accept a command line that contains `;` or `|` later on.
Only enter commands you would type in a root shell, and limit who holds the Automation
privilege.
:::

:::note[Changes in FreeSense 1.1]
- Settings can be saved. In 1.0 every save produced an invalid `config.xml`, the system restored
  a backup and the change was lost. Watched service names also crashed the page and the
  watchdog script. Both are fixed (freesense-packages 527a776).
- Removal now runs the package's POST-DEINSTALL stage, so a removed Automation package no longer
  stays registered and is not reinstalled by a configuration restore or the boot-time package
  sync (f903b12).
- The page was rebuilt in the 1.1 WebUI style, with summary tiles, plain-language schedules,
  service suggestions and dialogs for adding entries (ce8303d).
- The menu entry is in the *Other* group of the **Services** menu (4ae11df).
:::
