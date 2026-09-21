# Decisions

## Meaning

These decisions preserve the implementation rationale behind starlight-works' small public boundary. They explain why the candidate uses native Starlight data, separate navigation/disclosure controls and a five-type parsed-Markdown transform; they are not a claim that the initial candidate has been accepted or released.

## Keep category routes in Starlight's native sidebar data

**Date:** 2026-09-21 · **Status:** Candidate implementation choice

A linked group compiles to a native Starlight group whose first native link represents its category page. A reserved marker lets the renderer lift that link into the heading without removing it from the host's route and pagination data.

**Why.** Starlight remains the owner of route resolution, base paths, localization, current-page detection and pagination. The extension needs a rendering distinction, not another route generator.

**Rejected.** Matching groups by display label is ambiguous under duplicate names and translation. Importing internal sidebar generators would widen the compatibility risk. A parallel route registry would create another source of truth for consumers.

**Current consequence.** The public plugin compiles configuration and overrides only Sidebar; category entries remain real Starlight entries. Explicit raw links follow Starlight's own URL rules.

**Sources.** The selected two-capability product boundary in [Vision](VISION.md); the author's implementation judgment; Starlight's [plugin](https://starlight.astro.build/reference/plugins/), [sidebar](https://starlight.astro.build/guides/sidebar/) and [route-data](https://starlight.astro.build/reference/route-data/) contracts.

## Put navigation beside native disclosure, not inside it

**Date:** 2026-09-21 · **Status:** Candidate implementation choice

The category anchor is outside its sibling `details` element. The native `summary` is the adjacent disclosure control, and the children are inside `details`.

**Why.** The two actions have independent semantics, focus targets and activation behavior. Native disclosure works before and without JavaScript; current ancestry and defaults can be rendered on the server.

**Rejected.** A link nested inside summary entangles navigation and expansion. A JavaScript-only button/panel system requires client state merely to reproduce native behavior. Cross-visit persistence adds an unnecessary second explanation for why a group is open.

**Current consequence.** Multiple groups can stay open. A page render restores declared defaults, overridden by current ancestry. Starlight still owns the mobile navigation shell and its own JavaScript behavior.

**Sources.** The authored markup and browser qualification in this repository; the interaction destination in [Vision](VISION.md).

## Preserve five meanings through one parsed-tree transform

**Date:** 2026-09-21 · **Status:** Candidate implementation choice

The package recognizes canonical GitHub alert markers in parsed blockquotes and emits five independent labeled aside variants. Satteri and Unified adapters share that transformation.

**Why.** Important is not another spelling of Warning, and a custom title must not replace the semantic label. Keeping rich parsed children avoids destructive HTML-string rewriting.

**Rejected.** Mapping the five markers onto Starlight's four native aside variants loses meaning. Copying an unrelated alert plugin would add an attribution and maintenance dependency without solving that mismatch. Regex replacement over final HTML cannot reliably preserve nested Markdown or MDX.

**Current consequence.** The marker's exact uppercase type survives in a data attribute; an optional standalone bold title is retained beside a visible label. Unknown markers and non-alert quotations retain their normal role.

**Sources.** [API](api.md#github-alerts); Astro's [Markdown processor contract](https://docs.astro.build/en/guides/markdown-content/); the authored pure transform and consumer fixture.

## Keep distribution separate from source acceptance

**Date:** 2026-09-21 · **Status:** Current candidate boundary

The repository builds and verifies a local MIT-licensed tarball but does not publish npm packages, tags, Releases or deployments.

**Why.** A reviewable library artifact is useful without conflating an implementation contribution with permission to distribute a supported release.

**Rejected.** A release workflow, hosted demo or registry probe with write effects would add unrelated authority and maintenance obligations to this small package.

**Current consequence.** Source-install instructions use the generated tarball; compatibility claims remain scoped to recorded qualification. Publication and release communication require a separate actual release decision.
