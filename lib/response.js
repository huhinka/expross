import { ServerResponse } from 'http'

export class Response extends ServerResponse {
  send (body) {
    this.writeHead(200, { 'Content-Type': 'text/plain' })
    this.end(body)
  }
}
