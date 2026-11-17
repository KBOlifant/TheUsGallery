// Unknown /api/* paths answer with JSON (like the old Express API) instead of the HTML 404 page.
function notFound(request) {
  return Response.json({ message: `Not found: ${request.method} ${new URL(request.url).pathname}` }, { status: 404 })
}

export { notFound as GET, notFound as POST, notFound as PUT, notFound as PATCH, notFound as DELETE }
