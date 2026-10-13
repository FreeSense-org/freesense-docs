---
title: Installation
description: Download, verify, and write the FreeSense installer, then install FreeSense on amd64 hardware or a virtual machine.
---

This guide takes you from a downloaded installer to a freshly installed FreeSense system. To deploy
a preinstalled disk on a KVM-compatible platform or bhyve instead, use
[Cloud images](/getting-started/cloud-images/).

:::note[Upgrading an existing 1.0 system?]
You don't need to reinstall. See [Upgrading from 1.0](/guides/upgrading-from-1.0/).
:::

## Requirements

| | Minimum | Recommended |
| --- | --- | --- |
| Architecture | 64-bit amd64 (x86-64), UEFI or legacy BIOS | |
| Memory | 1 GB | 4 GB or more; at least 4 GB for ZFS |
| Storage | 8 GB | 16 GB SSD or more |
| Network | 2 interfaces (WAN and LAN), or 1 VLAN-capable interface | 2 or more well-supported interfaces |
| Installer media | USB stick of 2 GB or more | |
| Console | Monitor and keyboard, or a serial console | |

<!-- needs verification: the 1 GB / 8 GB minimum is carried over from earlier documentation and has
not been re-tested on 1.1.0. The recommended values match the download page. The release automation
boots the ISO installer with 4096 MiB of memory (freesense-os-base scripts/runner/smoke-iso.sh). -->

For sizing by workload, see [Hardware and virtualization](/getting-started/hardware-and-virtualization/).

