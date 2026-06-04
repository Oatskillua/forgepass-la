export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed',
    })
  }

  return response.status(501).json({
    error: 'Waitlist server verification not implemented yet.',
  })
}