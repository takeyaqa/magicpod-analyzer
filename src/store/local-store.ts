import fs from 'node:fs/promises'
import path from 'node:path'

import {Logger, NullLogger} from '../util.js'
import {LastRun, Store} from './store.js'

export class LocalStore implements Store {
  fs = fs
  readonly filePath: string
  private readonly logger: Logger

  constructor(filePath?: string, logger: Logger = new NullLogger()) {
    this.logger = logger

    const _filePath = filePath ?? path.join('.magicpod_analyzer', 'last_run', 'magicpod.json')
    this.filePath = path.isAbsolute(_filePath) ? _filePath : path.resolve(process.cwd(), _filePath)
  }

  async read(): Promise<LastRun> {
    try {
      await this.fs.access(this.filePath)
      this.logger.log(`${this.filePath} was successfully loaded.`)
      return JSON.parse(await this.fs.readFile(this.filePath, {encoding: 'utf8'}))
    } catch {
      this.logger.log(`${this.filePath} was not found, empty object is used instead.`)
      return {}
    }
  }

  async write(newStore: LastRun): Promise<LastRun> {
    // Reload store file
    const reloadedStore = await this.read()
    const store = {...reloadedStore, ...newStore}

    // Write store file
    const outDir = path.dirname(this.filePath)
    await this.fs.mkdir(outDir, {recursive: true})
    await this.fs.writeFile(this.filePath, JSON.stringify(store, null, 2))

    this.logger.log(`${this.filePath} was successfully saved.`)

    return store
  }
}
