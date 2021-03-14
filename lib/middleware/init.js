import { Request } from '../request.js'
import { Response } from '../response.js'

export function init (req, res, next) {
  req.res = res
  res.req = req

  Object.setPrototypeOf(req, new Request())
  Object.setPrototypeOf(res, new Response(req))

  next()
}
