# Package API

## Meaning

This is the complete consumer contract for `@wolfsblvt/starlight-works`: plugin options, sidebar behavior, GitHub alert syntax, exports, styling and meaningful failure cases. It separates stable consumer-facing choices from private rendering helpers so adoption does not require knowledge of Starlight's internal route generator.

## Exports

```ts
import starlightWorks, {
  type StarlightWorksOptions,
  type SidebarItem,
  type SidebarGroup,
  type AlertType,
  type AlertOptions,
} from '@wolfsblvt/starlight-works';
```

`starlightWorks(options?)` returns a Starlight plugin. Its only options are `sidebar` and `alerts`. The optional `@wolfsblvt/starlight-works/style.css` export is the same structural stylesheet the plugin registers automatically; ordinary use does not require a second import. No internal helper or component path is a public export.

## Linked sidebar groups

```ts
const options = {
  sidebar: [
    'index',
    {
      label: 'Guide',
      slug: 'guide',
      defaultOpen: true,
      items: [
        { label: 'Start', slug: 'guide/start', badge: 'New' },
        {
          label: 'Advanced',
          slug: 'guide/advanced',
          defaultOpen: false,
          items: ['guide/advanced/deep'],
        },
      ],
    },
    { label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
  ],
} satisfies StarlightWorksOptions;
```

A group needs `label` and `items`. It may have **one** category destination: `slug` for a documentation entry or `link` for an explicit native Starlight URL. Omitting both creates an ordinary non-linked group. Prefer `slug` for content pages so the host resolves base paths and content identity. For `link`, follow Starlight's explicit-link rules, including any required base prefix; this package does not invent URL rewriting.

`defaultOpen` is a boolean and defaults to **true**. It replaces the native group's `collapsed` authoring field inside this extended sidebar; use one vocabulary, not both. A current category or descendant always opens its ancestors on a page render. Other groups retain their declared defaults. Several groups can remain open at once.

Native leaf slugs, link objects, badge options, translations, link attributes and autogeneration remain available. Groups can also carry the native `badge` and `translations` options. Category labels and badges pass through Starlight's native processing. A linked group needs at least one child; use a normal native link for a leaf.

The category anchor and adjacent native summary are different focus targets. Clicking the label navigates; activating the disclosure with pointer, Enter or Space changes only its open state. Current links use `aria-current="page"`. The browser exposes expanded state for the native disclosure. There is no client hydration or cross-visit persistence added by this package.

### Ownership and ordering

Move the selected sidebar from `starlight.sidebar` into this plugin. A simultaneous native sidebar or existing `components.Sidebar` override is rejected with an actionable error. Place the plugin after other configuration plugins and do not let a later plugin replace its Sidebar. The package preserves other component overrides, existing custom CSS and Starlight's mobile footer.

Omit `sidebar` entirely to leave native navigation untouched. `sidebar: []` deliberately selects the override with an empty sidebar. Internal `data-slw-*` markers are reserved; do not inject category markers through native link attributes.

## GitHub alerts

Alerts are on by default:

```md
> [!IMPORTANT]
> **Keep the context**
>
> - Rich Markdown stays intact.
> - Including [links](/guide/) and `inline code`.
```

The five exact uppercase markers are `NOTE`, `TIP`, `IMPORTANT`, `WARNING` and `CAUTION`. The marker must be the first content in its blockquote and be on its own line. Lowercase markers, unknown types, inline marker continuations and ordinary quotations are not converted.

A first standalone bold line becomes the custom title. It can follow the marker immediately or after a blank quoted line. Its semantic label remains visible: **Important — Keep the context**. Bold words at the start of an ordinary sentence are not mistaken for a title. Labels are plain text; title formatting and rich body nodes stay with the host renderer. Nested valid alerts can be recognized inside an ordinary outer quotation.

Each rendered aside has a class such as `slw-alert--important`, a canonical `data-slw-alert="IMPORTANT"` attribute, a visible `.slw-alert__title` caption and an accessible label. It is documentation content, not an interrupting ARIA live region. Its meaning never depends on color alone.

### Labels and disabling

```js
starlightWorks({
  alerts: {
    labels: {
      NOTE: 'Hinweis',
      TIP: 'Tipp',
      IMPORTANT: 'Wichtig',
      WARNING: 'Warnung',
      CAUTION: 'Vorsicht',
    },
  },
});
```

Overrides are optional, build-wide non-empty strings. Unspecified labels retain their English defaults. This API does not select a different label map automatically for each page locale. Canonical types and data attributes never change when labels are translated.

Use `alerts: false` to disable the Markdown integration. With no sidebar option as well, the plugin is a no-op. Starlight's native directive asides remain separate and keep their native meanings.

## Styling

The plugin registers structural CSS, not a theme. Starlight owns fonts, layout shells and the base palette. Consumer CSS can set these variables on `:root` or a narrower scope:

| Variable | Default or purpose |
| --- | --- |
| `--slw-sidebar-indent` | `0.75rem`; child-list indentation |
| `--slw-sidebar-control-size` | `2.75rem`; reserved disclosure target size |
| `--slw-sidebar-line` | Starlight's light hairline color |
| `--slw-sidebar-text` | Starlight's text color |
| `--slw-sidebar-current-text` | Starlight's inverted text color |
| `--slw-sidebar-current-bg` | Starlight's text-accent color |
| `--slw-sidebar-focus` | Starlight's text-accent color |
| `--slw-alert-note` | Starlight's high blue accent |
| `--slw-alert-tip` | Starlight's high green accent |
| `--slw-alert-important` | Starlight's high purple accent |
| `--slw-alert-warning` | Starlight's high orange accent |
| `--slw-alert-caution` | Starlight's high red accent |
| `--slw-alert-text` | Starlight's text color |
| `--slw-alert-background` | Transparent |
| `--slw-alert-radius` | `0.25rem` |
| `--slw-alert-padding` | `1rem` |

```css
:root {
  --slw-sidebar-indent: 0.9rem;
  --slw-alert-radius: 0.5rem;
}
```

`.slw-sidebar`, `.slw-category-link`, `.slw-alert`, each `.slw-alert--<type>` and `.slw-alert__title` are useful styling hooks. Prefer variables over overriding disclosure positioning. Keep target sizes, visible focus, readable text and semantic labels intact; arbitrary consumer CSS can invalidate the fixture's accessibility and layout evidence.

## Failures and trust boundary

Unknown plugin/options keys, malformed group destinations, non-boolean defaults, circular groups, empty linked categories and invalid labels fail early rather than silently losing intent. Starlight validates its own native content/URL/schema fields. Unsupported Markdown processors fail clearly when alerts are enabled; they can still use the sidebar with `alerts: false`.

This package does not sanitize untrusted Markdown, raw HTML, MDX, URLs or configuration. The consuming host and author trust model remain responsible for those inputs. Do not install two competing transforms for the same alert syntax and expect an arbitrary plugin ordering to preserve both outcomes.
