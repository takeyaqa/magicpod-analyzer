import fs from 'node:fs/promises'
import path from 'node:path'

import {TestReport} from '../magicpod-analyzer.js'
import {LocalExporterConfig} from '../magicpod-config.js'
import {Logger, NullLogger} from '../util.js'
import {Exporter} from './exporter.js'

export class LocalExporter implements Exporter {
  fs = fs
  readonly outDir: string
  readonly format: 'json' | 'json_lines'
  private readonly logger: Logger

  constructor(config?: LocalExporterConfig, logger: Logger = new NullLogger()) {
    const _outDir = config?.outDir ?? 'output'
    this.outDir = path.isAbsolute(_outDir) ? _outDir : path.resolve(process.cwd(), _outDir)
    this.format = config?.format ?? 'json'
    this.logger = logger
  }

  async exportTestReports(testReports: TestReport[]): Promise<void> {
    await this.fs.mkdir(this.outDir, {recursive: true})
    const outputPath = path.join(this.outDir, this.generateOutputFileName())
    const formated = this.formatJson(testReports)
    await this.fs.writeFile(outputPath, formated, {encoding: 'utf8'})
    this.logger.log(`Export test reports to ${outputPath}`)
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

  private generateOutputFileName(): string {
    const now = new Date()
    const fullYear = now.getFullYear().toString().padStart(4, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const date = now.getDate().toString().padStart(2, '0')
    const hour = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${fullYear}${month}${date}-${hour}${minutes}-test-magicpod.json`
  }
}
