/**
 * Check if the current pathname is a will editor route
 * Matches: /dashboard/wills/[uuid] (not /dashboard/wills or /dashboard/wills/new)
 */
export function isWillEditorRoute(pathname: string): boolean {
  const willEditorPattern = /^\/dashboard\/wills\/[a-f0-9-]{36}$/i
  return willEditorPattern.test(pathname)
}
