# starlight-works repository instructions

## Meaning

This repository maintains one small, product-neutral Starlight package: linked sidebar categories and five semantic GitHub alerts. These instructions own the repository commands and source boundary; they grant no integration, publication, deployment or settings effect.

## Commands and boundaries

Use Node 22.12 or later; Node 24 is the current CI development line. Bootstrap with `npm install`. This source repository does not commit an installation lock; qualification artifacts retain the resolved repository and consumer locks, so a new unconstrained transitive resolution is not proof of an old dependency graph. Build with `npm run build`, check Astro components with `npm run check`, and run ordinary verification with `npm test`. `npm run test:consumer` installs the real tarball into an isolated temporary project and checks/builds it. After that, `npm run dev` opens the fixture development server on loopback, and `npm run test:browser` exercises its production build. Install the browser first with `npx playwright install chromium`. The complete command and evidence boundary belongs in [Development](docs/DEVELOPMENT.md).

Keep the public API in `packages/starlight-works`; never add a product's routes, typography, branding or business content. Preserve native Starlight routing and page data, separate category navigation from disclosure, and retain all five alert types. Test a packed installation, not just workspace imports. Generated package files and fixture state are not source.

## Estate and durable branch boundary

This repository belongs permanently to the Leitsatz estate. Standing Leitsatz seats may author and place Work here under the repository contract and an exact current grant; ownership alone grants no particular integration, publication, deployment or settings effect.

`main` is the durable integration line and GitHub default branch. The package is source-available but remains unpublished until a separately authorized npm release.

```text
main:
  maintainer integration: direct allowed
  external contributions: PR required
  fixed repository-wide evidence gate: none
  evidence selection: per Work, changed behavior and consequence
  default required approval/review: none
  review selection: per Work, impact and current authority
  resolved conversations: no
  automatic CI: Verification
  automatic retained branch effects: none
  other pre-update evidence: current attributable integration authority
```

These defaults do not waive evidence or review for a particular contribution. The current Work, changed behavior, retained boundaries and applicable authority determine what that candidate needs before integration.

There is no npm release, tag, deployment, credential, telemetry or hosted-service operation in this repository's ordinary commands. Publishing, release and provider configuration require their own authority.
