
import request from 'supertest'
import fs from 'fs'

import { expross } from '..'

describe('app.render', () => {
  it('should render template', async done => {
    const app = expross()
    app.engine('ntl', (filePath, options, callback) => {
      fs.readFile(filePath, (err, content) => {
        if (err) {
          callback(new Error(err))
        } else {
          const rendered = content.toString()
            .replace('#title#', `<title>${options.title}</title>`)
            .replace('#message#', `<h1>${options.message}</h1>`)

          return callback(null, rendered)
        }
      })
    })

    app.setSetting('views', './test/views')
    app.setSetting('view engine', 'ntl')

    app.get('/', (req, res, next) => {
      res.render('index', {
        title: 'Hey',
        message: 'Hello there!'
      })
    })

    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toBe('<title>Hey</title><h1>Hello there!</h1>')

    done()
  })
})
