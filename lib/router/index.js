import url from 'url'
import { forEachHttpMethods } from './method.js'
import { Layer } from './layer.js'
import { Route } from './route.js'

export function routerFunctionFactory () {
  function router (req, res, next) {
    router.handle(req, res, next)
  }

  Object.setPrototypeOf(router, new Router())

  return router
}

export class Router {
  constructor () {
    this.layers = []
  }

  use (fn) {
    let path = '/'

    if (typeof fn !== 'function') {
      path = fn
      fn = arguments[1]
    }

    const layer = new Layer(path, fn)
    layer.route = undefined

    this.layers.push(layer)

    return this
  }

  handle (req, res, done) {
    const method = req.method
    const layers = this.layers
    let idx = 0

    let removed = ''
    let slashAdded = false

    const parentUrl = req.baseUrl || ''
    req.baseUrl = parentUrl
    req.originalUrl = req.originalUrl || req.url

    function next (err) {
      const layerError = err === 'route' ? null : err

      if (slashAdded) {
        req.url = ''
        slashAdded = false
      }

      if (removed.length !== 0) {
        req.baseUrl = parentUrl
        req.url = removed + req.url
        removed = ''
      }

      if (layerError === 'router') {
        return done(null)
      } else if (idx >= layers.length) {
        return done(layerError)
      } else {
        const path = url.parse(req.url).pathname
        const layer = layers[idx++]
        if (layer.match(path)) {
          if (!layerError && layer.route) {
            // layer should handle route for path
            if (layer.route._couldHandleMethod(method)) {
              layer.handleRequest(req, res, next)
            } else {
              next(layerError)
            }
          } else {
            // layer's handle object is a middleware
            removed = layer.path

            req.url = req.url.substr(removed.length)
            if (req.url === '') {
              req.url = '/' + req.url
              slashAdded = true
            }

            req.baseUrl = parentUrl + removed

            if (layerError) {
              layer.handleError(layerError, req, res, next)
            } else {
              layer.handleRequest(req, res, next)
            }
          }
        } else {
          layer.handleError(layerError, req, res, next)
        }
      }
    }

    next()
  }

  /**
   * Create Route for path.
   * @param {string} path url path
   */
  _createRoute (path) {
    const route = new Route(path)
    // this layer handler is route's dispatch function
    const layer = new Layer(path, route.dispatch.bind(route))

    layer.route = route
    this.layers.push(layer)

    return route
  }
}

forEachHttpMethods(method => {
  Router.prototype[method] = function (path, handler) {
    const route = this._createRoute(path)
    route[method](handler)

    return this
  }
})
