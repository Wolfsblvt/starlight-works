# @wolfsblvt/starlight-works

## Meaning

Two small extensions for Astro Starlight: category pages that are links next to independent native disclosures, and all five GitHub Markdown alert types without semantic merging. The package inherits your site's typography and theme rather than supplying a product skin.

## Use

This source package has not been published to npm. Build the repository and install its generated `.tgz` in your Starlight project; the repository README gives the complete path.

```js
import starlight from '@astrojs/starlight';
import starlightWorks from '@wolfsblvt/starlight-works';

starlight({
  title: 'Documentation',
  plugins: [starlightWorks({
    sidebar: [
      'index',
      { label: 'Guide', slug: 'guide', defaultOpen: true, items: ['guide/start'] },
    ],
  })],
});
```

Do not also set `starlight.sidebar` or a competing `Sidebar` override. Omit this plugin's sidebar option to retain native navigation and use only alerts. Alerts are enabled by default; `alerts: false` disables them. `alerts.labels` can translate the five visible semantic labels without changing their canonical types.

```md
> [!NOTE]
> **In development**
> Context with [a link](/guide/).
```

`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION` remain independent. Ordinary and unsupported quotations remain quotations. Markdown is parsed by the host, not a regular-expression replacement over HTML.

## Compatibility and limits

The package targets Starlight `~0.42.2`, Astro `^7.2.10`, and Node `>=22.12.0`. It supports Astro's Satteri and optional Unified processors. Qualification evidence and detailed API/style documentation live in the source repository. It does not promise support for other Starlight minor lines or third-party Markdown processors.

Native disclosures work without JavaScript. Current ancestry opens on each page render; open states are not persisted across visits. The plugin is not a sanitizer for untrusted Markdown, MDX, HTML, or configuration.

## License

Licensed under [MIT](LICENSE), allowing use, modification, and redistribution with the license notice retained.
