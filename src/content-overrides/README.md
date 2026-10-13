# Edition overrides

`src/content-source/` is the shared source for the maintained editions: Stable 1.1 at `/` and
Development 1.2 at `/1.2/`.

When Development behaviour differs from Stable, copy only the affected source file to
`devel/<same-relative-path>` and update that complete replacement. For example, a
Development-only version of `packages/wireguard.md` belongs at:

```text
src/content-overrides/devel/packages/wireguard.md
```

The generator uses the override only for `/1.2/`; the Stable root keeps the shared body. Do not
edit `src/content/docs/`, because it is regenerated before preview, validation, and build.

Most corrections belong in the shared source because Development should inherit them. If a
correction applies only to the Stable release, use `stable/<same-relative-path>` with the same
complete-page rule. When Development becomes the next Stable line, fold its overrides back into
the shared source.

The frozen 1.0 edition does not use overrides; it is built only from `src/content-frozen/1.0/`.

An override must remain a complete, independently readable page. Do not use inline conditional
prose for edition differences.
