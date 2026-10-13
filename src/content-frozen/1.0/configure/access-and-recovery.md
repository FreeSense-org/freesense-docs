---
title: Users, certificates, and backup
description: Protect administrator access and make every configuration change recoverable.
channels: [devel, stable]
last_verified_release: development
---

Administrator access, certificates, and the configuration backup are the control plane for every FreeSense deployment. Protect them before adding remote-access or complex service features.

## Administrative access

Create named administrator accounts instead of sharing a single password. Grant the minimum privileges required, keep WebUI access on trusted interfaces, and test a non-console recovery path only after a console fallback is available.

## Certificate material

Certificates and private keys affect VPN, WebUI, proxy, and service availability. Record the owner, expiration, renewal mechanism, and deployment target. Do not paste private material into issue trackers, recipes, or public documentation.

## Back up and recover

Export a configuration before upgrades, interface changes, package removals, and broad policy edits. Store backups securely because they may contain credentials and private keys. Test restoration in a lab or maintenance window; a backup that has never been restored is only a hypothesis.
