import http from 'http'

import { forEachHttpMethods } from './router/method.js'
import { Router } from './router'

export class Application {
  constructor () {
    this._router = new Router()
  }

  handle (req, res) {
    if (!res.send) {
      res.send = (body) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end(body)
      }
    }

    this._router.handle(req, res)
  }

  listen () {
    const server = http.createServer(this.handle)

    return server.listen.apply(server, arguments)
  }
}

forEachHttpMethods(method => {
  Application.prototype[method] = function () {
    this._router[method].apply(this._router, arguments)
  }
})
