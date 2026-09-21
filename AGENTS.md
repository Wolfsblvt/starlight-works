# starlight-works repository instructions

## Meaning

This repository maintains one small, product-neutral Starlight package: linked sidebar categories and five semantic GitHub alerts. These instructions own the repository commands and source boundary; they grant no integration, publication, deployment or settings effect.

## Commands and boundaries

Use Node 22.12 or later; Node 24 is the current CI development line. Bootstrap with `npm install` until the initial lockfile is admitted, then `npm ci`. Build with `npm run build`, check Astro components with `npm run check`, and run ordinary verification with `npm test`. `npm run test:consumer` installs the real tarball into an isolated temporary project and checks/builds it. After that, `npm run dev` opens the fixture development server on loopback, and `npm run test:browser` exercises its production build. Install the browser first with `npx playwright install chromium`. The complete command and evidence boundary belongs in [Development](docs/DEVELOPMENT.md).

Keep the public API in `packages/starlight-works`; never add a product's routes, typography, branding or business content. Preserve native Starlight routing and page data, separate category navigation from disclosure, and retain all five alert types. Test a packed installation, not just workspace imports. Generated package files and fixture state are not source.

## Durable branch boundary

The intended durable integration line is `main`. At bootstrap it is unborn: its existing rules require the GitHub Actions `Tests` check even for branch creation. The license-only `chore/review-base` provides an initial draft PR comparison and became GitHub's default automatically when initialized. It is not a released line. Do not merge into it as a substitute for accepting the package. Initializing `main` from accepted checked source and selecting the repository default are separate owner-controlled consequences.

```text
main:
  maintainer integration: direct allowed
  external contributions: PR required
  required pre-integration evidence: Tests
  required approval/review: none
  resolved conversations: no
  automatic CI: Verification
  automatic retained branch effects: none
  other pre-update evidence: current attributable integration authority
```

The current contribution is a draft review candidate, not accepted source. There is no npm release, tag, deployment, credential, telemetry or hosted-service operation in this repository's ordinary commands. Publishing, release and provider configuration require their own authority.
