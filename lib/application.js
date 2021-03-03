import http from 'http'

import { forEachHttpMethods } from './router/method.js'
import { Router } from './router/index.js'

export class Application {
  constructor () {
    this._router = new Router()
  }

  handle (req, res) {
    function finalHandler (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      if (err) {
        res.end('404: ' + err)
      } else {
        res.end(`Cannot ${req.method} ${req.url}`)
      }
    }

    if (!res.send) {
      res.send = (body) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end(body)
      }
    }

    this._router.handle(req, res, finalHandler)
  }

  listen () {
    const server = http.createServer((req, res) => {
      this.handle(req, res)
    })

    return server.listen.apply(server, arguments)
  }
}

forEachHttpMethods(method => {
  Application.prototype[method] = function () {
    this._router[method].apply(this._router, arguments)
  }
})
