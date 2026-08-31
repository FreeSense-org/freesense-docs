---
title: Raspberry Pi appliance images
description: Flash and test the experimental Raspberry Pi 4B and Pi 5 D0 FreeSense appliances.
channels: [devel]
last_verified_release: development
---

FreeSense Development publishes Raspberry Pi images as preinstalled UFS appliances, not installers.
They share the exact signed ARM64 System repository, Optional Packages binding, default
configuration, channel payload, and trust roots used by the generic ARM64 installer.

:::danger[Experimental and unsupported]
These previews are not production releases. Check the download page's per-artifact hardware status.
`unverified` means the structural image checks passed but the complete physical test matrix did not.
:::

## Choose the exact image

| Image | Supported first-release target | Boot path | Networking in scope |
| --- | --- | --- | --- |
| Raspberry Pi 4B | Raspberry Pi 4 Model B only | MBR, FAT16, Raspberry Pi firmware, U-Boot | onboard Ethernet plus one AX88179/`axge` USB adapter |
| Raspberry Pi 5 D0 | Raspberry Pi 5 Model B with BCM2712 D0 only | MBR, FAT32, experimental `RPI_EFI.fd`, FreeBSD `BOOTAA64.EFI` | AX88179/`axge` plus RTL8153/`ure` USB adapters |

Pi 400, CM4, CM5, Pi 500, early C1 boards, Pi 5 onboard Ethernet and Wi-Fi, GPIO, and fan control
are outside the first release. FreeBSD's official Raspberry Pi image covers Pi 3 and Pi 4;
FreeSense's Pi 5 path instead relies on the experimental third-party
[NumberOneGit Raspberry Pi 5 UEFI v0.1](https://github.com/NumberOneGit/rpi5-uefi/releases/tag/v0.1).

## Pi 5 prerequisite

Update the Raspberry Pi 5 bootloader EEPROM to firmware dated **2025-06-09 or newer** before
testing. Use adequate cooling and attach both supported USB Ethernet adapters; onboard networking
is not part of this preview.

## Verify and flash

Compare the compressed image with the SHA-256 shown on the download page, then decompress it:

```sh
sha256sum FreeSense-*-arm64-rpi*.img.xz
xz -dk FreeSense-*-arm64-rpi*.img.xz
```

Writing the image erases the selected device. On Linux or macOS, identify the target carefully and
write the decompressed image:

```sh
dd if=FreeSense-*-arm64-rpi4b.img of=/dev/diskN bs=4m conv=fsync
```

Use the `arm64-rpi5-d0` filename for Pi 5. On Windows, select the compressed image in balenaEtcher.
The UFS root grows on first boot. Keep HDMI or a 115200 8n1 serial console attached while assigning
interfaces and verifying that the configuration persists after reboot.

## Physical acceptance

A hardware-verification promotion is tied to the exact artifact fingerprint. It covers cold boot,
reboot, serial and HDMI consoles, root growth, persistent configuration, interface assignment,
WebUI, DHCP and static addressing, routed/NAT traffic in both directions, update-channel
validation, and clean shutdown. Passing one board never changes the other board's status.
