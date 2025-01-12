/* eslint-disable no-await-in-loop */
import {Command, Flags} from '@oclif/core'
import {Logger} from 'tslog'

import {CompositExporter} from '../exporter/exporter'
import {MagicPodAnalyzer, TestReport} from '../magicpod-analyzer'
import {MagicPodClient} from '../magicpod-client'
import {loadConfig} from '../magicpod-config'
import {LastRunStore} from '../store/store'
import {maxBy} from '../util'

interface Result {
  status: 'success' | 'failure'
  error?: Error
}

export default class GetBatchRuns extends Command {
  static description = "Retrieve specified project's batch run data from MagicPod."

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    config: Flags.string({description: 'Config file default: magicpod_analyzer.yaml', char: 'c'}),
    token: Flags.string({
      description:
        'Access token for MagicPod API. You can also set this value via environment variable `MAGICPOD_TOKEN`',
      env: 'MAGICPOD_TOKEN',
      char: 't',
      required: true,
    }),
    debug: Flags.boolean({
      description: 'Enable debug mode. You can also set this value via environment variable `MAGICPOD_ANALYZER_DEBUG`',
      env: 'MAGICPOD_ANALYZER_DEBUG',
      char: 'd',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(GetBatchRuns)

    const logger = new Logger({
      overwriteConsole: true,
      minLevel: flags.debug ? 'debug' : 'info',
      displayInstanceName: true,
      displayDateTime: false,
      displayFunctionName: false,
      displayFilePath: 'hidden',
    })
    const configFile = flags.config ?? 'magicpod_analyzer.yaml'

    const config = await loadConfig(configFile)
    const client = new MagicPodClient(flags.token, logger, flags.debug)
    const analyzer = new MagicPodAnalyzer()
    if (flags.debug) {
      logger.info('--- Enable DEBUG mode ---')
    }

    const store = await LastRunStore.init(logger, config.lastRunStore, flags.debug)
    const allReports: TestReport[][] = []
    let result: Result = {status: 'success'}
    for (const project of config.projects) {
      logger.info(`Fetching magicpod - ${project.fullName} ...`)

      try {
        // retrieve
        const lastRunId = store.getLastRun(project.fullName)
        const data = await client.getBatchRuns(project.organization, project.name, lastRunId)

        // convert
        const reports = await analyzer.createTestReports(data)

        // store
        if (reports.length > 0) {
          const lastRunReport = maxBy(reports, (report) => report.buildNumber)
          if (lastRunReport) {
            store.setLastRun(project.fullName, lastRunReport.buildNumber)
          }
        }

        allReports.push(reports)
      } catch {
        const errorMessage = `Some error raised in '${project.fullName}', so it skipped.`
        logger.error(errorMessage)
        result = {status: 'failure', error: new Error(errorMessage)}
        continue
      }
    }

    // export
    logger.info('Exporting magicpod workflow reports ...')
    const exporter = new CompositExporter(logger, config.exporter, flags.debug)
    await exporter.exportTestReports(allReports.flat())

    await store.save()
    logger.info(`Done execute 'magicpod'. status: ${result.status}`)

    if (result.error) {
      this.error(result.error, {exit: 1})
    } else {
      this.exit()
    }
  }
}
