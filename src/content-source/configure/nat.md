---
title: Network Address Translation
description: Use outbound, port-forward, and one-to-one NAT deliberately and with matching policy.
channels: [devel, stable]
last_verified_release: development
---

NAT changes addresses; firewall rules decide whether traffic is allowed. Design and test both parts together.

## Common NAT forms

- **Outbound NAT** translates internal networks when they reach an external interface.
- **Port forwards** direct selected inbound traffic to an internal destination.
- **One-to-one NAT** maps a public address to an internal address for broader exposure.

## Safe port-forward workflow

1. Confirm the target service is listening on the intended internal address.
2. Create the narrowest translation possible.
3. Add or verify the matching WAN policy rule.
4. Test from an external path, not only from inside the same network.
5. Review logs and remove temporary broad rules.

If a reverse proxy such as HAProxy terminates traffic, document which component owns TLS, health checks, headers, and the public listener. Avoid overlapping port forwards and proxy listeners.
