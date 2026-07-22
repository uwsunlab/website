import { isExternalHref } from '../src/utils/links.ts';

/**
 * Opens outbound links in rendered Markdown in a new tab.
 *
 * Astro's Markdown pipeline emits bare `<a href>` elements, so this is the only
 * place bodies rendered through `render()` — the home overview, news items,
 * media posts and people bios — can pick up target/rel. Template anchors set
 * the same attributes inline via `externalLinkAttrs`.
 *
 * A link that already declares a `target` is left untouched, which is how a
 * single link opts out: write it as raw HTML with `target="_self"`.
 */
export default {
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const properties = node.properties ?? {};
      if (properties.target || !isExternalHref(properties.href)) return;

      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', 'noopener noreferrer');
    }
  }
};
