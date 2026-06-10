export function validateAdminAccess(request) {
  const expectedCode = process.env.VITE_ADMIN_ACCESS_CODE

  if (!expectedCode) {
    return false
  }

  const providedCode =
    request.headers['x-admin-access-code']

  return providedCode === expectedCode
}