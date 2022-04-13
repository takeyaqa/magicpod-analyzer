import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import {Logger} from 'tslog'
import {LastRun, Store} from './store'

export class LocalStore implements Store {
  private readonly logger: Logger
  private readonly filePath: string

  constructor(logger: Logger, filePath?: string) {
    this.logger = logger.getChildLogger({name: LocalStore.name})

    const _filePath = filePath ?? path.join('.magicpod_analyzer', 'last_run', 'magicpod.json')
    this.filePath = path.isAbsolute(_filePath) ? _filePath : path.resolve(process.cwd(), _filePath)
  }

  async read(): Promise<LastRun> {
    try {
      await fs.access(this.filePath)
      this.logger.info(`${this.filePath} was successfully loaded.`)
      return JSON.parse(await fs.readFile(this.filePath, {encoding: 'utf8'}))
    } catch {
      this.logger.info(`${this.filePath} was not found, empty object is used instead.`)
      return {}
    }
  }

  async write(newStore: LastRun): Promise<LastRun> {
    // Reload store file
    const reloadedStore = await this.read()
    const store = {...reloadedStore, ...newStore}

    // Write store file
    const outDir = path.dirname(this.filePath)
    await fs.mkdir(outDir, {recursive: true})
    await fs.writeFile(this.filePath, JSON.stringify(store, null, 2))

    this.logger.info(`${this.filePath} was successfully saved.`)

    return store
  }
}
