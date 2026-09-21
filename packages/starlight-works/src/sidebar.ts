import type { StarlightUserConfig } from '@astrojs/starlight/types';
import type { StarlightRouteData } from '@astrojs/starlight/route-data';

type NativeSidebar = NonNullable<StarlightUserConfig['sidebar']>;
type NativeGroup = Extract<NativeSidebar[number], { items: unknown }>;
type Destination =
  | { link: string; slug?: never }
  | { slug: string; link?: never }
  | { link?: never; slug?: never };

/** A normal Starlight group with an optional category destination and explicit initial state. */
export type SidebarGroup = Omit<NativeGroup, 'items' | 'collapsed'> & Destination & {
  items: readonly SidebarItem[];
  /** Defaults to true. A current category or descendant always opens its ancestors. */
  defaultOpen?: boolean;
};

/** Native links, slugs and autogeneration remain available at every nesting level. */
export type SidebarItem = Exclude<NativeSidebar[number], NativeGroup> | SidebarGroup;

export const CATEGORY_MARKER = 'data-slw-category';
type Entry = StarlightRouteData['sidebar'][number];
type Group = Extract<Entry, { type: 'group' }>;
type Link = Extract<Entry, { type: 'link' }>;

/** Compile our small authoring extension to Starlight's public configuration, without mutation. */
export function compileSidebar(items: readonly SidebarItem[]): NativeSidebar {
  const ancestors = new Set<object>();
  const convert = (input: readonly SidebarItem[], path: string): NativeSidebar => {
    if (!Array.isArray(input)) throw new TypeError(`${path} must be an array.`);
    return input.map((item, index) => {
      const where = `${path}[${index}]`;
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw new TypeError(`${where} must be a sidebar item.`);
      }
      if (!('items' in item)) return { ...item };
      if (ancestors.has(item)) throw new TypeError(`${where} contains a circular sidebar group.`);
      const allowed = new Set(['label', 'items', 'link', 'slug', 'defaultOpen', 'translations', 'badge']);
      for (const key of Object.keys(item)) {
        if (!allowed.has(key)) throw new TypeError(`${where}.${key} is not supported; use defaultOpen instead of collapsed.`);
      }
      if (typeof item.label !== 'string' || !item.label.trim()) {
        throw new TypeError(`${where}.label must be non-empty text.`);
      }
      if (item.defaultOpen !== undefined && typeof item.defaultOpen !== 'boolean') {
        throw new TypeError(`${where}.defaultOpen must be a boolean.`);
      }
      if (item.link !== undefined && item.slug !== undefined) {
        throw new TypeError(`${where} must choose link or slug, not both.`);
      }
      for (const key of ['link', 'slug'] as const) {
        const value = item[key];
        if (value !== undefined && (typeof value !== 'string' || !value.trim())) {
          throw new TypeError(`${where}.${key} must be non-empty text.`);
        }
      }
      ancestors.add(item);
      const children = convert(item.items, `${where}.items`);
      ancestors.delete(item);
      const { items: _items, defaultOpen = true, link, slug, ...base } = item;
      if (link !== undefined || slug !== undefined) {
        if (children.length === 0) throw new TypeError(`${where} needs children; use a normal link for a leaf.`);
        const destination = link !== undefined ? { link } : { slug: slug! };
        children.unshift({ ...base, ...destination, attrs: { [CATEGORY_MARKER]: true } });
      }
      return { ...base, collapsed: !defaultOpen, items: children };
    });
  };
  return convert(items, 'sidebar');
}

export function hasCurrent(entries: readonly Entry[]): boolean {
  return entries.some((entry) => entry.type === 'link' ? entry.isCurrent : hasCurrent(entry.entries));
}

/** Read only documented route-data shapes; never import Starlight's internal sidebar generator. */
export function groupView(group: Group): { category: Link | undefined; entries: Entry[]; open: boolean } {
  const category = group.entries.find((entry): entry is Link =>
    entry.type === 'link' && entry.attrs[CATEGORY_MARKER] === true);
  return {
    category,
    entries: group.entries.filter((entry) => entry !== category),
    open: !group.collapsed || hasCurrent(group.entries),
  };
}
