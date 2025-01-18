/* eslint-disable no-await-in-loop */
import {Command, Flags} from '@oclif/core'

import {CompositExporter} from '../exporter/exporter.js'
import {MagicPodAnalyzer, TestReport} from '../magicpod-analyzer.js'
import {MagicPodClient} from '../magicpod-client.js'
import {loadConfig} from '../magicpod-config.js'
import {LastRunStore} from '../store/store.js'
import {maxBy} from '../util.js'

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
    const configFile = flags.config ?? 'magicpod_analyzer.yaml'

    const config = await loadConfig(configFile)
    const client = new MagicPodClient(flags.token, flags.debug, this)
    const analyzer = new MagicPodAnalyzer()
    if (flags.debug) {
      this.log('--- Enable DEBUG mode ---')
    }

    const store = await LastRunStore.init(config.lastRunStore, flags.debug, this)
    const allReports: TestReport[][] = []
    let result: Result = {status: 'success'}
    for (const project of config.projects) {
      this.log(`Fetching magicpod - ${project.fullName} ...`)

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
        this.warn(errorMessage)
        result = {status: 'failure', error: new Error(errorMessage)}
        continue
      }
    }

    // export
    this.log('Exporting magicpod workflow reports ...')
    const exporter = new CompositExporter(config.exporter, flags.debug, this)
    await exporter.exportTestReports(allReports.flat())

    await store.save()
    this.log(`Done execute 'magicpod'. status: ${result.status}`)

    if (result.error) {
      this.error(result.error, {exit: 1})
    } else {
      this.exit()
    }
  }
}
