import {Logger} from 'tslog'

import {LastRun, Store} from './store'

export class NullStore implements Store {
  private readonly logger: Logger

  constructor(logger: Logger) {
    this.logger = logger.getChildLogger({name: NullStore.name})
  }

  async read(): Promise<LastRun> {
    this.logger.info('Detect DEBUG mode, nothing is used instead.')
    return {}
  }

  async write(_store: LastRun): Promise<LastRun> {
    this.logger.info('Detect DEBUG mode, skip saving lastRun.')
    return {}
  }
}
