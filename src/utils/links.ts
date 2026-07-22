const EXTERNAL_REL = 'noopener noreferrer';

/**
 * A link leaves the site when it carries its own scheme (http, https, mailto,
 * tel) or is protocol-relative. In-page fragments — which drive the gallery
 * lightbox — and root-relative paths stay in the current tab.
 */
export function isExternalHref(href: string | undefined | null): boolean {
  if (!href) return false;
  if (href.startsWith('//')) return true;
  if (href.startsWith('#') || href.startsWith('/')) return false;
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

/**
 * Anchor attributes for an href that may or may not be external, for spreading
 * into a template: `<a href={url} {...externalLinkAttrs(url)}>`. Returns nothing
 * for internal hrefs, so it is safe on anchors whose target varies with content.
 */
export function externalLinkAttrs(href: string | undefined | null) {
  return isExternalHref(href) ? { target: '_blank', rel: EXTERNAL_REL } : {};
}
