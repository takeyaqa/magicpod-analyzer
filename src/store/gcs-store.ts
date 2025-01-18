import {File, Storage} from '@google-cloud/storage'
import path from 'node:path'

import {Logger, NullLogger} from '../util.js'
import {LastRun, Store} from './store.js'

export class GcsStore implements Store {
  file: File
  readonly gcsPath: string
  private readonly logger: Logger

  constructor(projectId?: string, bucket?: string, filePath?: string, logger: Logger = new NullLogger()) {
    const fp = filePath ?? path.join('ci_analyzer', 'last_run', 'magicpod.json')

    if (!projectId || !bucket) {
      throw new Error("Must need 'project' and 'bucket' params for lastRunStore in config")
    }

    this.logger = logger
    const storage = new Storage({projectId, apiEndpoint: process.env.GCS_EMULATOR_HOST})
    this.file = storage.bucket(bucket).file(fp)
    this.gcsPath = `gs://${bucket}/${fp}`
  }

  async read(): Promise<LastRun> {
    const res = await this.file.exists()
    if (res[0]) {
      const data = await this.file.download()
      this.logger.log(`${this.gcsPath} was successfully loaded.`)
      return JSON.parse(data.toString())
    }

    this.logger.log(`${this.gcsPath} was not found, empty object is used instead.`)
    return {}
  }

  async write(newStore: LastRun): Promise<LastRun> {
    // Reload store file
    const reloadedStore = await this.read()
    const store = {...reloadedStore, ...newStore}

    // Write store file
    await this.file.save(JSON.stringify(store, null, 2))
    this.logger.log(`${this.gcsPath} was successfully saved.`)

    return store
  }
}
