
export class Layer {
  constructor (path, fn) {
    this.handle = fn
    this.name = fn.name || '<anonymous>'

    this.fastStar = path === '*'
    this.path = this.fastStar ? undefined : path
  }

  handleRequest (req, res, next) {
    const fn = this.handle
    try {
      fn(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  handleError (error, req, res, next) {
    if (this.handle.length !== 4) {
      // this layer is not error handler
      return next(error)
    } else {
      try {
        this.handle(error, req, res, next)
      } catch (err) {
        next(err)
      }
    }
  }

  match (path) {
    if (this.fastStar) {
      return true
    }

    if (this.route && this.path === path.slice(-this.path.length)) {
      // route
      return true
    }

    if (!this.route) {
      // TODO use constant variable instead of hard code
      if (this.path === '/') {
        // middleware without path
        return true
      }

      if (this.path === path.slice(0, this.path.length)) {
        // middleware with path
        return true
      }
    }

    return false
  }
}
