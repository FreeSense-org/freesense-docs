---
title: Installing packages
description: Add and manage optional FreeSense packages from the official signed repository.
---

FreeSense can be extended with a curated set of optional packages installed from the same signed
repository that delivers system updates. Start with the [catalog overview](/packages/catalog/) to
understand the supported integrations and their intended roles.

## Package Manager

Manage packages from the GUI:

**System → Package Manager**

- **Available Packages** — browse by category, search by name or capability, and review impact.
- **Installed Packages** — view, update, or remove what's installed.

Installing a package fetches it (and its dependencies) from `pkg.freesense.org`, verifies the
signature, and wires up its GUI pages. Before confirming, review the package's capability badges,
resource profile, managed services, and support state. Capabilities call out sensitive behavior such
as packet inspection, firewall modification, credential storage, route management, and scheduled
downloads.

After installation, **Manage** and **Status** links lead directly to the relevant integration. A
shared package-control page provides a consistent view of registered services when a package does
not need a dedicated dashboard.

## Keeping packages updated

Package updates arrive through the same path as the OS. Check **System → Update** (or the Package
Manager) and apply updates from your chosen [release channel](/guides/updates-and-channels/).

## Building your own

Because the package recipes are open, you can build the system and runtime ports from
[`freesense-system-ports`](https://github.com/FreeSense-org/freesense-system-ports) and the optional
package ports from [`freesense-packages`](https://github.com/FreeSense-org/freesense-packages), then
serve them from your own repository if you prefer to self-host.

:::tip[Resource planning]
Packages marked **intensive**, such as Suricata, ntopng, or large DNS/IP feed processing, need more
memory and storage than the base firewall. Install only the inspection and retention features the
appliance can sustain.
:::
