
export class Layer {
  constructor (path, fn) {
    this.handle = fn
    this.name = fn.name || '<anonymous>'
    this.path = path
  }

  handleRequest (req, res, next) {
    const fn = this.handle
    try {
      fn(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  match (path) {
    return path === this.path || path === '*'
  }
}
