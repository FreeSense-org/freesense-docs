---
title: Documentation policy
description: How to contribute original, version-aware FreeSense documentation.
channels: [devel, stable]
last_verified_release: '1.0'
---

FreeSense documentation is original project work. Do not copy vendor documentation prose,
screenshots, diagrams, tables, branding, or navigation wording. External documentation can identify
a topic that needs coverage, but it is not a source file.

## Evidence standard

Every technical claim should be supported by one or more of:

- FreeSense source code, package metadata, or release manifest;
- a reproducible test on the documented channel and version; or
- a primary upstream protocol or project document when FreeSense behavior depends on it.

## Required page metadata

New operator pages declare their supported channels and `last_verified_release`. Package pages also
identify relevant packages and capabilities. Pages that describe a Stable artifact must record the
matching tagged release contract. Development-only guidance must state that the channel is
experimental and unsupported.

## Recipe standard

A recipe needs prerequisites, a topology, ordered actions, verification, rollback, and a maintenance
owner. Never publish real credentials, customer addresses, private keys, or screenshots containing
secrets.

## Review

Changes to firewall, routing, VPN, authentication, release, and security guidance need a technical
reviewer who can verify the behavior. Documentation CI checks the package catalog contract, source
policy, and build output; human review remains responsible for accuracy and safety.

## Channel publication and retention

Development pages describe the moving 1.1 implementation and should state the date or build context
when it materially affects behavior. They must not imply production support. Stable documentation
describes the tagged 1.0.x line and its sealed provenance. Never silently rewrite a historical
release contract; publish an erratum or a new tagged maintenance release such as 1.0.1 instead.
