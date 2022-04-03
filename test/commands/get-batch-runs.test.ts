/* eslint-disable camelcase */
import {expect, test} from '@oclif/test'

describe('get-batch-runs', () => {
  test
  .nock('https://magic-pod.com', api => {
    api.get('/api/v1.0/DummyOrg/DummyPrj/batch-runs/?count=20&min_batch_run_number=1')
    .reply(200, {organization_name: 'DummyOrg', project_name: 'DummyPrj', batch_runs: []})
  })
  .stdout()
  .command(['get-batch-runs', 'DummyOrg/DummyPrj', '--token', 'abc'])
  .exit(0)
  .it('Success', ctx => {
    expect(ctx.stdout).to.contain('Retrieve batch run data from DummyOrg/DummyPrj')
  })

  test
  .stdout()
  .command(['get-batch-runs', '--token', 'abc'])
  .catch(/^Missing 1 required arg:\nproject.+$/s)
  .it('Error without project')

  test
  .stdout()
  .command(['get-batch-runs', 'DummyOrg/DummyPrj'])
  .catch(/^Missing required flag:\n --token.+$/s)
  .it('Error without token')

  test
  .stdout()
  .command(['get-batch-runs', 'DummyOrg', '--token', 'abc'])
  .catch(/^You must set project.+$/)
  .it('Error only org or project')
})
// expect(ctx.stdout).to.contain('project  organizationName/projectName')
