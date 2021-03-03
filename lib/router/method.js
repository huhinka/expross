import http from 'http'

export function forEachHttpMethods (handler) {
  http.METHODS.forEach(m => {
    const method = m.toLowerCase()
    handler(method)
  })
}
