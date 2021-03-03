
import { forEachHttpMethods } from './method.js'
import { Layer } from './layer.js'
import { Route } from './route.js'

export class Router {
  constructor () {
    this.layers = []
  }

  handle (req, res, done) {
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
        if (layer.match(req.url) && layer.route && layer.route._couldHandleMethod(method)) {
          return layer.handleRequest(req, res, next)
        } else {
          next(layerError)
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
