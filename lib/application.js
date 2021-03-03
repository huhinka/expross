import http from 'http'

import { Router } from './router'

export class Application {
  constructor () {
    this._router = new Router()
  }

  get (path, handler) {
    this._router.get(path, handler)
  }

  handle (req, res) {
    if (!res.send) {
      res.send = (body) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end(body)
      }
    }

    this._router.handle(req, res)
  }

  listen () {
    const server = http.createServer(this.handle)

    return server.listen.apply(server, arguments)
  }
}