:::note[amd64 and arm64]
The Stable amd64 installer is an ISO. Starting with [1.1.1](/releases/1.1.1/), Stable also ships a
generic arm64 UEFI installer image; FreeSense 1.1.0 itself was amd64 only. The arm64 procedure is
in [Install on arm64](#install-on-arm64).
:::

## 1. Download

Open the [download page](https://freesense.org/download) and choose a release line:

- **Stable 1.1** for production and normal use. This is the supported line.
- **Development 1.2** only for experimental testing in a lab.

:::danger[Development is unsupported]
Development builds are experimental and unsupported. Don't install one on a production firewall or
any system you need support for. A system that moves from Stable to Development can't return to
Stable through the updater.
:::

The download page reads the published release documents. For each image it shows the SHA-256
checksum, size, publication date, and build details. The Stable installer is an ISO file named like
`FreeSense-1.1.0-amd64.iso`. Images are served from immutable URLs on `downloads.freesense.org`.

## 2. Verify the download

Always verify the image before you write it. Compare the full 64-character value with the SHA-256
shown on the download page.

**Linux:**

```sh
sha256sum FreeSense-*-amd64.iso
```

**macOS:**

```sh
shasum -a 256 FreeSense-*-amd64.iso
```

**Windows (PowerShell):**

```powershell
Get-FileHash .\FreeSense-1.1.0-amd64.iso -Algorithm SHA256
```

If the values don't match, download the image again. Don't write a file that fails verification.

## 3. Write the installer to USB

:::caution
Writing an image erases the target device. Check the device name before you run the command.
:::

**Linux:** find the USB device with `lsblk`, then write the image:

```sh
sudo dd if=FreeSense-1.1.0-amd64.iso of=/dev/sdX bs=4M conv=fsync status=progress
```

**macOS:** find the device with `diskutil list`, unmount it, then write to the raw device:

```sh
diskutil unmountDisk /dev/diskN
sudo dd if=FreeSense-1.1.0-amd64.iso of=/dev/rdiskN bs=4m
```

**Windows:** use [balenaEtcher](https://etcher.balena.io/) and select the `.iso` file.

For a virtual machine, attach the ISO as a virtual CD/DVD drive instead.

## 4. Boot the installer

Boot the target machine from the USB stick. You may need to enable USB boot in the firmware
settings. The installer supports **UEFI** and **legacy BIOS** boot. If the firmware has Secure Boot
enabled, disable it.

<!-- needs verification: Secure Boot. FreeSense does not document signed boot loaders, so Secure
Boot is assumed to block the installer. Confirm on UEFI hardware. -->

The installer runs on whichever console you boot from: a monitor and keyboard, or a serial console
at 115200 baud.

## 5. Run the installer

The installer is a guided, text-based program. It shows the FreeSense copyright and license notice
first, then the main menu:

| Choice | Use it to |
| --- | --- |
| Install | Install FreeSense on a disk. |
| Rescue shell | Open a shell from the installer media to repair a system. |
| Recover configuration | Copy `config.xml` and SSH host keys from a previous installation on this machine into the new one. ZFS sources are opened read-only. |
| Import a configuration | Import a configuration file from another firewall. The installer detects whether the file comes from FreeSense, pfSense, or OPNsense and converts it. Packages are mapped to FreeSense equivalents where possible. |

<!-- needs verification: exact menu labels. The installer entry menu (startbsdinstall) comes from the
patched FreeBSD source and is not in the freesense repository. Recovery and import behaviour were
verified from tools/installer/recover_configxml.sh, tools/installer/import_foreign_config.sh, and
tools/installer/IMPORT-GUARD-PLAN.md at 1.1.0. The install steps below (keyboard layout,
guided ZFS/UFS layouts, disk selection) follow the patched bsdinstall flow and need a check on the
1.1.0 ISO. -->

To install:

1. Select **Install**.
2. Choose a keyboard layout.
3. Choose the disk layout. The guided options install with **ZFS** or **UFS** on the whole disk.
   See [Choose ZFS or UFS](#choose-zfs-or-ufs).
4. Select the target disk or disks. Identify each disk by capacity and model, not only by device
   name. Device names can change between hardware and virtual platforms.
5. Confirm. The installer erases the selected disks and installs FreeSense.
6. When the installer reports that installation is complete, remove the installation media and
   reboot.

## Choose ZFS or UFS

| | ZFS | UFS |
| --- | --- | --- |
| Boot environments | Yes. Upgrades run in a cloned boot environment, with a health check after the first boot. | No. Upgrades run in place. |
| Memory | Needs more. Allocate at least 4 GB. | Works with less. |
| Best for | Hardware appliances and most installations | Very small systems, and cloud images where size matters |

ZFS is the recommended filesystem for a normal installation because it gives you
[boot environments](/operations/zfs-boot-environments/). A boot environment protects the operating
system during an upgrade. It doesn't replace configuration backups or an external copy of important
logs.

## 6. Before you connect production networks

Boot the new system with console access and find out which physical port is which. Keep the WAN
disconnected, or connected only to a controlled test uplink, until you have confirmed the WAN and
LAN assignment. On virtual machines, keep WAN and LAN on separate virtual networks and keep the
virtual console available.

Write down the boot mode, target disk, filesystem, and console path. You need them if a later
interface, update, or disk change makes the WebUI unreachable.

## Install on arm64

The generic arm64 installer is published on Stable starting with [1.1.1](/releases/1.1.1/) and on
the Development 1.2 line. Stable 1.1.0 had no arm64 installer.

- The **generic arm64 installer** is a compressed disk image (`FreeSense-*-arm64-installer.img.xz`)
  for machines with standard UEFI firmware and virtio storage and networking, such as QEMU `virt`.
  It boots with UEFI only. Verify the compressed file, decompress it with `xz -dk`, and write the
  `.img` file to a device of 4 GB or larger with the same commands as in
  [3. Write the installer to USB](#3-write-the-installer-to-usb), or attach it to a virtual machine
  as a disk. Then boot it with UEFI and continue with [5. Run the installer](#5-run-the-installer).
- There are **no arm64 cloud images** on Stable; see [Cloud images](/getting-started/cloud-images/).
- **Raspberry Pi** images are preinstalled appliances, not installers, and are published only on
  Development. See [Raspberry Pi appliance images](/1.2/getting-started/raspberry-pi/).
- The Optional Packages policy does not build Suricata or Web Gateway Local Antivirus for arm64.

:::caution[Development builds]
arm64 images from the Development 1.2 line are experimental and unsupported. For production, use the
Stable 1.1.1 or later arm64 installer. See the
[Development installation guide](/1.2/getting-started/installation/) for Development builds.
:::

<!-- needs verification: Stable 1.1.1 arm64 installer file name and the steps from booting the IMG
through the installer on real UEFI arm64 hardware; publication was in progress when written. -->

## Next

Continue to [First boot and setup](/getting-started/first-boot/) to assign interfaces and reach the
WebUI.
