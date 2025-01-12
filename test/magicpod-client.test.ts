/* eslint-disable camelcase */
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import {Logger} from 'tslog'

import {MagicPodClient} from '../src/magicpod-client'

chai.use(chaiAsPromised)

const {expect} = chai

const TOKEN_FOR_TEST = '4uKNEY5hE4w3WCxi'

describe('magicpod-client', () => {
  let magicPodClient: MagicPodClient
  let scope: nock.Scope

  beforeEach(async () => {
    nock.disableNetConnect()
    scope = nock('https://app.magicpod.com').matchHeader('Authorization', `Token ${TOKEN_FOR_TEST}`)
    magicPodClient = new MagicPodClient(TOKEN_FOR_TEST, new Logger())
  })

  afterEach(async () => {
    nock.cleanAll()
    nock.abortPendingRequests()
    nock.enableNetConnect()
  })

  it('invalid token', async () => {
    scope = nock('https://app.magicpod.com').get('/api/v1.0/FakeOrganization/FakeProject/batch-runs/').reply(200)
    const client = new MagicPodClient(`Token ${TOKEN_FOR_TEST}`, new Logger())
    await expect(client.getBatchRuns('FakeOrganization', 'FakeProject')).to.be.rejectedWith(
      'Nock: No match for request',
    )
  })

  it('getBatchRuns', async () => {
    scope
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-runs/')
      .query({count: 100})
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_runs: [
          {
            batch_run_number: 200,
            test_setting_name: 'Fake Test Setting',
            status: 'succeeded',
            started_at: '2024-07-18T03:00:00Z',
            finished_at: '2024-07-18T04:00:00Z',
            test_cases: {
              succeeded: 2,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
          },
          {
            batch_run_number: 199,
            test_setting_name: 'Fake Test Setting',
            status: 'failed',
            started_at: '2024-07-17T03:00:00Z',
            finished_at: '2024-07-17T04:00:00Z',
            test_cases: {
              succeeded: 1,
              failed: 1,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
          },
        ],
      })
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-run/200/')
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_run_number: 200,
        test_setting_name: 'Fake Test Setting',
        status: 'succeeded',
        started_at: '2024-07-18T03:00:00Z',
        finished_at: '2024-07-18T04:00:00Z',
        test_cases: {
          succeeded: 2,
          total: 2,
          details: [
            {
              pattern_name: 'fake_pattern_01',
              included_labels: ['Fake Label'],
              excluded_labels: [],
              results: [
                {
                  order: 1,
                  number: 1,
                  status: 'succeeded',
                  started_at: '2024-07-18T03:00:00Z',
                  finished_at: '2024-07-18T03:25:00Z',
                },
                {
                  order: 2,
                  number: 2,
                  status: 'succeeded',
                  started_at: '2024-07-18T03:30:00Z',
                  finished_at: '2024-07-18T03:55:00Z',
                },
              ],
            },
          ],
        },
        url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
      })
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-run/199/')
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_run_number: 199,
        test_setting_name: 'Fake Test Setting',
        status: 'succeeded',
        started_at: '2024-07-17T03:00:00Z',
        finished_at: '2024-07-17T04:00:00Z',
        test_cases: {
          succeeded: 1,
          failed: 1,
          total: 2,
          details: [
            {
              pattern_name: 'fake_pattern_01',
              included_labels: ['Fake Label'],
              excluded_labels: [],
              results: [
                {
                  order: 1,
                  number: 1,
                  status: 'succeeded',
                  started_at: '2024-07-17T03:00:00Z',
                  finished_at: '2024-07-17T03:25:00Z',
                },
                {
                  order: 2,
                  number: 2,
                  status: 'failed',
                  started_at: '2024-07-17T03:30:00Z',
                  finished_at: '2024-07-17T03:55:00Z',
                },
              ],
            },
          ],
        },
        url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
      })
    const batchRuns = await magicPodClient.getBatchRuns('FakeOrganization', 'FakeProject')
    expect(scope.isDone()).to.be.true
    expect(batchRuns).to.be.deep.equal({
      organization_name: 'FakeOrganization',
      project_name: 'FakeProject',
      batch_runs: [
        {
          organization_name: 'FakeOrganization',
          project_name: 'FakeProject',
          batch_run_number: 200,
          test_setting_name: 'Fake Test Setting',
          status: 'succeeded',
          started_at: '2024-07-18T03:00:00Z',
          finished_at: '2024-07-18T04:00:00Z',
          test_cases: {
            succeeded: 2,
            total: 2,
            details: [
              {
                pattern_name: 'fake_pattern_01',
                included_labels: ['Fake Label'],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: 'succeeded',
                    started_at: '2024-07-18T03:00:00Z',
                    finished_at: '2024-07-18T03:25:00Z',
                  },
                  {
                    order: 2,
                    number: 2,
                    status: 'succeeded',
                    started_at: '2024-07-18T03:30:00Z',
                    finished_at: '2024-07-18T03:55:00Z',
                  },
                ],
              },
            ],
          },
          url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
        },
        {
          organization_name: 'FakeOrganization',
          project_name: 'FakeProject',
          batch_run_number: 199,
          test_setting_name: 'Fake Test Setting',
          status: 'succeeded',
          started_at: '2024-07-17T03:00:00Z',
          finished_at: '2024-07-17T04:00:00Z',
          test_cases: {
            succeeded: 1,
            failed: 1,
            total: 2,
            details: [
              {
                pattern_name: 'fake_pattern_01',
                included_labels: ['Fake Label'],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: 'succeeded',
                    started_at: '2024-07-17T03:00:00Z',
                    finished_at: '2024-07-17T03:25:00Z',
                  },
                  {
                    order: 2,
                    number: 2,
                    status: 'failed',
                    started_at: '2024-07-17T03:30:00Z',
                    finished_at: '2024-07-17T03:55:00Z',
                  },
                ],
              },
            ],
          },
          url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
        },
      ],
    })
  })

  it('getBatchRuns - ignore after running data', async () => {
    scope
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-runs/')
      .query({count: 100})
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_runs: [
          {
            batch_run_number: 201,
            test_setting_name: 'Fake Test Setting',
            status: 'running',
            started_at: '2024-07-19T03:00:00Z',
            finished_at: '2024-07-19T04:00:00Z',
            test_cases: {
              succeeded: 0,
              total: 0,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/201/',
          },
          {
            batch_run_number: 200,
            test_setting_name: 'Fake Test Setting',
            status: 'succeeded',
            started_at: '2024-07-18T03:00:00Z',
            finished_at: '2024-07-18T04:00:00Z',
            test_cases: {
              succeeded: 2,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
          },
          {
            batch_run_number: 199,
            test_setting_name: 'Fake Test Setting',
            status: 'failed',
            started_at: '2024-07-17T03:00:00Z',
            finished_at: '2024-07-17T04:00:00Z',
            test_cases: {
              succeeded: 1,
              failed: 1,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
          },
        ],
      })
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-run/200/')
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_run_number: 200,
        test_setting_name: 'Fake Test Setting',
        status: 'succeeded',
        started_at: '2024-07-18T03:00:00Z',
        finished_at: '2024-07-18T04:00:00Z',
        test_cases: {
          succeeded: 2,
          total: 2,
          details: [
            {
              pattern_name: 'fake_pattern_01',
              included_labels: ['Fake Label'],
              excluded_labels: [],
              results: [
                {
                  order: 1,
                  number: 1,
                  status: 'succeeded',
                  started_at: '2024-07-18T03:00:00Z',
                  finished_at: '2024-07-18T03:25:00Z',
                },
                {
                  order: 2,
                  number: 2,
                  status: 'succeeded',
                  started_at: '2024-07-18T03:30:00Z',
                  finished_at: '2024-07-18T03:55:00Z',
                },
              ],
            },
          ],
        },
        url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
      })
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-run/199/')
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_run_number: 199,
        test_setting_name: 'Fake Test Setting',
        status: 'succeeded',
        started_at: '2024-07-17T03:00:00Z',
        finished_at: '2024-07-17T04:00:00Z',
        test_cases: {
          succeeded: 1,
          failed: 1,
          total: 2,
          details: [
            {
              pattern_name: 'fake_pattern_01',
              included_labels: ['Fake Label'],
              excluded_labels: [],
              results: [
                {
                  order: 1,
                  number: 1,
                  status: 'succeeded',
                  started_at: '2024-07-17T03:00:00Z',
                  finished_at: '2024-07-17T03:25:00Z',
                },
                {
                  order: 2,
                  number: 2,
                  status: 'failed',
                  started_at: '2024-07-17T03:30:00Z',
                  finished_at: '2024-07-17T03:55:00Z',
                },
              ],
            },
          ],
        },
        url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
      })
    const batchRuns = await magicPodClient.getBatchRuns('FakeOrganization', 'FakeProject')
    expect(scope.isDone()).to.be.true
    expect(batchRuns).to.be.deep.equal({
      organization_name: 'FakeOrganization',
      project_name: 'FakeProject',
      batch_runs: [
        {
          organization_name: 'FakeOrganization',
          project_name: 'FakeProject',
          batch_run_number: 200,
          test_setting_name: 'Fake Test Setting',
          status: 'succeeded',
          started_at: '2024-07-18T03:00:00Z',
          finished_at: '2024-07-18T04:00:00Z',
          test_cases: {
            succeeded: 2,
            total: 2,
            details: [
              {
                pattern_name: 'fake_pattern_01',
                included_labels: ['Fake Label'],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: 'succeeded',
                    started_at: '2024-07-18T03:00:00Z',
                    finished_at: '2024-07-18T03:25:00Z',
                  },
                  {
                    order: 2,
                    number: 2,
                    status: 'succeeded',
                    started_at: '2024-07-18T03:30:00Z',
                    finished_at: '2024-07-18T03:55:00Z',
                  },
                ],
              },
            ],
          },
          url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
        },
        {
          organization_name: 'FakeOrganization',
          project_name: 'FakeProject',
          batch_run_number: 199,
          test_setting_name: 'Fake Test Setting',
          status: 'succeeded',
          started_at: '2024-07-17T03:00:00Z',
          finished_at: '2024-07-17T04:00:00Z',
          test_cases: {
            succeeded: 1,
            failed: 1,
            total: 2,
            details: [
              {
                pattern_name: 'fake_pattern_01',
                included_labels: ['Fake Label'],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: 'succeeded',
                    started_at: '2024-07-17T03:00:00Z',
                    finished_at: '2024-07-17T03:25:00Z',
                  },
                  {
                    order: 2,
                    number: 2,
                    status: 'failed',
                    started_at: '2024-07-17T03:30:00Z',
                    finished_at: '2024-07-17T03:55:00Z',
                  },
                ],
              },
            ],
          },
          url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
        },
      ],
    })
  })

  it('getBatchRuns - ignore after unresolved data', async () => {
    scope
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-runs/')
      .query({count: 100})
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_runs: [
          {
            batch_run_number: 201,
            test_setting_name: 'Fake Test Setting',
            status: 'succeeded',
            started_at: '2024-07-19T03:00:00Z',
            finished_at: '2024-07-19T04:00:00Z',
            test_cases: {
              succeeded: 2,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/201/',
          },
          {
            batch_run_number: 200,
            test_setting_name: 'Fake Test Setting',
            status: 'unresolved',
            started_at: '2024-07-18T03:00:00Z',
            finished_at: '2024-07-18T04:00:00Z',
            test_cases: {
              succeeded: 2,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
          },
          {
            batch_run_number: 199,
            test_setting_name: 'Fake Test Setting',
            status: 'failed',
            started_at: '2024-07-17T03:00:00Z',
            finished_at: '2024-07-17T04:00:00Z',
            test_cases: {
              succeeded: 1,
              failed: 1,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
          },
        ],
      })
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-run/199/')
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_run_number: 199,
        test_setting_name: 'Fake Test Setting',
        status: 'succeeded',
        started_at: '2024-07-17T03:00:00Z',
        finished_at: '2024-07-17T04:00:00Z',
        test_cases: {
          succeeded: 1,
          failed: 1,
          total: 2,
          details: [
            {
              pattern_name: 'fake_pattern_01',
              included_labels: ['Fake Label'],
              excluded_labels: [],
              results: [
                {
                  order: 1,
                  number: 1,
                  status: 'succeeded',
                  started_at: '2024-07-17T03:00:00Z',
                  finished_at: '2024-07-17T03:25:00Z',
                },
                {
                  order: 2,
                  number: 2,
                  status: 'failed',
                  started_at: '2024-07-17T03:30:00Z',
                  finished_at: '2024-07-17T03:55:00Z',
                },
              ],
            },
          ],
        },
        url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
      })
    const batchRuns = await magicPodClient.getBatchRuns('FakeOrganization', 'FakeProject')
    expect(scope.isDone()).to.be.true
    expect(batchRuns).to.be.deep.equal({
      organization_name: 'FakeOrganization',
      project_name: 'FakeProject',
      batch_runs: [
        {
          organization_name: 'FakeOrganization',
          project_name: 'FakeProject',
          batch_run_number: 199,
          test_setting_name: 'Fake Test Setting',
          status: 'succeeded',
          started_at: '2024-07-17T03:00:00Z',
          finished_at: '2024-07-17T04:00:00Z',
          test_cases: {
            succeeded: 1,
            failed: 1,
            total: 2,
            details: [
              {
                pattern_name: 'fake_pattern_01',
                included_labels: ['Fake Label'],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: 'succeeded',
                    started_at: '2024-07-17T03:00:00Z',
                    finished_at: '2024-07-17T03:25:00Z',
                  },
                  {
                    order: 2,
                    number: 2,
                    status: 'failed',
                    started_at: '2024-07-17T03:30:00Z',
                    finished_at: '2024-07-17T03:55:00Z',
                  },
                ],
              },
            ],
          },
          url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
        },
      ],
    })
  })

  it('getBatchRuns - after specific batch number', async () => {
    scope
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-runs/')
      .query({count: 100, min_batch_run_number: 200})
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_runs: [
          {
            batch_run_number: 200,
            test_setting_name: 'Fake Test Setting',
            status: 'succeeded',
            started_at: '2024-07-18T03:00:00Z',
            finished_at: '2024-07-18T04:00:00Z',
            test_cases: {
              succeeded: 2,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
          },
        ],
      })
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-run/200/')
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_run_number: 200,
        test_setting_name: 'Fake Test Setting',
        status: 'succeeded',
        started_at: '2024-07-18T03:00:00Z',
        finished_at: '2024-07-18T04:00:00Z',
        test_cases: {
          succeeded: 2,
          total: 2,
          details: [
            {
              pattern_name: 'fake_pattern_01',
              included_labels: ['Fake Label'],
              excluded_labels: [],
              results: [
                {
                  order: 1,
                  number: 1,
                  status: 'succeeded',
                  started_at: '2024-07-18T03:00:00Z',
                  finished_at: '2024-07-18T03:25:00Z',
                },
                {
                  order: 2,
                  number: 2,
                  status: 'succeeded',
                  started_at: '2024-07-18T03:30:00Z',
                  finished_at: '2024-07-18T03:55:00Z',
                },
              ],
            },
          ],
        },
        url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
      })
    const batchRuns = await magicPodClient.getBatchRuns('FakeOrganization', 'FakeProject', 199)
    expect(scope.isDone()).to.be.true
    expect(batchRuns).to.be.deep.equals({
      organization_name: 'FakeOrganization',
      project_name: 'FakeProject',
      batch_runs: [
        {
          organization_name: 'FakeOrganization',
          project_name: 'FakeProject',
          batch_run_number: 200,
          test_setting_name: 'Fake Test Setting',
          status: 'succeeded',
          started_at: '2024-07-18T03:00:00Z',
          finished_at: '2024-07-18T04:00:00Z',
          test_cases: {
            succeeded: 2,
            total: 2,
            details: [
              {
                pattern_name: 'fake_pattern_01',
                included_labels: ['Fake Label'],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: 'succeeded',
                    started_at: '2024-07-18T03:00:00Z',
                    finished_at: '2024-07-18T03:25:00Z',
                  },
                  {
                    order: 2,
                    number: 2,
                    status: 'succeeded',
                    started_at: '2024-07-18T03:30:00Z',
                    finished_at: '2024-07-18T03:55:00Z',
                  },
                ],
              },
            ],
          },
          url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
        },
      ],
    })
  })

  it('getBatchRuns - debug mode', async () => {
    scope
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-runs/')
      .query({count: 10})
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_runs: [
          {
            batch_run_number: 200,
            test_setting_name: 'Fake Test Setting',
            status: 'succeeded',
            started_at: '2024-07-18T03:00:00Z',
            finished_at: '2024-07-18T04:00:00Z',
            test_cases: {
              succeeded: 2,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
          },
          {
            batch_run_number: 199,
            test_setting_name: 'Fake Test Setting',
            status: 'failed',
            started_at: '2024-07-17T03:00:00Z',
            finished_at: '2024-07-17T04:00:00Z',
            test_cases: {
              succeeded: 1,
              failed: 1,
              total: 2,
            },
            url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
          },
        ],
      })
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-run/200/')
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_run_number: 200,
        test_setting_name: 'Fake Test Setting',
        status: 'succeeded',
        started_at: '2024-07-18T03:00:00Z',
        finished_at: '2024-07-18T04:00:00Z',
        test_cases: {
          succeeded: 2,
          total: 2,
          details: [
            {
              pattern_name: 'fake_pattern_01',
              included_labels: ['Fake Label'],
              excluded_labels: [],
              results: [
                {
                  order: 1,
                  number: 1,
                  status: 'succeeded',
                  started_at: '2024-07-18T03:00:00Z',
                  finished_at: '2024-07-18T03:25:00Z',
                },
                {
                  order: 2,
                  number: 2,
                  status: 'succeeded',
                  started_at: '2024-07-18T03:30:00Z',
                  finished_at: '2024-07-18T03:55:00Z',
                },
              ],
            },
          ],
        },
        url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
      })
      .get('/api/v1.0/FakeOrganization/FakeProject/batch-run/199/')
      .reply(200, {
        organization_name: 'FakeOrganization',
        project_name: 'FakeProject',
        batch_run_number: 199,
        test_setting_name: 'Fake Test Setting',
        status: 'succeeded',
        started_at: '2024-07-17T03:00:00Z',
        finished_at: '2024-07-17T04:00:00Z',
        test_cases: {
          succeeded: 1,
          failed: 1,
          total: 2,
          details: [
            {
              pattern_name: 'fake_pattern_01',
              included_labels: ['Fake Label'],
              excluded_labels: [],
              results: [
                {
                  order: 1,
                  number: 1,
                  status: 'succeeded',
                  started_at: '2024-07-17T03:00:00Z',
                  finished_at: '2024-07-17T03:25:00Z',
                },
                {
                  order: 2,
                  number: 2,
                  status: 'failed',
                  started_at: '2024-07-17T03:30:00Z',
                  finished_at: '2024-07-17T03:55:00Z',
                },
              ],
            },
          ],
        },
        url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
      })
    const magicPodClient = new MagicPodClient(TOKEN_FOR_TEST, new Logger(), true)
    const batchRuns = await magicPodClient.getBatchRuns('FakeOrganization', 'FakeProject')
    expect(scope.isDone()).to.be.true
    expect(batchRuns).to.be.deep.equal({
      organization_name: 'FakeOrganization',
      project_name: 'FakeProject',
      batch_runs: [
        {
          organization_name: 'FakeOrganization',
          project_name: 'FakeProject',
          batch_run_number: 200,
          test_setting_name: 'Fake Test Setting',
          status: 'succeeded',
          started_at: '2024-07-18T03:00:00Z',
          finished_at: '2024-07-18T04:00:00Z',
          test_cases: {
            succeeded: 2,
            total: 2,
            details: [
              {
                pattern_name: 'fake_pattern_01',
                included_labels: ['Fake Label'],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: 'succeeded',
                    started_at: '2024-07-18T03:00:00Z',
                    finished_at: '2024-07-18T03:25:00Z',
                  },
                  {
                    order: 2,
                    number: 2,
                    status: 'succeeded',
                    started_at: '2024-07-18T03:30:00Z',
                    finished_at: '2024-07-18T03:55:00Z',
                  },
                ],
              },
            ],
          },
          url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/200/',
        },
        {
          organization_name: 'FakeOrganization',
          project_name: 'FakeProject',
          batch_run_number: 199,
          test_setting_name: 'Fake Test Setting',
          status: 'succeeded',
          started_at: '2024-07-17T03:00:00Z',
          finished_at: '2024-07-17T04:00:00Z',
          test_cases: {
            succeeded: 1,
            failed: 1,
            total: 2,
            details: [
              {
                pattern_name: 'fake_pattern_01',
                included_labels: ['Fake Label'],
                excluded_labels: [],
                results: [
                  {
                    order: 1,
                    number: 1,
                    status: 'succeeded',
                    started_at: '2024-07-17T03:00:00Z',
                    finished_at: '2024-07-17T03:25:00Z',
                  },
                  {
                    order: 2,
                    number: 2,
                    status: 'failed',
                    started_at: '2024-07-17T03:30:00Z',
                    finished_at: '2024-07-17T03:55:00Z',
                  },
                ],
              },
            ],
          },
          url: 'https://app.fakepod.example.com/FakeOrganization/FakeProject/batch-run/199/',
        },
      ],
    })
  })
})
