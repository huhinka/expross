import { Layer } from './layer.js'

export class Route {
  constructor (path) {
    this.path = path
    this.layers = []
    this.methods = {}
  }

  get (fn) {
    const layer = new Layer('/', fn)
    layer.method = 'get'

    this.methods.get = true
    this.layers.push(layer)

    return this
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
