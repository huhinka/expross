import http from 'http'

import { forEachHttpMethods } from './router/method.js'
import { Router } from './router/index.js'
import { init } from './middleware/init.js'

export class Application {
  lazyRouter () {
    if (!this._router) {
      this._router = new Router()
      this._router.use(init)
    }

    return this._router
  }

  use (fn) {
    let path = '/'

    if (typeof fn !== 'function') {
      path = fn
      fn = arguments[1]
    }

    this.lazyRouter().use(path, fn)

    return this
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

    const router = this.lazyRouter()
    if (router) {
      router.handle(req, res, finalHandler)
    } else {
      finalHandler()
    }
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
    const router = this.lazyRouter()
    router[method].apply(this._router, arguments)
  }
})
