
export default class Layer {
  constructor (path, fn) {
    this.handle = fn
    this.name = fn.name || '<anonymous>'
    this.path = path
  }

  handleRequest (req, res) {
    const fn = this.handle
    if (fn) {
      fn(req, res)
    }
  }

  match (path) {
    return path === this.path || path === '*'
  }
}
