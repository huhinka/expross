import http from 'http'

import { forEachHttpMethods } from './router/method.js'
import { Router } from './router/index.js'
import { init } from './middleware/init.js'
import { MIDDLEWARE_PATH } from './constant.js'
import { View } from './view.js'

export class Application {
  constructor () {
    this._settings = {}
    this._engines = {}
  }

  use (fn) {
    let path = MIDDLEWARE_PATH

    if (typeof fn !== 'function') {
      path = fn
      fn = arguments[1]
    }

    this._lazyRouter().use(path, fn)

    return this
  }

  handle (req, res) {
    function finalHandler (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      if (err) {
        res.end(`${err}`)
      } else {
        res.end(`Cannot found [${req.method} ${req.url}] handler`)
      }
    }

    const router = this._lazyRouter()
    router.handle(req, res, finalHandler)
  }

  setSetting (setting, val) {
    this._settings[setting] = val
    return this
  }

  getSetting (setting) {
    return this._settings[setting]
  }

  engine (ext, fn) {
    const extension = ext[0] !== '.' ? '.' + ext : ext
    this._engines[extension] = fn

    return this
  }

  render (name, options, callback) {
    const view = new View(name, {
      defaultEngine: this.getSetting('view engine'),
      root: this.getSetting('views'),
      engines: this._engines
    })

    if (!view.path) {
      const err = new Error(`Failed to lookup view "${name}"`)
      return callback(err)
    }

    try {
      view.render(options, callback)
    } catch (error) {
      callback(error)
    }
  }

  listen () {
    const server = http.createServer((req, res) => {
      this.handle(req, res)
    })

    return server.listen.apply(server, arguments)
  }

  _lazyRouter () {
    if (!this._router) {
      this._router = new Router()
      this._router.use(init(this))
    }

    return this._router
  }
}

forEachHttpMethods(method => {
  Application.prototype[method] = function () {
    const router = this._lazyRouter()
    router[method].apply(this._router, arguments)
  }
})
