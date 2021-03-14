import http from 'http'

import { forEachHttpMethods } from './router/method.js'
import { Router } from './router/index.js'
import { Request } from './request.js'
import { Response } from './response.js'

export class Application {
  constructor () {
    this._router = new Router()
  }

  use (fn) {
    let path = '/'

    if (typeof fn !== 'function') {
      path = fn
      fn = arguments[1]
    }

    this._router.use(path, fn)

    return this
  }

  handle (req, res) {
    // TODO use middleware to mixin req, res
    Object.setPrototypeOf(req, new Request())
    Object.setPrototypeOf(res, new Response(req))

    function finalHandler (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      if (err) {
        res.end('404: ' + err)
      } else {
        res.end(`Cannot ${req.method} ${req.url}`)
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
