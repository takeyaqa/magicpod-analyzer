/* eslint-disable camelcase */
import {expect, test} from '@oclif/test'

describe('get-batch-runs', () => {
  test
  .nock('https://magic-pod.com', api => {
    api.get('/api/v1.0/DummyOrg/DummyPrj/batch-runs/?count=100')
    .reply(200, {organization_name: 'DummyOrg', project_name: 'DummyPrj', batch_runs: []})
  })
  .stdout()
  .command(['get-batch-runs', '--token', 'abc', '-c', './test/magicpod_analyzer_test.yaml'])
  .exit(0)
  .it('Success', ctx => {
    expect(ctx.stdout).to.contain('INFO  [LocalStore]')
  })

  test
  .stdout()
  .command(['get-batch-runs'])
  .catch(/^Missing required flag:\n --token.+$/s)
  .it('Error without token')
})
