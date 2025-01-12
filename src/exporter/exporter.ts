import {TestReport} from '../magicpod-analyzer'
import {ExporterConfig} from '../magicpod-config'
import {Logger, NullLogger} from '../util'
import {BigqueryExporter} from './bigquery-exporter'
import {LocalExporter} from './local-exporter'

export interface Exporter {
  exportTestReports(reports: TestReport[]): Promise<void>
}

export class CompositExporter implements Exporter {
  readonly exporters: Exporter[]

  constructor(config?: ExporterConfig, debugMode = false, logger: Logger = new NullLogger()) {
    if (debugMode || !config) {
      this.exporters = [new LocalExporter(undefined, logger)]
      return
    }

    this.exporters = []
    if (config.local) {
      this.exporters.push(new LocalExporter(config.local, logger))
    }

    if (config.bigquery) {
      this.exporters.push(new BigqueryExporter(config.bigquery, logger))
    }
  }

  async exportTestReports(reports: TestReport[]): Promise<void> {
    await Promise.all(this.exporters.map((exporter) => exporter.exportTestReports(reports)))
  }
}
