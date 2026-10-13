import editions from '../data/editions.json';

export const editionNames = ['stable', 'devel', 'frozen'];

// The edition that serves a pathname: the one whose route prefix matches, or
// Stable at the site root.
export function editionForPath(pathname) {
  return editionNames.find((name) => {
    const prefix = editions[name].route_prefix;
    return prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`));
  }) ?? 'stable';
}

// The pathname with its edition prefix removed ('/' for an edition root).
export function logicalPath(pathname) {
  const prefix = editions[editionForPath(pathname)].route_prefix;
  const path = prefix ? pathname.slice(prefix.length) : pathname;
  return path || '/';
}
