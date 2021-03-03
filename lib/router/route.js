import { forEachHttpMethods } from './method.js'
import { Layer } from './layer.js'

export class Route {
  constructor (path) {
    this.path = path
    this.layers = []
    this.methods = {}
  }

  dispatch (req, res, done) {
    const method = req.method.toLowerCase()
    const layers = this.layers
    let idx = 0

    function next (err) {
      if (err && err === 'route') {
        return done()
      } else if (err && err === 'router') {
        return done(err)
      } else if (idx >= layers.length) {
        return done(err)
      } else {
        const layer = layers[idx++]
        if (method !== layer.method) {
          return next(err)
        } else if (err) {
          return done(err)
        } else {
          layer.handleRequest(req, res, next)
        }
      }
    }

    next()
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
