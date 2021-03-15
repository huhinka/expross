import { Request } from '../request.js'
import { Response } from '../response.js'

export function init (app) {
  return (req, res, next) => {
    req.res = res
    res.req = req

    req.app = app

    Object.setPrototypeOf(req, new Request())
    Object.setPrototypeOf(res, new Response(req))

    next()
  }
}
