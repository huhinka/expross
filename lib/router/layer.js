import { FAST_START, MIDDLEWARE_PATH } from '../constant.js'

export class Layer {
  constructor (path, fn) {
    this.handle = fn
    this.name = fn.name || '<anonymous>'

    this.fastStar = path === FAST_START
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
      if (this.path === MIDDLEWARE_PATH) {
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
