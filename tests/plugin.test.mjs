import { test } from 'node:test';
import assert from 'node:assert/strict';
import starlightWorks from '../packages/starlight-works/dist/index.js';

function configure(options, config = {}) {
  const updates = [];
  const integrations = [];
  const plugin = starlightWorks(options);
  plugin.hooks['config:setup']({ config, updateConfig: (value) => updates.push(value), addIntegration: (value) => integrations.push(value) });
  return { updates, integrations };
}

test('alerts alone preserve the native sidebar and unrelated consumer configuration', () => {
  const result = configure({}, { sidebar: ['index'], components: { Header: '/header.astro' }, customCss: ['/existing.css'] });
  assert.equal(result.updates.length, 1);
  assert.equal(result.updates[0].customCss[0], '/existing.css');
  assert.equal(result.integrations.length, 1);
  assert.equal(result.updates.some((update) => 'sidebar' in update || 'components' in update), false);
});

test('linked sidebar wiring preserves other overrides and detects competing ownership', () => {
  const options = { sidebar: [{ label: 'Guide', slug: 'guide', items: ['guide/start'] }], alerts: false };
  const result = configure(options, { components: { Header: '/header.astro' } });
  assert.equal(result.updates[0].components.Header, '/header.astro');
  assert.match(result.updates[0].components.Sidebar, /Sidebar\.astro$/);
  assert.equal(result.integrations.length, 0);
  assert.throws(() => configure(options, { sidebar: [] }), /not also/);
  assert.throws(() => configure(options, { components: { Sidebar: '/other.astro' } }), /competing override/);
});

test('disabling both features is a no-op and unknown options are rejected', () => {
  assert.deepEqual(configure({ alerts: false }), { updates: [], integrations: [] });
  assert.throws(() => starlightWorks({ sidebr: [] }), TypeError);
  assert.throws(() => starlightWorks(null), TypeError);
});

test('an unsupported Markdown processor fails clearly instead of silently losing alerts', async () => {
  const { integrations } = configure({});
  await assert.rejects(() => integrations[0].hooks['astro:config:setup']({ config: { markdown: { processor: { name: 'other' } } } }), /require Astro/);
});
