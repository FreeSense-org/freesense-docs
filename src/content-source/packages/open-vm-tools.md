---
title: Open VM Tools
description: Install VMware guest integration on a FreeSense virtual machine and check its two services.
---

The **Open VM Tools** package installs the open-source VMware guest tools on a FreeSense virtual
machine. It lets the VMware host see the guest's IP addresses and tools status, and handle power
operations such as **Shut Down Guest**. In FreeSense 1.1.0 the package is
`FreeSense-pkg-Open-VM-Tools` 10.1.0 (port revision 8), which installs `open-vm-tools-nox11`
13.1.0, the build without graphical components.

Install it only when FreeSense runs as a guest on VMware ESXi, Workstation, or Fusion. On other
hypervisors or on hardware it is not needed. The guest daemon checks for VMware on every start and
does nothing elsewhere.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Open VM Tools** (package `FreeSense-pkg-Open-VM-Tools`) and select **Install**.

The installer writes `/usr/local/share/vmware-tools/tools.conf`, sets up the two rc scripts, and
starts both services.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64. The port is built for amd64 and aarch64.

## Where to find it

The package has no configuration page and no menu entry. Its two services appear under
**Status → Services**:

| Service | Description |
| --- | --- |
| `vmware-guestd` | **VMware Guest Daemon** |
| `vmware-kmod` | **VMware Kernel Modules** |

## First-time setup

1. Install the package on the FreeSense virtual machine.
2. Open **Status → Services** and check that **VMware Guest Daemon** is running.
3. In the VMware client, check that the virtual machine reports VMware Tools as running and shows
   the guest's IP addresses.
4. In a maintenance window, test **Shut Down Guest** (or **Restart Guest**) from VMware and confirm
   that FreeSense shuts down cleanly. The daemon runs the normal FreeSense shutdown (filesystems
   synced, power off) within about twenty seconds.

## Settings reference

There are no WebUI settings. The installer writes this `tools.conf`, which leaves all power
operation scripts empty, so VMware power operations run no extra scripts in the guest:

```ini
[powerops]
poweron-script=
resume-script=
suspend-script=
poweroff-script=
```

The rc scripts read these variables, which you normally leave alone:

| Variable | What it does | Default |
| --- | --- | --- |
| `vmware_guestd_enable` | Starts `vmtoolsd`. | `YES` when `vmware-checkvm` detects VMware, otherwise `NO` |
| `vmware_guest_kmod_enable` | Default for all kernel modules below. | `YES` |
| `vmware_guest_vmmemctl_enable` | Loads the `vmmemctl` memory balloon module. | Follows `vmware_guest_kmod_enable` |
| `vmware_guest_vmxnet_enable` | Loads the `vmxnet` module. | Follows `vmware_guest_kmod_enable` |
| `vmware_guest_vmblock_enable` | Loads the `vmblock` module. | Follows `vmware_guest_kmod_enable` |

`open-vm-tools-nox11` 13.1.0 on FreeBSD 16 ships none of these kernel modules, so the
`vmware-kmod` service reports `vmmemctl` and `vmblock` as not loaded. That is expected: the guest
daemon, IP reporting and power operations work without them, and the `vmx` network driver comes
from the System kernel.

## Firewall rules and interfaces

None. The tools talk to the host through the VMware backdoor channel, not over the network. Network adapter drivers come from the System kernel, not from this package.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Guest daemon | `/usr/local/bin/vmtoolsd`, started by `/usr/local/etc/rc.d/vmware-guestd` with the `vmsvc` plugins |
| PID file | `/var/run/vmware_guestd.pid` |
| Kernel modules | Loaded from `/usr/local/lib/vmware-tools/modules/drivers/` by `/usr/local/etc/rc.d/vmware-kmod` |
| VMware check | `/usr/local/bin/vmware-checkvm` |

**Status → Services** shows the state of both services. From a shell,
`/usr/local/etc/rc.d/vmware-kmod status` lists each module as loaded or not loaded. Errors while
writing `tools.conf` are logged with the tag `open-vm-tools`.

## Upgrade, backup, and removal

- The package stores nothing in `config.xml`, so there is nothing to back up or restore.
- On install, the package copies its own copies of the `vmware-guestd` and `vmware-kmod` rc
  scripts into place if they are missing. This repairs systems where an older uninstall removed
  them.
- Removing the package deletes the `vmware-guestd.sh` and `vmware-kmod.sh` links. The
  `open-vm-tools-nox11` dependency may stay installed until pkg removes unused packages.
- A VMware snapshot is not a replacement for a FreeSense configuration backup.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| VMware shows Tools as not running | **VMware Guest Daemon** is stopped. Start it from **Status → Services**. If it will not start, run `/usr/local/bin/vmware-checkvm` from a shell; the daemon only starts when VMware is detected. |
| **VMware Kernel Modules** shows as stopped | Expected with `open-vm-tools-nox11` 13.1.0, which ships no kernel modules (`/usr/local/lib/vmware-tools/modules/drivers/` is empty). `/usr/local/etc/rc.d/vmware-kmod status` lists `vmmemctl` and `vmblock` as not loaded. The guest daemon works without them. |
| Services missing after a package update | Reinstall the package; the installer restores the rc scripts if they are gone. |
| Installed on a non-VMware hypervisor | Remove the package. It does no harm, but has no use there. |

:::note[Changes in FreeSense 1.1]
No functional changes. The package was rebuilt for the FreeBSD 16 platform with
`open-vm-tools-nox11` 13.1.0.
:::
