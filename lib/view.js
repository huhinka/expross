import fs from 'fs'
import path from 'path'

export class View {
  constructor (name, options) {
    const opts = options || {}

    this.defaultEngine = opts.defaultEngine
    this.root = opts.root
    this.ext = path.extname(name)
    this.name = name

    let fileName = name
    if (!this.ext) {
      this.ext = this.defaultEngine[0] !== '.' ? '.' + this.defaultEngine : this.defaultEngine

      fileName += this.ext
    }

    this.engine = opts.engines[this.ext]
    this.path = this.lookup(fileName)
  }

  render (options, callback) {
    this.engine(this.path, options, callback)
  }

  lookup (name) {
    let p
    const roots = [].concat(this.root)

    for (let i = 0; i < roots.length && !p; i++) {
      const root = roots[i]

      const loc = path.resolve(root, name)
      const dir = path.dirname(loc)
      const file = path.basename(loc)

      p = this.resolve(dir, file)
    }

    return p
  }

  resolve (dir, file) {
    const ext = this.ext

    const p1 = this._resolve(dir, file)
    if (p1) {
      return p1
    }

    const p2 = this._resolve(dir, path.basename(file, ext), `index${ext}`)
    if (p2) {
      return p2
    }
  }

  _resolve (...paths) {
    const p = path.join(...paths)

    const stat = this._tryStat(p)
    if (stat && stat.isFile()) {
      return p
    }
  }

  _tryStat (path) {
    try {
      return fs.statSync(path)
    } catch (error) {
      return undefined
    }
  }
}
