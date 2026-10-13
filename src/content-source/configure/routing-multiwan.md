---
title: Routing and multi-WAN
description: Add gateways and static routes, build failover and load-sharing gateway groups, policy-route selected traffic, and test a WAN failure.
---

This page is the procedure for routing changes. For how gateways, monitoring, policy routing,
dynamic routing, and high availability fit together, see
[routing and high availability](/base-os/routing-and-high-availability/).

Keep ordinary default-gateway routing separate from policy-routing exceptions, so a future operator
can explain why a flow takes a particular path.

## Add or check a gateway

1. Open **System → Routing → Gateways**. A WAN with DHCP, PPPoE, or SLAAC gets a dynamic gateway
   automatically.
2. For a static WAN, select **Add**, choose the **Interface** and **Address Family**, enter a **Name**
   and the **Gateway** address, and save.
3. Enter a **Monitor IP** that reflects real upstream reachability, such as a stable public resolver,
   rather than relying on the gateway address alone.
4. In the **Default gateway** section, choose **Default gateway IPv4** and **Default gateway IPv6**
   (a gateway, a failover gateway group, or **Automatic**), save, then select **Apply Changes**.
5. Confirm the gateway is online in **Status → Gateways**.

Use a different monitor address for each WAN. The firewall adds a static route for each monitor
address through its gateway unless **Do not add static route for gateway monitor IP address via the
chosen interface** is enabled.

## Add a static route

1. Open **System → Routing → Static Routes** and select **Add**.
2. Enter the **Destination network** and choose the **Gateway** that reaches it.
3. Add a **Description** with the purpose and owner, save, and apply.
4. Verify the route in **Diagnostics → Routes** and test the return path from the remote side.

## Build a gateway group

1. Open **System → Routing → Gateway Groups** and select **Add**.
2. Enter a **Group Name**.
3. Under **Gateway Priority**, give each gateway a **Tier**: the lowest tier is used first, and
   gateways on the same tier share connections. **Never** excludes a gateway.
4. Choose a **Trigger Level**: **Member Down**, **Packet Loss**, **High Latency**, or **Packet Loss or
   High Latency**.
5. Save and apply. Check the group in **Status → Gateways → Gateway Groups**.

| Goal | Tier layout |
| --- | --- |
| Failover from WAN to WAN2 | WAN on Tier 1, WAN2 on Tier 2 |
| Load sharing | WAN and WAN2 both on Tier 1 |
| Load sharing with a backup | WAN and WAN2 on Tier 1, LTE on Tier 2 |

## Policy-route selected traffic

1. Open **Firewall → Rules** on the interface where the traffic enters, for example LAN.
2. Edit or add the pass rule for that traffic, select **Display Advanced**, and under **Advanced
   Options** set **Gateway** to a gateway or gateway group.
3. Place the rule below any rules that must stay on the default path, such as traffic to other local
   networks or VPNs; policy-routed traffic does not consult the routing table.
4. Save, apply, and document the expected return path.

Check outbound NAT for every WAN in **Firewall → NAT → Outbound**. In automatic mode every local
network is translated on each WAN.

## Test a WAN failure

1. Note the current state in **Status → Gateways**.
2. Disconnect the primary uplink, or block its monitor address upstream.
3. Confirm that the gateway goes down, the group moves to the next tier, and clients reconnect.
   Existing connections may need to restart unless failover states are kept.
4. Restore the uplink and confirm that traffic returns.
5. Review **Status → System Logs** (gateway events) and any notifications you configured.

## Dynamic routing

Use the [FRR](/packages/frr/) Optional Package for OSPF, BGP, and other routing protocols. Keep its
configuration, route filters, and redistribution under change control, and test with route filters in
place before you advertise anything to a provider.

## Multicast and discovery across segments

The [multicast bridge](/packages/mcast-bridge/), [mDNS bridge](/packages/mdns-bridge/),
[UDP broadcast relay](/packages/udpbroadcastrelay/), and [Avahi](/packages/avahi/) packages, and the
built-in **Services → IGMP Proxy**, each forward one kind of discovery or multicast traffic between
segments. Enable only the path you need; broad forwarding can undo the segmentation that VLANs provide.
