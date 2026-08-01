# Edition overrides

`src/content-source/` is the Stable 1.0.5 baseline and the default source for
both public documentation editions.

When rolling 1.1 behavior differs, copy only the affected source file to
`devel/<same-relative-path>` and update that complete replacement. For example,
the Development-only version of `packages/wireguard.md` belongs at:

```text
src/content-overrides/devel/packages/wireguard.md
```

The generator uses the override only for `/1.1/`; the Stable root continues to use
the shared Stable body. Do not edit `src/content/docs/` or
`src/content/docs/1.1/`, because they are regenerated before preview,
validation, and build.

Most Stable corrections belong in the shared source because Development should
inherit them. If a correction applies only to the frozen Stable release, use
`stable/<same-relative-path>` with the same complete-page rule.

An override must remain a complete, independently readable page. Do not use
inline conditional prose for edition differences.
