---
title: Installing packages
description: Add and manage optional FreeSense packages from the official signed repository.
---

FreeSense can be extended with optional packages — VPN tools, IDS/IPS, proxies, monitoring, and more
— installed from the same signed repository that delivers system updates.

## Package Manager

Manage packages from the GUI:

**System → Package Manager**

- **Available Packages** — browse and install add-ons.
- **Installed Packages** — view, update, or remove what's installed.

Installing a package fetches it (and its dependencies) from `pkg.freesense.org`, verifies the
signature, and wires up its GUI pages.

## Keeping packages updated

Package updates arrive through the same path as the OS. Check **System → Update** (or the Package
Manager) and apply updates from your chosen [release channel](/guides/updates-and-channels/).

## Building your own

Because the package recipes are open, you can build packages yourself from the
[`freesense-ports`](https://github.com/FreeSense-org/freesense-ports) overlay and serve them from
your own repository if you prefer to self-host.

:::note[More to come]
Per-package guides will be added here over time. Want one prioritized? Open an issue on
[GitHub](https://github.com/FreeSense-org/freesense-docs/issues).
:::
