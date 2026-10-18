---
title: Security advisories and vulnerabilities
description: Where to see which FreeBSD security advisories affect FreeSense 1.0, 1.1 and 1.2, where FreeSense's own bugs are tracked, and how to report a vulnerability privately.
---

FreeSense is built on FreeBSD, so FreeBSD's security advisories matter to FreeSense. The
[FreeSense security site](https://security.freesense.org/) lists them, says what each one means for
each FreeSense version, and shows FreeSense's own bugs and issues next to them.

## What the security site shows

Every FreeBSD security advisory since 2025 has a status for **FreeSense 1.0, 1.1 and 1.2**:

| Status | Meaning |
| --- | --- |
| **Open** | The advisory applies to code FreeSense builds, and the fix is not in the FreeBSD source snapshot that version builds from yet. |
| **Fixed** | FreeBSD corrected it before that snapshot. |
| **Not relevant** | It is about code FreeSense does not build or ship. The page names the evidence from the build configuration. |

Each advisory has its own page with the CVE IDs, the affected FreeBSD releases, the correction
dates, any workaround and a link to the original FreeBSD advisory. FreeSense bugs and issues from
GitHub are listed in the same place with a badge: **Bug**, **Security report** or **Issue**.

Useful starting points:

- [Open vulnerabilities](https://security.freesense.org/open/), the ones to check first.
- [All entries for FreeSense 1.1](https://security.freesense.org/all/?version=1.1) (Stable), and for
  [1.2](https://security.freesense.org/all/?version=1.2) (Development).
- [How the statuses are decided](https://security.freesense.org/triage/).
- A machine-readable copy of every decision: [vulnerabilities.json](https://security.freesense.org/vulnerabilities.json).

## What the status does not tell you

Most statuses are decided automatically, by comparing the date FreeBSD corrected an advisory with
the date of the FreeBSD source a version is pinned to. They are marked **auto** until a maintainer
reviews them.

- A status says nothing about whether your own system is exposed. A bug in a kernel module only
  matters if the module is loaded, and many advisories name a workaround.
- FreeBSD advisories carry no severity score, so the site shows none.
- FreeSense 1.0 is frozen. An advisory that is open on 1.0 stays open there; the fix is to update to
  1.1. See [Upgrading from 1.0](/guides/upgrading-from-1.0/).
- For now the site covers the FreeBSD base system and FreeSense's GitHub issues. Advisories for ports
  and for the optional packages are planned.

## Getting a fix

A fix that FreeBSD published after the pin of a version arrives with the next FreeBSD pin of that
version. See [Updates and release channels](/guides/updates-and-channels/) for how updates reach
your firewall, and the [release notes](/releases/1.1.9/) for what each release contains.

## Report a vulnerability

Please report a security problem in FreeSense **privately**, so it can be fixed before it is public:
[report it on the security site](https://security.freesense.org/report/). Do not open a public
issue for it.
