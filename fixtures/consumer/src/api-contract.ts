import starlightWorks, { type SidebarItem, type SidebarGroup, type StarlightWorksOptions, type AlertType } from '@wolfsblvt/starlight-works';

const group: SidebarGroup = { label: 'Guide', slug: 'guide', defaultOpen: false, items: ['guide/start'] };
const sidebar: readonly SidebarItem[] = ['index', group, { autogenerate: { directory: 'reference' } }];
const options: StarlightWorksOptions = { sidebar, alerts: { labels: { NOTE: 'Hinweis' } } };
starlightWorks(options);
const kind: AlertType = 'IMPORTANT';
void kind;

// @ts-expect-error A linked group has exactly one destination.
const conflicting: SidebarGroup = { label: 'Invalid', slug: 'guide', link: '/guide/', items: ['guide/start'] };
// @ts-expect-error The public option is defaultOpen, not Starlight's native collapsed field.
const oldShape: SidebarGroup = { label: 'Invalid', collapsed: true, items: ['guide/start'] };
// @ts-expect-error A fifth semantic type cannot be renamed to a four-type aside variant.
const incorrect: AlertType = 'DANGER';
void [conflicting, oldShape, incorrect];
