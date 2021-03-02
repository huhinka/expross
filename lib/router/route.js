import Layer from './layer.js'

export default class Router {
  constructor () {
    this.stack = [
      new Layer('*', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('404')
      })
    ]
  }

  get (path, fn) {
    this.stack.push(new Layer(path, fn))
  }

  handle (req, res) {
    const router = this.stack
    for (let i = 1, len = router.length; i < len; i++) {
      if (router[i].match(req.url)) {
        return router[i].handleRequest(req, res)
      }
    }

    return router[0].handleRequest(req, res)
  }
}
