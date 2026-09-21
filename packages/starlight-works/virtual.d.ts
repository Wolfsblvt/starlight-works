// Standalone library checks do not run Starlight's virtual-module generator.
// Keep this one known host contract exact; real resolution is tested by the packed consumer.
declare module 'virtual:starlight/components/MobileMenuFooter' {
  const component: typeof import('@astrojs/starlight/components/MobileMenuFooter.astro').default;
  export default component;
}
