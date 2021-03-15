import { ServerResponse } from 'http'

export class Response extends ServerResponse {
  send (body) {
    this.writeHead(200, { 'Content-Type': 'text/plain' })
    this.end(body)
  }

  render (view, options, callback) {
    const self = this
    const app = self.req.app
    const opts = options || {}
    let done = callback

    done = done || function (err, str) {
      if (err) {
        // TODO why does req have next function?
        return self.req.next(err)
      }

      self.send(str)
    }

    app.render(view, opts, done)
  }
}
