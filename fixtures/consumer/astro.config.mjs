import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightWorks from '@wolfsblvt/starlight-works';

const markdown = process.env.WORKS_PROCESSOR === 'unified'
  ? { processor: (await import('@astrojs/markdown-remark')).unified() }
  : undefined;

export default defineConfig({
  site: 'https://example.invalid',
  base: process.env.WORKS_BASE || '/manual/',
  trailingSlash: 'always',
  ...(markdown ? { markdown } : {}),
  integrations: [starlight({
    title: 'Starlight Works fixture',
    customCss: ['./src/custom.css'],
    plugins: [starlightWorks({
      sidebar: [
        { label: 'Overview', slug: 'index' },
        {
          label: 'Guide', slug: 'guide', defaultOpen: true,
          items: [
            { label: 'Start', slug: 'guide/start', badge: { text: 'MDX', variant: 'note' } },
            { label: 'Advanced', slug: 'guide/advanced', defaultOpen: false, items: ['guide/advanced/deep'] },
          ],
        },
        {
          label: 'Reference with a deliberately long category label', slug: 'reference', defaultOpen: false,
          items: [{ label: 'Reference item', slug: 'reference/item' }],
        },
        { label: 'Generated', defaultOpen: true, items: [{ autogenerate: { directory: 'generated' } }] },
        { label: 'External example', link: 'https://example.invalid/', attrs: { target: '_blank', rel: 'noreferrer', 'data-fixture-external': true } },
      ],
    })],
  })],
});
