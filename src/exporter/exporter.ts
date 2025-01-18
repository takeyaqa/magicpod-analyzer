import {TestReport} from '../magicpod-analyzer.js'
import {ExporterConfig} from '../magicpod-config.js'
import {Logger, NullLogger} from '../util.js'
import {BigqueryExporter} from './bigquery-exporter.js'
import {LocalExporter} from './local-exporter.js'

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
