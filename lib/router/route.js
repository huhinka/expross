import { forEachHttpMethods } from './method.js'
import { Layer } from './layer.js'

export class Route {
  constructor (path) {
    this.path = path
    this.layers = []
    this.methods = {}
  }

  dispatch (req, res) {
    for (const layer of this.layers) {
      if (req.method.toLowerCase() === layer.method) {
        return layer.handleRequest(req, res)
      }
    }
  }

  _couldHandleMethod (method) {
    const name = method.toLowerCase()
    return Boolean(this.methods[name])
  }
}

forEachHttpMethods(method => {
  Route.prototype[method] = function (handler) {
    const layer = new Layer('/', handler)
    layer.method = method

    this.methods[method] = true
    this.layers.push(layer)

    return this
  }
})
