---
title: Raspberry Pi appliance images
description: Flash and test the experimental FreeSense Development 1.2 appliance images for Raspberry Pi 4 Model B and Raspberry Pi 5 (D0).
---

FreeSense Development 1.2 publishes Raspberry Pi images as **preinstalled UFS appliances**, not
installers. They use the same signed arm64 System repository, Optional Packages repository, default
configuration, and trust roots as the generic arm64 Development build.

:::danger[Development 1.2 preview only]
Raspberry Pi images are not part of Stable 1.1. Stable arm64, which starts with 1.1.1, ships only
the generic arm64 UEFI installer image, not Raspberry Pi images. They are experimental, unsupported previews from the rolling Development line.
Don't use them in production. Check the hardware status of each image on the download page:
`unverified` means the image passed the structural checks, but not the full physical test.
:::

## Choose the image for your board

| Image | Board | Boot path | Networking in scope |
| --- | --- | --- | --- |
| Raspberry Pi 4B | Raspberry Pi 4 Model B only | MBR partition table, FAT16 boot partition, Raspberry Pi firmware, U-Boot | Onboard Ethernet, plus a USB Ethernet adapter with an AX88179 chip (`axge`) |
| Raspberry Pi 5 D0 | Raspberry Pi 5 Model B with the BCM2712 D0 stepping only | MBR partition table, FAT32 boot partition, experimental UEFI firmware (`RPI_EFI.fd`), FreeBSD `BOOTAA64.EFI` | USB Ethernet adapters with AX88179 (`axge`) or RTL8153 (`ure`) chips. Onboard Ethernet isn't supported. |

Not covered by these previews: Raspberry Pi 400, Compute Module 4 and 5, Raspberry Pi 500, early
Pi 5 boards with the C1 stepping, Pi 5 onboard Ethernet and Wi-Fi, GPIO, and fan control.

FreeBSD's own Raspberry Pi support covers the Pi 3 and Pi 4. The Pi 5 image relies on the
experimental third-party
[NumberOneGit Raspberry Pi 5 UEFI firmware, v0.1](https://github.com/NumberOneGit/rpi5-uefi/releases/tag/v0.1).

## Prepare a Raspberry Pi 5

- Update the bootloader EEPROM to firmware dated **2025-06-09 or later** before you test.
- Use adequate cooling.
- Attach two supported USB Ethernet adapters, one for WAN and one for LAN. Onboard networking is
  not part of this preview.

## Verify and flash

1. Compare the compressed image with the SHA-256 value on the download page, then decompress it:

   ```sh
   sha256sum FreeSense-*-arm64-rpi*.img.xz
   xz -dk FreeSense-*-arm64-rpi*.img.xz
   ```

2. Write the decompressed image to a microSD card or USB device. Writing erases the device, so
   identify the target carefully. On Linux or macOS:

   ```sh
   dd if=FreeSense-*-arm64-rpi4b.img of=/dev/diskN bs=4m conv=fsync
   ```

   For a Pi 5, use the file with `arm64-rpi5-d0` in its name. On Windows, select the compressed
   image in balenaEtcher.

3. Insert the card and power on the board. The UFS root filesystem grows to fill the card on first
   boot.

Keep an HDMI display or a serial console (115200 baud, 8 data bits, no parity, 1 stop bit) attached
while you assign interfaces and check that the configuration persists after a reboot. The remaining
steps are the same as on other platforms; see
[First boot and setup](/getting-started/first-boot/).

## How an image becomes hardware-verified

A hardware-verified status applies to the exact image fingerprint that was tested. The test covers
cold boot and reboot, serial and HDMI consoles, root growth, persistent configuration, interface
assignment, the WebUI, DHCP and static addressing, routed and NAT traffic in both directions,
update-channel validation, and clean shutdown. A result for one board never changes the status of
the other board.

<!-- needs verification: the board scope, boot paths, network drivers, EEPROM date and firmware
source match freesense-os-base config/build-policy.json on main (arm64-rpi4b, arm64-rpi5-d0). The
physical acceptance list is carried over from earlier documentation. -->

## Related pages

- [Hardware and virtualization](/getting-started/hardware-and-virtualization/)
- [Development release line](/releases/development/)
