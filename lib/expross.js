import { Application } from './application.js'
import { routerFunctionFactory } from './router/index.js'

export function expross () {
  const app = function (req, res, next) {
    app.handle(req, res, next)
  }

  Object.setPrototypeOf(app, new Application())

  return app
}

expross.Router = routerFunctionFactory
