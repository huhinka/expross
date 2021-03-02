import request from 'supertest'

import { expross } from '..'

describe('app', () => {
  it('should be callable', () => {
    const app = expross()
    expect(typeof app).toBe('function')
  })
})

describe('app.get', () => {
  it('should return 200 with "hello world"', async done => {
    const app = expross()
    app.get('/', async (req, res) => {
      res.send('hello world')
    })

    const res = await request(app).get('/')

    expect(res.status).toBe(200)
    expect(res.text).toBe('hello world')

    done()
  })
})
