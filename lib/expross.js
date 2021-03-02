import application from './application.js'

export default function createApplication () {
  const app = function (req, res, next) {
    app.handle(req, res, next)
  }

  Object.assign(app, application)

  return app
}
