---
title: Secure Web Gateway
description: Configure explicit or transparent web proxying, TLS inspection, native policies, identity, threat feeds, ICAP, and local malware scanning.
channels: [devel]
last_verified_release: development
---

FreeSense Web Gateway 2.0 protects outbound web traffic with a pinned Squid 7
engine and native FreeSense policy, certificate, PF, identity, feed and service
integration. It replaces the retired Squid and SquidGuard package model.

## Choose a deployment mode

- **Explicit proxy** is the safest starting point. Configure managed clients or
  deploy the generated PAC file.
- **Transparent HTTP** redirects TCP/80 from selected internal interfaces.
- **Transparent HTTPS** requires TLS inspection, a deployed inspection CA, and
  careful application compatibility testing.

WAN and gateway-facing interfaces cannot be selected. Transparent rules bypass
firewall-owned, management, private and explicitly exempt destinations.

## HTTPS modes

**Tunnel only** is the default. HTTPS remains encrypted between clients and
destinations, while host, SNI and IP policy remains available.

**Selective inspection** decrypts only configured destinations. **Full
inspection** decrypts by default while preserving built-in and custom bypasses
for pinned applications, mutual TLS, update systems, authentication and PKI.

Inspection requires an internal CA with its private key. Deploy the public CA
to managed clients before enabling inspection. Never install an inspection CA
on unmanaged or untrusted devices.

## Policies and identity

Policies compile directly to Squid ACLs. Allow/block destinations and threat
feeds work without decryption; URL paths, MIME types and response scanning need
inspection. Use the simulator to check the resulting access and TLS decision.

Explicit listeners support enabled, non-expired local users, LDAP/AD, RADIUS and
Kerberos/Negotiate. Transparent listeners use source network policy and cannot
reliably present browser authentication challenges.

## Threat protection

External ICAP services can inspect requests and responses with explicit
fail-open or fail-closed behavior. The optional **Web Gateway Local Antivirus**
companion installs ClamAV, c-icap and squidclamav. Local scanning sees HTTPS
response bodies only for inspected destinations.

Feed downloads must use HTTPS. They are bounded, normalized, deduplicated and
staged before activation. An hourly scheduler checks the configured update
interval, and a failed update keeps the last-known-good database.

## Safe rollout

1. Start with an explicit listener and tunnel-only HTTPS.
2. Apply a small domain policy and verify it with the simulator.
3. Deploy PAC settings to a test client group.
4. If inspection is required, create a dedicated CA and deploy it to those
   clients before selecting selective inspection.
5. Add pinned or mutual-TLS applications to the splice list.
6. Enable transparent interception, QUIC fallback or fail-closed enforcement
   only after verifying the explicit deployment.

Every save is staged and checked with Squid’s parser. Failed activation restores
both the previous runtime files and the previous saved configuration. **Status > Emergency disable** removes
interception rules before stopping the service.

Inbound TLS termination and application publishing belong in HAProxy, not Web
Gateway.
