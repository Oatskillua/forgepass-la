// URL fragments can contain sharing capabilities and Auth recovery credentials.
function withoutFragment(value) {
  return typeof value === 'string' ? value.split('#')[0] : value
}

export function sanitizeAnalyticsUrl(event) {
  return { ...event, url: withoutFragment(event.url) }
}

export function sanitizeBreadcrumb(breadcrumb) {
  if (!breadcrumb.data) return breadcrumb
  const data = { ...breadcrumb.data }
  for (const key of ['url', 'from', 'to']) {
    if (key in data) data[key] = withoutFragment(data[key])
  }
  return { ...breadcrumb, data }
}

export function sanitizeErrorUrls(event) {
  const result = { ...event }
  if (event.request) {
    result.request = { ...event.request, url: withoutFragment(event.request.url) }
  }
  if (event.breadcrumbs) result.breadcrumbs = event.breadcrumbs.map(sanitizeBreadcrumb)
  return result
}
