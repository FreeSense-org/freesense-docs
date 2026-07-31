---
title: Installing packages
description: Add, update, reinstall, and remove official FreeSense packages safely.
---

FreeSense can be extended with curated optional packages from the official signed repository.
Packages are part of the appliance configuration: they can add services, WebUI pages, firewall
behavior, credentials, scheduled downloads, or routing. Start with the [catalog overview](/packages/catalog/)
to understand a package's operational boundary before installing it.

## Package Manager

Manage packages from **System → Package Manager**:

- **Available Packages** — browse by category, search by name or capability, and review impact.
- **Installed Packages** — view installed integrations and start a reinstall or removal.

Installing a package fetches it and its dependencies through the configured FreeSense repository,
verifies package metadata, runs its supported install hook, and registers its WebUI pages and
services. The Package Manager creates a configuration restore point before package installation.
It does not make an untested deployment safe: preserve console or local-LAN access before adding a
package that can change filtering, routing, DNS, or remote access.

Before confirming an install, review:

- **Support state and last-tested release.** Only catalog entries are supported integrations.
- **Resource profile.** Lightweight, moderate, and intensive indicate the expected planning level,
  not a guaranteed capacity result.
- **Capabilities.** Packet inspection, firewall modification, credential storage, route management,
  and scheduled downloads deserve an explicit change review.
- **Services and destinations.** Know what will start, where it is configured, and where status is
  observed.

After the operation finishes, refresh the WebUI if prompted so its newly registered menus appear.
Use the package's **Manage** and **Status** destinations, rather than guessing a service name or
editing generated files.

## A safe installation sequence

1. Read the catalog entry and its focused guide. Define the traffic, identities, routes, storage,
   and outbound connectivity the package needs.
2. Save a configuration backup and retain an out-of-band recovery path. A configuration restore
   point protects the FreeSense configuration, but it is not a substitute for a tested recovery
   procedure.
3. In **System → Package Manager → Available Packages**, select the package and read its package
   details. Confirm its capability badges match the intended design.
4. Install one integration at a time. Wait for the Package Manager to report completion; do not
   close or refresh the progress page while it is applying the action.
5. Configure the integration, then validate service health and the intended network outcome. For
   example, a VPN requires a handshake *and* expected routes and firewall policy; an IDS requires
   events and expected non-disruption.
6. Record the owner, change window, rollback decision, and any credentials or upstream account
   dependencies in your operations record.

## Reinstalling and removing packages

From **Installed Packages**, you can reinstall one package or reinstall all packages. A single
reinstall is useful when its files or registration need repair. Reinstalling all packages is a
broader recovery action: schedule it, keep access to the appliance, and allow it to complete
without refreshing the progress page.

Removal runs the package's supported uninstall behavior. It can stop a service, remove menu pages,
and—depending on the package and its retention setting—remove configuration or generated security
state. Review the package guide before removal. FreeSense blocks removal of packages that are vital
to system operation.

Do not remove packages by deleting files or issuing untracked package-manager commands. That can
leave configuration, service registration, or WebUI metadata out of sync.

## Keeping packages updated

Package updates arrive through the same repository and release channel as the OS. Check
**System → Update** (or Package Manager) and apply updates from your selected
[release channel](/guides/updates-and-channels/). Keep the package set aligned with the installed
system edition; do not mix repositories or manually pin an unrelated package build.

After an update, review the package service state, its logs or status page, and one representative
traffic or workflow test. For packages with scheduled downloads, confirm that the next scheduled
run is still permitted by DNS, routing, and firewall policy.

## Troubleshooting package actions

The progress page presents the action result and its operation log. Capture the error and the
package name before making a second attempt. Common checks are:

- confirm the appliance has usable DNS, a default route, and permitted access to the configured
  package repository;
- check free storage and memory, especially for intensive inspection or flow-collection packages;
- ensure another update or package operation is not running;
- use a **single-package reinstall** only after identifying that the package files or registration
  are the likely cause; and
- restore configuration or use console recovery if a change affects management reachability.

When escalating an issue, include the installed FreeSense edition, package name and version,
operation log, and whether the failure occurred during install, service start, or actual traffic.

## Building your own

Because the package recipes are open, you can build the system and runtime ports from
[`freesense-system-ports`](https://github.com/FreeSense-org/freesense-system-ports) and the optional
package ports from [`freesense-packages`](https://github.com/FreeSense-org/freesense-packages), then
serve them from your own repository if you prefer to self-host.

:::caution[Plan intensive packages]
Packages marked **intensive**, such as Suricata, ntopng, or large DNS/IP feed processing, need more
memory, CPU, and storage than the base firewall. Enable the smallest useful feature set first and
observe appliance headroom before adding more inspection or retention.
:::
