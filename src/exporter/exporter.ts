import {Logger} from 'tslog'
import {BigqueryExporter} from './bigquery-exporter'
import {LocalExporter} from './local-exporter'
import {TestReport} from '../magicpod-analyzer'
import {ExporterConfig} from '../magicpod-config'

export interface Exporter {
  exportTestReports(reports: TestReport[]): Promise<void>
}

export class CompositExporter implements Exporter {
  private readonly exporters: Exporter[]

  // eslint-disable-next-line default-param-last
  constructor(logger: Logger, config?: ExporterConfig, debugMode = false, baseUrl?: string) {
    if (debugMode || !config) {
      this.exporters = [new LocalExporter(logger)]
      return
    }

    this.exporters = []
    if (config.local) {
      this.exporters.push(new LocalExporter(logger, config.local))
    }

    if (config.bigquery) {
      this.exporters.push(new BigqueryExporter(logger, config.bigquery, baseUrl))
    }
  }

  async exportTestReports(reports: TestReport[]): Promise<void> {
    await Promise.all(this.exporters.map(exporter => exporter.exportTestReports(reports)))
  }
}
