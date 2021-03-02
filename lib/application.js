import http from 'http'

class Router {
  constructor () {
    this.stack = [
      {
        path: '*',
        method: '*',
        handle: (req, res) => {
          res.writeHead(200, { 'Content-Type': 'text/plain' })
          res.end('404')
        }
      }

    ]
  }

  get (path, fn) {
    this.stack.push({
      path: path,
      method: 'GET',
      handle: fn
    })
  }

  handle (req, res) {
    const router = this.stack
    for (let i = 1, len = router.length; i < len; i++) {
      if ((req.url === router[i].path || router[i].path === '*') &&
          (req.method === router[i].method || router[i].method === '*')) {
        return router[i].handle && router[i].handle(req, res)
      }
    }

    return router[0].handle && router[0].handle(req, res)
  }
}

export default {
  _router: new Router(),
  get: function (path, fn) {
    this._router.get(path, fn)
  },
  listen: function (port, cb) {
    const server = http.createServer((req, res) => {
      if (!res.send) {
        res.send = (body) => {
          res.writeHead(200, { 'Content-Type': 'text/plain' })
          res.end(body)
        }
      }

      return this._router.handle(req, res)
    })

    return server.listen.apply(server, arguments)
  }
}
