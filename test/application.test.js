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

  it('should 404 without routes', async done => {
    const res = await request(expross()).get('/')

    expect(res.status).toBe(404)
    expect(res.text).toBe('Cannot found [GET /] handler')
    done()
  })

  it('should 404 with error', async done => {
    const app = expross()
    app.get('/', async (req, res, next) => {
      next()
    })
    app.get('/', async (req, res, next) => {
      next(new Error('error'))
    })
    app.get('/', async (req, res) => {
      res.send('third')
    })

    const res = await request(app).get('/')

    expect(res.status).toBe(404)
    expect(res.text).toBe('Error: error')

    done()
  })

  it('should use final handler', async done => {
    const app = expross()
    app.get('/', async (req, res, next) => {
      next(new Error('error'))
    })
    app.use((error, req, res, next) => {
      res.send(`Oops ${error.message}`)
    })

    const res = await request(app).get('/')

    expect(res.status).toBe(200)
    expect(res.text).toBe('Oops error')

    done()
  })
})

describe('app.use', () => {
  it('could add middleware', async done => {
    const app = expross()
    app.use(async (req, res, next) => {
      res.setHeader('x-router', 'x-router')
      next()
    })

    const res = await request(app).get('/')

    expect(res.header['x-router']).toBe('x-router')

    done()
  })

  it('could use router as middleware', async done => {
    const app = expross()
    const router = expross.Router()

    router.use(async (req, res, next) => {
      res.setHeader('x-router', 'x-router')
      next()
    })
    app.use('/', router)

    const res = await request(app).get('/')

    expect(res.header['x-router']).toBe('x-router')

    done()
  })
})
