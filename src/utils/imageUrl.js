/**
 * Converts a relative upload path to an absolute URL using the API server base URL.
 * In production, images are served from the API server domain (e.g., wpcserver.govindvyas.com),
 * not the admin domain. This utility ensures all /uploads/... paths resolve correctly.
 *
 * @param {string} url - The image URL (may be relative like /uploads/... or already absolute)
 * @returns {string} The resolved absolute URL
 */
export function getApiUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_URL}${url}`
  }
  return url
}
