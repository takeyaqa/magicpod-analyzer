import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as td from 'testdouble'

import {BigqueryExporter} from '../../src/exporter/bigquery-exporter'
import {CompositExporter} from '../../src/exporter/exporter'
import {LocalExporter} from '../../src/exporter/local-exporter'

chai.use(chaiAsPromised)

const {expect} = chai

describe('exporter', () => {
  let exporter: CompositExporter
  let localExporterDouble: LocalExporter
  let bigqueryExporterDouble: BigqueryExporter

  beforeEach(async () => {
    exporter = new CompositExporter({
      local: {outDir: 'output'},
      bigquery: {
        project: 'fake-project',
        dataset: 'fake-dataset',
        reports: [{name: 'test_report', table: 'test_report'}],
      },
    })
    localExporterDouble = td.object<LocalExporter>()
    bigqueryExporterDouble = td.object<BigqueryExporter>()
    exporter.exporters[0] = localExporterDouble
    exporter.exporters[1] = bigqueryExporterDouble
  })

  afterEach(async () => {
    td.reset()
  })

  it('initialize', async () => {
    const exporter = new CompositExporter({
      local: {outDir: 'output'},
      bigquery: {
        project: 'fake-project',
        dataset: 'fake-dataset',
        reports: [{name: 'test_report', table: 'test_report'}],
      },
    })
    expect(exporter.exporters.length).to.equal(2)
    expect(exporter.exporters[0]).to.be.instanceOf(LocalExporter)
    expect(exporter.exporters[1]).to.be.instanceOf(BigqueryExporter)
  })

  it('initialize - debug mode', async () => {
    const exporter = new CompositExporter(
      {
        local: {outDir: 'output'},
        bigquery: {
          project: 'fake-project',
          dataset: 'fake-dataset',
          reports: [{name: 'test_report', table: 'test_report'}],
        },
      },
      true,
    )
    expect(exporter.exporters.length).to.equal(1)
    expect(exporter.exporters[0]).to.be.instanceOf(LocalExporter)
  })

  it('initialize - without config', async () => {
    const exporter = new CompositExporter()
    expect(exporter.exporters.length).to.equal(1)
    expect(exporter.exporters[0]).to.be.instanceOf(LocalExporter)
  })

  it('exportTestReports', async () => {
    const testReports = [
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
    ]
    await exporter.exportTestReports(testReports)
    td.verify(localExporterDouble.exportTestReports(testReports))
    td.verify(bigqueryExporterDouble.exportTestReports(testReports))
  })
})
