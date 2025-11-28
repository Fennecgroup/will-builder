/**
 * Check if the current pathname is a will editor route
 * Matches: /dashboard/wills/[cuid] (not /dashboard/wills or /dashboard/wills/new)
 * CUID format: starts with 'c', 25 characters, lowercase alphanumeric
 */
export function isWillEditorRoute(pathname: string): boolean {
  // Match CUID format: c followed by 24 alphanumeric characters
  const willEditorPattern = /^\/dashboard\/wills\/c[a-z0-9]{24}$/
  return willEditorPattern.test(pathname)
}
