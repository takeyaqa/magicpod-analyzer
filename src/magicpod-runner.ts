/* eslint-disable no-await-in-loop */
import {maxBy} from 'lodash'
import {Logger} from 'tslog'
import {MagicPodConfig} from './magicpod-config'
import {MagicPodClient} from './magicpod-client'
import {MagicPodAnalyzer, TestReport} from './magicpod-analyzer'
import {LastRunStore} from './store/store'
import {CompositExporter} from './exporter/exporter'

interface Result {
  status: string
  error?: Error
}

export class MagicPodRunner {
  private readonly logger: Logger
  private readonly config: MagicPodConfig
  private readonly client: MagicPodClient
  private readonly analyzer: MagicPodAnalyzer
  private store?: LastRunStore

  constructor(logger: Logger, config: MagicPodConfig, token = '') {
    this.logger = logger.getChildLogger({name: MagicPodRunner.name})
    this.config = config
    this.client = new MagicPodClient(token, logger)
    this.analyzer = new MagicPodAnalyzer()
  }

  async run(): Promise<Result> {
    this.store = await LastRunStore.init(this.logger, this.config.lastRunStore)
    const allReports: TestReport[][] = []
    let result: Result = {status: 'success'}
    for (const project of this.config.projects) {
      this.logger.info(`Fetching magicpod - ${project.fullName} ...`)

      try {
        // retrieve
        const lastRunId = this.store.getLastRun(project.fullName)
        const data = await this.client.getBatchRuns(project.organization, project.name, lastRunId)

        // convert
        const reports = await this.analyzer.createTestReports(data)

        // store
        if (reports.length > 0) {
          const lastRunReport = maxBy(reports, 'buildNumber')
          if (lastRunReport) {
            this.store.setLastRun(project.fullName, lastRunReport.buildNumber)
          }
        }

        allReports.push(reports)
      } catch {
        const errorMessage = `Some error raised in '${project.fullName}', so it skipped.`
        this.logger.error(errorMessage)
        result = {status: 'failure', error: new Error(errorMessage)}
        continue
      }
    }

    // export
    this.logger.info('Exporting magicpod workflow reports ...')
    const exporter = new CompositExporter(this.logger, this.config.exporter)
    await exporter.exportTestReports(allReports.flat())

    await this.store.save()
    this.logger.info(`Done execute 'magicpod'. status: ${result.status}`)
    return result
  }
}
