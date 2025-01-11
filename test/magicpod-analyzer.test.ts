/* eslint-disable camelcase */
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import {MagicPodAnalyzer} from '../src/magicpod-analyzer'

chai.use(chaiAsPromised)

const {expect} = chai

describe('magicpod-analyzer', () => {
  let magicPodAnalyzer: MagicPodAnalyzer

  beforeEach(async () => {
    magicPodAnalyzer = new MagicPodAnalyzer()
  })

  it('createTestReports - succeeded data', async () => {
    const report = await magicPodAnalyzer.createTestReports({
      organization_name: 'FakeOrganization',
      project_name: 'FakeProject',
      batch_runs: [
        {
          batch_run_number: 200,
          test_setting_name: "Fake Test Setting",
          status: "succeeded",
          started_at: "2024-07-18T03:00:00Z",
          finished_at: "2024-07-18T04:00:00Z",
          test_cases: {
            succeeded: 2,
            total: 2,
            details: [
              {
                pattern_name: "fake_pattern_01",
                included_labels: ["Fake Label"],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: "succeeded",
                    started_at: "2024-07-18T03:00:00Z",
                    finished_at: "2024-07-18T03:25:00Z",
                  },
                  {
                    order: 2,
                    number: 2,
                    status: "succeeded",
                    started_at: "2024-07-18T03:30:00Z",
                    finished_at: "2024-07-18T03:55:00Z",
                  },
                ],
              },
            ],
          },
          url: "https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/",
        },
      ]
    })
    expect(report).to.deep.equal([
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
    ])
  })

  it('createTestReports - failed data', async () => {
    const report = await magicPodAnalyzer.createTestReports({
      organization_name: 'FakeOrganization',
      project_name: 'FakeProject',
      batch_runs: [
        {
          batch_run_number: 201,
          test_setting_name: "Fake Test Setting",
          status: "failed",
          started_at: "2024-07-18T03:00:00Z",
          finished_at: "2024-07-18T04:00:00Z",
          test_cases: {
            succeeded: 1,
            failed: 1,
            total: 2,
            details: [
              {
                pattern_name: "fake_pattern_01",
                included_labels: ["Fake Label"],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: "succeeded",
                    started_at: "2024-07-18T03:00:00Z",
                    finished_at: "2024-07-18T03:25:00Z",
                  },
                  {
                    order: 2,
                    number: 2,
                    status: "failed",
                    started_at: "2024-07-18T03:30:00Z",
                    finished_at: "2024-07-18T03:55:00Z",
                  },
                ],
              },
            ],
          },
          url: "https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/",
        },
      ]
    })
    expect(report).to.deep.equal([
      {
        workflowId: 'FakeOrganization/FakeProject-Fake Test Setting',
        workflowRunId: 'FakeOrganization/FakeProject-Fake Test Setting-201',
        buildNumber: 201,
        workflowName: 'Fake Test Setting',
        createdAt: new Date('2024-07-18T03:00:00Z'),
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
  })
})
