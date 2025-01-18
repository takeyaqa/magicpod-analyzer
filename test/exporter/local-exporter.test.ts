import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import fs from 'node:fs/promises'
import path from 'node:path'
import * as td from 'testdouble'

import {LocalExporter} from '../../src/exporter/local-exporter'

chai.use(chaiAsPromised)

const {expect} = chai

describe('local-exporter', () => {
  let fsDouble: typeof fs

  beforeEach(async () => {
    fsDouble = td.replace('node:fs/promises')
  })

  afterEach(async () => {
    td.reset()
  })

  it('initialize with no params', async () => {
    const exporter = new LocalExporter()
    expect(path.isAbsolute(exporter.outDir)).to.be.true
    expect(exporter.outDir).to.equal(path.join(process.cwd(), 'output'))
  })

  it('initialize with outDir', async () => {
    const exporter = new LocalExporter({outDir: 'output'})
    expect(path.isAbsolute(exporter.outDir)).to.be.true
    expect(exporter.outDir).to.equal(path.join(process.cwd(), 'output'))
  })

  it('exportTestReports - json', async () => {
    const exporter = new LocalExporter({outDir: 'output'})
    exporter.fs = fsDouble
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
    td.verify(fsDouble.mkdir(td.matchers.contains('output'), {recursive: true}))
    td.verify(
      fsDouble.writeFile(
        td.matchers.contains(/^.+\/output\/\d{8}-\d{4}-test-magicpod\.json$/),
        `[
  {
    "workflowId": "FakeOrganization/FakeProject-Fake Test Setting",
    "workflowRunId": "FakeOrganization/FakeProject-Fake Test Setting-200",
    "buildNumber": 200,
    "workflowName": "Fake Test Setting",
    "createdAt": "2024-07-18T03:00:00.000Z",
    "branch": "",
    "service": "magicpod",
    "testSuites": {
      "name": "Fake Test Setting",
      "tests": 2,
      "failures": 0,
      "time": 3600,
      "testsuite": [
        {
          "name": "Fake Test Setting",
          "errors": 0,
          "failures": 0,
          "skipped": 0,
          "timestamp": "2024-07-18T03:00:00.000Z",
          "time": 3600,
          "tests": 2,
          "testcase": [
            {
              "classname": "No.1",
              "name": "No.1",
              "time": 1500,
              "successCount": 1,
              "status": "SUCCESS"
            },
            {
              "classname": "No.2",
              "name": "No.2",
              "time": 1500,
              "successCount": 1,
              "status": "SUCCESS"
            }
          ]
        }
      ]
    },
    "status": "SUCCESS",
    "successCount": 1
  },
  {
    "workflowId": "FakeOrganization/FakeProject-Fake Test Setting",
    "workflowRunId": "FakeOrganization/FakeProject-Fake Test Setting-199",
    "buildNumber": 199,
    "workflowName": "Fake Test Setting",
    "createdAt": "2024-07-17T03:00:00.000Z",
    "branch": "",
    "service": "magicpod",
    "testSuites": {
      "name": "Fake Test Setting",
      "tests": 2,
      "failures": 1,
      "time": 3600,
      "testsuite": [
        {
          "name": "Fake Test Setting",
          "errors": 0,
          "failures": 1,
          "skipped": 0,
          "timestamp": "2024-07-17T03:00:00.000Z",
          "time": 3600,
          "tests": 2,
          "testcase": [
            {
              "classname": "No.1",
              "name": "No.1",
              "time": 1500,
              "successCount": 1,
              "status": "SUCCESS"
            },
            {
              "classname": "No.2",
              "name": "No.2",
              "time": 1500,
              "successCount": 0,
              "status": "FAILURE"
            }
          ]
        }
      ]
    },
    "status": "FAILURE",
    "successCount": 0
  }
]`,
        {encoding: 'utf8'},
      ),
    )
  })

  it('exportTestReports - json_lines', async () => {
    const exporter = new LocalExporter({outDir: 'output', format: 'json_lines'})
    exporter.fs = fsDouble
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
    td.verify(fsDouble.mkdir(td.matchers.contains('output'), {recursive: true}))
    td.verify(
      fsDouble.writeFile(
        td.matchers.contains(/^.+\/output\/\d{8}-\d{4}-test-magicpod\.json$/),
        `{"workflowId":"FakeOrganization/FakeProject-Fake Test Setting","workflowRunId":"FakeOrganization/FakeProject-Fake Test Setting-200","buildNumber":200,"workflowName":"Fake Test Setting","createdAt":"2024-07-18T03:00:00.000Z","branch":"","service":"magicpod","testSuites":{"name":"Fake Test Setting","tests":2,"failures":0,"time":3600,"testsuite":[{"name":"Fake Test Setting","errors":0,"failures":0,"skipped":0,"timestamp":"2024-07-18T03:00:00.000Z","time":3600,"tests":2,"testcase":[{"classname":"No.1","name":"No.1","time":1500,"successCount":1,"status":"SUCCESS"},{"classname":"No.2","name":"No.2","time":1500,"successCount":1,"status":"SUCCESS"}]}]},"status":"SUCCESS","successCount":1}
{"workflowId":"FakeOrganization/FakeProject-Fake Test Setting","workflowRunId":"FakeOrganization/FakeProject-Fake Test Setting-199","buildNumber":199,"workflowName":"Fake Test Setting","createdAt":"2024-07-17T03:00:00.000Z","branch":"","service":"magicpod","testSuites":{"name":"Fake Test Setting","tests":2,"failures":1,"time":3600,"testsuite":[{"name":"Fake Test Setting","errors":0,"failures":1,"skipped":0,"timestamp":"2024-07-17T03:00:00.000Z","time":3600,"tests":2,"testcase":[{"classname":"No.1","name":"No.1","time":1500,"successCount":1,"status":"SUCCESS"},{"classname":"No.2","name":"No.2","time":1500,"successCount":0,"status":"FAILURE"}]}]},"status":"FAILURE","successCount":0}`,
        {encoding: 'utf8'},
      ),
    )
  })
})
