import {Logger} from 'tslog'

import {GCSLastRunStoreConfig, LastRunStoreConfig, LocalLastRunStoreConfig} from '../magicpod-config'
import {GcsStore} from './gcs-store'
import {LocalStore} from './local-store'
import {NullStore} from './null-store'

export interface LastRun {
  [repo: string]: {
    lastRun: number
    updatedAt: Date
  }
}

export interface Store {
  read(): Promise<LastRun>
  write(store: LastRun): Promise<LastRun>
}

export class LastRunStore {
  readonly store: Store
  private lastRun: LastRun

  static async init(logger: Logger, config: LastRunStoreConfig, debugMode = false, baseUrl?: string): Promise<LastRunStore> {
    let store
    if (debugMode) {
      store = new NullStore(logger)
    } else if (!config) {
      store = new LocalStore(logger)
    } else if (config.backend === 'local') {
      store = new LocalStore(logger, (config as LocalLastRunStoreConfig).path)
    } else if (config.backend === 'gcs') {
      const _config = config as GCSLastRunStoreConfig
      store = new GcsStore(logger, _config.project, _config.bucket, _config.path, baseUrl)
    } else {
      throw new Error(`Error: Unknown LastRunStore.backend type '${config.backend}'`)
    }

    const self = new LastRunStore(store)
    await self.readStore()
    return self
  }

  constructor(store: Store) {
    this.store = store
    this.lastRun = {}
  }

  private async readStore(): Promise<void> {
    this.lastRun = await this.store.read()
  }

  getLastRun(repo: string): number | undefined {
    return this.lastRun[repo]?.lastRun
  }

  setLastRun(repo: string, lastRun: number): void {
    const stored = this.getLastRun(repo) ?? 0
    if (stored >= lastRun) return

    const before = this.lastRun[repo]
    this.lastRun[repo] = {
      ...before,
      lastRun,
      updatedAt: new Date(),
    }
  }

  async save(): Promise<void> {
    this.lastRun = await this.store.write(this.lastRun)
  }
}
