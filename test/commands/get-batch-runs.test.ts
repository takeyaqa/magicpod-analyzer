import {expect, test} from '@oclif/test'

describe('get-batch-runs', () => {
  test
  .stdout()
  .command(['get-batch-runs', '--token', '4uKNEY5hE4w3WCxi', '-c', './test/magicpod_analyzer_test.yaml', '--baseUrl', 'http://localhost:3000'])
  .exit(0)
  .it('Success', ctx => {
    expect(ctx.stdout).to.contain('INFO  [LocalStore]')
  })

  test
  .stdout()
  .command(['get-batch-runs', '--token', '4uKNEY5hE4w3WCxi', '-c', './test/magicpod_analyzer_test.yaml', '--debug', '--baseUrl', 'http://localhost:3000'])
  .exit(0)
  .it('Debug mode', ctx => {
    expect(ctx.stdout).to.contain('INFO  [NullStore] Detect DEBUG mode, skip saving lastRun.')
  })

  test
  .stdout()
  .command(['get-batch-runs'])
  .catch(/Missing required flag token/s)
  .it('Error without token')
})
