import {BigQuery, Dataset, Table} from '@google-cloud/bigquery'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as td from 'testdouble'
import {Logger} from 'tslog'

import {BigqueryExporter} from '../../src/exporter/bigquery-exporter'

chai.use(chaiAsPromised)

const {expect} = chai

// eslint-disable-next-line unicorn/prefer-module
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'bigquery_schema', 'test_report.json')

describe('bigquery-exporter', () => {
  let exporter: BigqueryExporter
  let bigqueryDouble: BigQuery
  let datasetDouble: Dataset
  let tableDouble: Table
  let schema: string

  beforeEach(async () => {
    bigqueryDouble = td.object<BigQuery>()
    datasetDouble = td.object<Dataset>()
    tableDouble = td.object<Table>()
    exporter = new BigqueryExporter(new Logger(), {
      project: 'fake-project',
      dataset: 'fake-dataset',
      reports: [{name: 'test_report', table: 'test_report'}],
    })
    exporter.bigquery = bigqueryDouble
    td.when(bigqueryDouble.dataset('fake-dataset')).thenReturn(datasetDouble)
    td.when(datasetDouble.table('test_report')).thenReturn(tableDouble)
    const schemaPath = path.resolve(SCHEMA_PATH)
    const schemaFile = await fs.readFile(schemaPath)
    schema = JSON.parse(schemaFile.toString())
  })

  afterEach(async () => {
    td.reset()
  })

  it('initialize error', async () => {
    expect(() => new BigqueryExporter(new Logger(), {})).to.throw(
      "Must need 'project', 'dataset' parameter in exporter.bigquery config.",
    )
    expect(
      () =>
        new BigqueryExporter(new Logger(), {
          reports: [{name: 'test_report', table: 'test_report'}],
        }),
    ).to.throw("Must need 'project', 'dataset' parameter in exporter.bigquery config.")
    expect(
      () =>
        new BigqueryExporter(new Logger(), {
          project: 'fake-project',
          dataset: 'fake-dataset',
        }),
    ).to.throw("Must need both 'workflow' and 'test_report' table name in exporter.bigquery.reports config.")
  })

  it('initialize', async () => {
    const exporter = new BigqueryExporter(new Logger(), {
      project: 'fake-project',
      dataset: 'fake-dataset',
      reports: [{name: 'test_report', table: 'test_report'}],
    })
    expect(exporter).to.be.instanceOf(BigqueryExporter)
  })

  it('exportTestReports', async () => {
    await exporter.exportTestReports([
      {
        workflowId: 'FakeOrganization/FakeProject-Fake Test Setting',
        workflowRunId: 'FakeOrganization/FakeProject-Fake Test Setting-200',
        buildNumber: 200,
        workflowName: 'Fake Test Setting',
        createdAt: new Date('2024-07-18T03:00:00Z'),
        branch: '',
        service: 'magicpod',
        testSuites: {
          name: 'Fake Test Setting',
          tests: 2,
          failures: 0,
          time: 3600,
          testsuite: [
            {
              name: 'Fake Test Setting',
              errors: 0,
              failures: 0,
              skipped: 0,
              timestamp: new Date('2024-07-18T03:00:00Z'),
              time: 3600,
              tests: 2,
              testcase: [
                {
                  classname: 'No.1',
                  name: 'No.1',
                  time: 1500,
                  successCount: 1,
                  status: 'SUCCESS',
                },
                {
                  classname: 'No.2',
                  name: 'No.2',
                  time: 1500,
                  successCount: 1,
                  status: 'SUCCESS',
                },
              ],
            },
          ],
        },
        status: 'SUCCESS',
        successCount: 1,
      },
      {
        workflowId: 'FakeOrganization/FakeProject-Fake Test Setting',
        workflowRunId: 'FakeOrganization/FakeProject-Fake Test Setting-199',
        buildNumber: 199,
        workflowName: 'Fake Test Setting',
        createdAt: new Date('2024-07-17T03:00:00Z'),
        branch: '',
        service: 'magicpod',
        testSuites: {
          name: 'Fake Test Setting',
          tests: 2,
          failures: 1,
          time: 3600,
          testsuite: [
            {
              name: 'Fake Test Setting',
              errors: 0,
              failures: 1,
              skipped: 0,
              timestamp: new Date('2024-07-17T03:00:00Z'),
              time: 3600,
              tests: 2,
              testcase: [
                {
                  classname: 'No.1',
                  name: 'No.1',
                  time: 1500,
                  successCount: 1,
                  status: 'SUCCESS',
                },
                {
                  classname: 'No.2',
                  name: 'No.2',
                  time: 1500,
                  successCount: 0,
                  status: 'FAILURE',
                },
              ],
            },
          ],
        },
        status: 'FAILURE',
        successCount: 0,
      },
    ])
    td.verify(
      tableDouble.load(
        td.matchers.contains(/^.+\/magicpod_analyzer_[\da-z]{16}\.json$/),
        td.matchers.contains({
          schema: {fields: schema},
          maxBadRecords: 0,
          schemaUpdateOptions: ['ALLOW_FIELD_ADDITION'],
          sourceFormat: 'NEWLINE_DELIMITED_JSON',
          writeDisposition: 'WRITE_APPEND',
        }),
      ),
    )
  })
})
