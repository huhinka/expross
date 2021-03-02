import Layer from './layer.js'
import Route from './route.js'

export default class Router {
  constructor () {
    this.layers = [
      new Layer('*', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('404')
      })
    ]
  }

  get (path, fn) {
    const route = this._createRoute(path)
    route.get(fn)

    return this
  }

  handle (req, res) {
    const layers = this.layers

    for (let i = 1, len = layers.length; i < len; i++) {
      const layer = layers[i]

      if (layer.match(req.url) &&
      layer.route &&
      layer.route._couldHandleMethod(req.method)) {
        return layer.handleRequest(req, res)
      }
    }

    return layers[0].handleRequest(req, res)
  }

  /**
   * Create Route for path.
   * @param {string} path url path
   */
  _createRoute (path) {
    const route = new Route(path)
    const layer = new Layer(path, (req, res) => {
      route.dispatch(req, res)
    })

    layer.route = route
    this.layers.push(layer)

    return route
  }
}
