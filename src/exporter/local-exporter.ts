import * as dayjs from 'dayjs'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import {Logger} from 'tslog'

import {TestReport} from '../magicpod-analyzer'
import {LocalExporterConfig} from '../magicpod-config'
import {Exporter} from './exporter'

export class LocalExporter implements Exporter {
  fs = fs
  readonly outDir: string
  readonly format: 'json' | 'json_lines'
  private readonly logger: Logger

  constructor(logger: Logger, config?: LocalExporterConfig) {
    const _outDir = config?.outDir ?? 'output'
    this.outDir = path.isAbsolute(_outDir) ? _outDir : path.resolve(process.cwd(), _outDir)
    this.format = config?.format ?? 'json'
    this.logger = logger.getChildLogger({name: LocalExporter.name})
  }

  async exportTestReports(testReports: TestReport[]): Promise<void> {
    await this.fs.mkdir(this.outDir, {recursive: true})
    const outputPath = path.join(this.outDir, `${dayjs().format('YYYYMMDD-HHmm')}-test-magicpod.json`)
    const formated = this.formatJson(testReports)
    await this.fs.writeFile(outputPath, formated, {encoding: 'utf8'})
    this.logger.info(`Export test reports to ${outputPath}`)
  }

  private formatJson(testReports: TestReport[]): string {
    switch (this.format) {
      case 'json': {
        return JSON.stringify(testReports, null, 2)
      }

      case 'json_lines': {
        return testReports.map((report) => JSON.stringify(report)).join('\n')
      }
    }
  }
}
