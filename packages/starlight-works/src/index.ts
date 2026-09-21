import { fileURLToPath } from 'node:url';
import { isSatteriProcessor } from '@astrojs/markdown-satteri';
import type { StarlightPlugin } from '@astrojs/starlight/types';
import { compileSidebar } from './sidebar.js';
import type { SidebarItem } from './sidebar.js';
import { remarkGithubAlerts, resolveAlertLabels, transformAlert } from './alerts.js';
import type { AlertOptions } from './alerts.js';

export type { SidebarItem, SidebarGroup } from './sidebar.js';
export type { AlertType, AlertOptions } from './alerts.js';

export interface StarlightWorksOptions {
  /** Supply the sidebar here instead of starlight.sidebar to enable linked groups. */
  sidebar?: readonly SidebarItem[];
  /** Five semantic GitHub alerts are enabled by default. */
  alerts?: false | AlertOptions;
}

// Resolve while Astro's configuration module runner is alive. Unified remains optional.
const unifiedModule = import('@astrojs/markdown-remark').catch(() => undefined);

export default function starlightWorks(options: StarlightWorksOptions = {}): StarlightPlugin {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('starlightWorks expects an options object.');
  for (const key of Object.keys(options)) {
    if (key !== 'sidebar' && key !== 'alerts') throw new TypeError(`Unknown starlightWorks option: ${key}.`);
  }
  const sidebar = options.sidebar === undefined ? undefined : compileSidebar(options.sidebar);
  const labels = options.alerts === false ? undefined : resolveAlertLabels(options.alerts);
  return {
    name: '@wolfsblvt/starlight-works',
    hooks: {
      'config:setup': ({ config, updateConfig, addIntegration }) => {
        if (sidebar !== undefined) {
          if (config.sidebar !== undefined) throw new Error('Configure the sidebar in starlightWorks({ sidebar }), not also in starlight({ sidebar }).');
          if (config.components?.Sidebar) throw new Error('starlight-works owns the Sidebar override when its sidebar option is set. Remove the competing override or use alerts only.');
          updateConfig({
            sidebar,
            components: { ...config.components, Sidebar: fileURLToPath(new URL('./components/Sidebar.astro', import.meta.url)) },
          });
        }
        if (sidebar !== undefined || labels) {
          updateConfig({ customCss: [...(config.customCss ?? []), fileURLToPath(new URL('./styles.css', import.meta.url))] });
        }
        if (!labels) return;
        addIntegration({
          name: 'starlight-works-alerts',
          hooks: {
            'astro:config:setup': async ({ config: astroConfig }) => {
              const processor = astroConfig.markdown.processor;
              if (isSatteriProcessor(processor)) {
                processor.options.mdastPlugins.push({
                  name: 'starlight-works-github-alerts',
                  blockquote: (node) => transformAlert(node, labels),
                });
                return;
              }
              const unified = await unifiedModule;
              if (unified?.isUnifiedProcessor(processor)) {
                processor.options.remarkPlugins.push([remarkGithubAlerts, labels]);
                return;
              }
              throw new Error('starlight-works alerts require Astro’s Satteri or Unified Markdown processor. Set alerts: false to use only the sidebar with another processor.');
            },
          },
        });
      },
    },
  };
}
