import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as dayjs from 'dayjs'
import {TestReport} from './magicpod-analyzer'

export class LocalExporter {
  async exportTestReports(testReports: TestReport[]): Promise<string> {
    const outputDir = path.resolve('.', 'output')
    await fs.mkdir(outputDir, {recursive: true})
    const outputPath = path.join(outputDir, `${dayjs().format('YYYYMMDD-HHmm')}-test-magicpod.json`)
    const formated = JSON.stringify(testReports, null, 2)
    await fs.writeFile(outputPath, formated, {encoding: 'utf8'})
    return outputPath
  }
}
