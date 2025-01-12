import {BigQuery} from '@google-cloud/bigquery'
import * as crypto from 'node:crypto'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import {Logger} from 'tslog'

import {TestReport} from '../magicpod-analyzer'
import {BigqueryExporterConfig} from '../magicpod-config'
import {Exporter} from './exporter'

// eslint-disable-next-line unicorn/prefer-module
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'bigquery_schema', 'test_report.json')

export class BigqueryExporter implements Exporter {
  bigquery: BigQuery
  readonly dataset: string
  readonly table: string
  readonly maxBadRecords: number
  private readonly logger: Logger

  constructor(logger: Logger, config: BigqueryExporterConfig, baseUrl?: string) {
    if (!config.project || !config.dataset) {
      throw new Error("Must need 'project', 'dataset' parameter in exporter.bigquery config.")
    }

    this.logger = logger.getChildLogger({name: BigqueryExporter.name})
    this.bigquery = new BigQuery({projectId: config.project, apiEndpoint: baseUrl})
    this.dataset = config.dataset
    const testReportTable = config.reports?.find((report) => report.name === 'test_report')?.table
    if (!testReportTable) {
      throw new Error("Must need both 'workflow' and 'test_report' table name in exporter.bigquery.reports config.")
    }

    this.table = testReportTable
    this.maxBadRecords = config.maxBadRecords ?? 0
  }

  async exportTestReports(reports: TestReport[]): Promise<void> {
    // Write report as tmp json file
    const randString = crypto.randomBytes(8).toString('hex')
    const tmpJsonPath = path.resolve(os.tmpdir(), `magicpod_analyzer_${randString}.json`)
    const reportJson = reports.map((report) => JSON.stringify(report)).join('\n')
    await fs.writeFile(tmpJsonPath, reportJson, {encoding: 'utf8'})

    // Load WorkflowReport table schema
    const schemaPath = path.resolve(SCHEMA_PATH)
    const schemaFile = await fs.readFile(schemaPath)
    const schema = JSON.parse(schemaFile.toString())

    // Load to BigQuery
    this.logger.info(
      `Loading ${tmpJsonPath} to ${this.dataset}.${this.table}. tmp file will be deleted if load complete with no error.`,
    )
    try {
      await this.bigquery
        .dataset(this.dataset)
        .table(this.table)
        .load(tmpJsonPath, {
          schema: {fields: schema},
          maxBadRecords: this.maxBadRecords,
          schemaUpdateOptions: ['ALLOW_FIELD_ADDITION'],
          sourceFormat: 'NEWLINE_DELIMITED_JSON',
          writeDisposition: 'WRITE_APPEND',
        })
    } catch (error) {
      this.logger.error(`ERROR!! loading ${tmpJsonPath} to ${this.dataset}.${this.table}`)
      throw error
    }

    await fs.unlink(tmpJsonPath)
  }
}
