
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
    const path = req.url
    const method = req.method
    const layers = this.layers
    let idx = 0

    function next (err) {
      const layerError = err === 'route' ? null : err

      if (layerError === 'router') {
        return done(null)
      } else if (idx >= layers.length || layerError) {
        return done(layerError)
      } else {
        const layer = layers[idx++]
        if (layer.match(path)) {
          if (layer.route) {
            // layer should handle route for path
            if (layer.route._couldHandleMethod(method)) {
              layer.handleRequest(req, res, next)
            } else {
              next(layerError)
            }
          } else {
            // layer's handle object is a middleware
            layer.handleRequest(req, res, next)
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
