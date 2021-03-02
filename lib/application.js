import http from 'http'

const router = [
  {
    path: '*',
    method: '*',
    handle: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('404')
    }
  }
]

export default {
  get: function (path, fn) {
    router.push({
      path: path,
      method: 'GET',
      handle: fn
    })
  },
  listen: function (port, cb) {
    const server = http.createServer((req, res) => {
      if (!res.send) {
        res.send = (body) => {
          res.writeHead(200, { 'Content-Type': 'text/plain' })
          res.end(body)
        }
      }

      for (let i = 1, len = router.length; i < len; i++) {
        if ((req.url === router[i].path || router[i].path === '*') &&
          (req.method === router[i].method || router[i].method === '*')) {
          return router[i].handle && router[i].handle(req, res)
        }
      }

      return router[0].handle && router[0].handle(req, res)
    })

    return server.listen.apply(server, arguments)
  }
}
