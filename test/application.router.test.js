import request from 'supertest'

import { expross } from '..'

describe('router.use', () => {
  it('should handle router path correctly', async done => {
    const app = expross()
    const router = expross.Router()

    router.use('/1', async (req, res, next) => {
      res.send('user1')
    })

    app.use('/users', router)

    const res = await request(app).get('/users/1')

    expect(res.status).toBe(200)
    expect(res.text).toBe('user1')

    done()
  })
})
