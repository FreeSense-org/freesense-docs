---
title: Custom package repositories
description: Add your own package repositories, or FreeBSD's, without ever putting FreeSense packages at risk.
---

**System → Package Manager → Repositories** lists where the firewall gets packages from and lets you
add more. It is for administrators who need software the FreeSense catalog does not offer.

:::caution
A custom repository is a third-party software source. Its packages are installed as root, are not
tested with FreeSense, and can do anything on the firewall. Only add a repository you trust, prefer
a signed one, and keep console or local-LAN access while you experiment.
:::

## What is listed

- **FreeSense** and **FreeSense-packages** are built in. They are always signed, cannot be edited or
  removed, and are the only repositories the system updater uses.
- **FreeBSD-ports** is FreeBSD's own package repository (the rolling *latest* branch). It is off by
  default; turn it on to install FreeBSD packages that FreeSense does not ship.
- **Custom repositories** are the ones you add (up to five).

## FreeSense always comes first

When two repositories offer the same package, pkg uses the one with the higher *priority*, whatever
the versions are. FreeSense repositories use priorities 10–100. Custom repositories get 5 down to 1
(the first in the list wins) and the FreeBSD repository gets 0. You cannot change these numbers, so a
custom repository can add packages but can never replace one that FreeSense provides.

Two more guards back this up:

- **The system updater never reads custom repositories.** Checking for updates, installing a firmware
  update and the nightly metadata refresh only look at the FreeSense repositories, so a firmware
  update cannot pull a core package from a third party. Plain `pkg` on the shell does see them.
- **Every install and removal is checked first.** The Package Installer works out what pkg would do
  and refuses anything that would upgrade, downgrade, reinstall or remove a package that is already
  installed, supply a package FreeSense already provides, or use a name reserved for FreeSense and the
  base system (`FreeSense-*`, `FreeBSD-*`, `php8*`, `pkg`, kernels). A removal is refused if it would
  take a FreeSense package with it.

## Adding a repository

1. Choose **Add repository**.
2. Give it a short lowercase **name** (names starting with `freesense` or `freebsd` are reserved) and
   its **https://** address. Plain `http://` is refused.
3. Choose how it is verified:
   - **Fingerprint** (recommended): the SHA-256 of the repository's public key, 64 hexadecimal digits.
   - **Public key**: paste the repository's PEM `PUBLIC KEY` block.
   - **Unsigned**: only after you tick the box that says an unsigned repository cannot be verified.
     Anyone who can alter it, or the connection to it, can install code on the firewall.
4. Save, then use **Refresh** on its row to fetch the package list and **Browse** to look through it.
   Installing goes through the usual Package Installer, with the review described above.

Use the arrows on a row to change a repository's priority relative to the other custom repositories.
Disabling a repository keeps its settings but stops pkg using it.

## Firmware updates

- The list of repositories is stored in the configuration, so it is kept across firmware updates, a
  configuration backup and a restore. The repository files are rebuilt from it every time the
  firewall starts its packages.
- Packages installed from a custom repository are kept too. A firmware update can change system
  libraries, though, so a package built for the old ones may need reinstalling afterwards. FreeSense
  never upgrades packages from custom repositories for you: use **Refresh** and reinstall when you
  choose to.

## From the shell

Plain `pkg` sees the custom repositories as well (after `pkg update`). Remember that anything you
install this way skips the safety review above, and that the FreeSense repositories still win on
priority.

## In the package lists

**Available Packages** and **Installed Packages** have a *Source* column and a *Source* filter.
FreeSense's own packages are marked **Official**, and both lists open showing only those.

- On **Available Packages**, switch the Source filter to a repository to list its packages (at
  most 300 at a time). Type in the search box to search the repository itself, which is how you
  find a package in FreeBSD's repository of tens of thousands.
- On **Installed Packages**, the packages that came from another repository are in the list too;
  choose *All sources* or the repository to see them.
- A package from another source offers **Install**, **Update** and **Remove** like an official one,
  through the same Package Installer. Before anything runs it is reviewed with the checks above, and
  an update may change only that package, from the repository it came from.
- The tiles at the top count the official packages only.
