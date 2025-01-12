import {Logger, NullLogger} from '../util'
import {LastRun, Store} from './store'

export class NullStore implements Store {
  private readonly logger: Logger

  constructor(logger: Logger = new NullLogger()) {
    this.logger = logger
  }

  async read(): Promise<LastRun> {
    this.logger.log('Detect DEBUG mode, nothing is used instead.')
    return {}
  }

  async write(_store: LastRun): Promise<LastRun> {
    this.logger.log('Detect DEBUG mode, skip saving lastRun.')
    return {}
  }
}
