/**
 * Route metadata resolution for the authenticated App Shell's Top_Navbar.
 *
 * Centralizes route -> { labelKey, parent } lookup so back-button /
 * brand-mark / title resolution (Req 4.2-4.4) is driven by one pure,
 * unit-testable function instead of being duplicated inline per-render.
 *
 * Static routes are matched first (exact pathname match), then dynamic
 * routes (`/projects/:id`) via pattern matching. The function is total:
 * any string input, including unknown/malformed paths, returns a valid
 * RouteMeta rather than throwing or returning undefined.
 */

export interface RouteMeta {
  labelKey: string;
  parent: string | null;
}

interface StaticRouteEntry {
  path: string;
  labelKey: string;
  parent: string | null;
}

/**
 * Static route table. Order does not matter for correctness (lookup is by
 * exact match), but routes are listed in the parent-chain order defined by
 * the design document for readability.
 */
const STATIC_ROUTES: StaticRouteEntry[] = [
  { path: '/dashboard', labelKey: 'dashboard.title', parent: null },
  { path: '/projects', labelKey: 'projects.title', parent: null },
  { path: '/team', labelKey: 'team.title', parent: null },
  { path: '/agent', labelKey: 'agent.title', parent: null },
  { path: '/admin', labelKey: 'admin.title', parent: null },
  { path: '/projects/new', labelKey: 'projects.new.title', parent: '/projects' },
  {
    path: '/projects/new/analysis',
    labelKey: 'projects.new.analysis.title',
    parent: '/projects/new',
  },
  {
    path: '/projects/new/team',
    labelKey: 'projects.new.team.title',
    parent: '/projects/new/analysis',
  },
];

/** Matches `/projects/:id` — a single path segment after `/projects/` that isn't `new`. */
const PROJECT_DETAIL_PATTERN = /^\/projects\/([^/]+)$/;

/**
 * Normalizes a pathname for matching: strips any query string/hash a caller
 * may have passed in error, ensures a leading slash, and strips a trailing
 * slash (except for the root path) so `/projects/` and `/projects` resolve
 * identically.
 */
function normalizePathname(pathname: string): string {
  if (!pathname) {
    return '/';
  }

  const withoutQueryOrHash = pathname.split(/[?#]/)[0] ?? pathname;
  const withLeadingSlash = withoutQueryOrHash.startsWith('/')
    ? withoutQueryOrHash
    : `/${withoutQueryOrHash}`;

  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash;
}

/**
 * Fallback for any pathname that matches neither the static table nor a
 * known dynamic pattern. Derives a best-effort label key from the last path
 * segment and treats the route as top-level (no parent), so the function
 * remains total.
 */
function fallbackRouteMeta(normalizedPathname: string): RouteMeta {
  const segments = normalizedPathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const labelKey = lastSegment ? `${lastSegment}.title` : 'app.title';
  return { labelKey, parent: null };
}

/**
 * Resolves the label key and parent route for a given pathname.
 *
 * - Static routes (`/dashboard`, `/projects`, `/team`, `/agent`, `/admin`,
 *   and the wizard step routes) are matched first, by exact string match.
 * - `/projects/:id` (any single segment after `/projects/` other than
 *   `new`) resolves with parent `/projects`.
 * - Any other pathname (including malformed/unknown paths) falls back to a
 *   sensible label derived from the last path segment, with no parent.
 */
export function resolveRouteMeta(pathname: string): RouteMeta {
  const normalized = normalizePathname(pathname);

  const staticMatch = STATIC_ROUTES.find((route) => route.path === normalized);
  if (staticMatch) {
    return { labelKey: staticMatch.labelKey, parent: staticMatch.parent };
  }

  const projectDetailMatch = PROJECT_DETAIL_PATTERN.exec(normalized);
  if (projectDetailMatch && projectDetailMatch[1] !== 'new') {
    return { labelKey: 'projectDetail.title', parent: '/projects' };
  }

  return fallbackRouteMeta(normalized);
}
