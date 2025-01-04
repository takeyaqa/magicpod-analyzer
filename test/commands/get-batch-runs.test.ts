import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import {expect, test} from '@oclif/test'
import {BigQuery} from '@google-cloud/bigquery'
import {Storage} from '@google-cloud/storage'
import {teenyRequest} from 'teeny-request'

const TOKEN_FOR_TEST = '4uKNEY5hE4w3WCxi'
const MAGICPOD_FOR_TEST = 'http://localhost:3000'
const GCS_FOR_TEST = process.env.GITHUB_ACTIONS ? 'https://localhost:4443' : 'http://localhost:4443'
// eslint-disable-next-line unicorn/prefer-module
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'bigquery_schema', 'test_report.json')

describe('get-batch-runs', () => {
  let storage: Storage
  let bigquery: BigQuery

  beforeEach(async () => {
    // monkey patch for teeny-request
    teenyRequest.defaults = defaults => {
      return (reqOpts, callback) => {
        reqOpts.headers = reqOpts.headers ?? {} // add this line for avoiding undefined error
        const opts = {...defaults, ...reqOpts}
        if (callback === undefined) {
          return teenyRequest(opts)
        }

        teenyRequest(opts, callback)
      }
    }

    storage = new Storage({projectId: 'fake-project', apiEndpoint: GCS_FOR_TEST})
    await storage.createBucket('fake-bucket')
    bigquery = new BigQuery({projectId: 'fake-project'})
    const [dataset] = await bigquery.createDataset('fake-dataset')
    const schemaPath = path.resolve(SCHEMA_PATH)
    const schemaFile = await fs.readFile(schemaPath)
    const schema = JSON.parse(schemaFile.toString())
    await dataset.createTable('test_report', {
      schema: {fields: schema},
    })
  })

  afterEach(async () => {
    await storage.bucket('fake-bucket').deleteFiles({force: true})
    await storage.bucket('fake-bucket').delete()
    await bigquery.dataset('fake-dataset').delete({force: true})
    await fs.rm('.magicpod_analyzer', {force: true, recursive: true})
    await fs.rm('output', {force: true, recursive: true})
  })

  test
  .stdout()
  .command(['get-batch-runs', '--token', TOKEN_FOR_TEST, '-c', './test/magicpod_analyzer_test_gcs_bigquery.yaml', '--baseUrl', MAGICPOD_FOR_TEST, '--gcsBaseURL', GCS_FOR_TEST])
  .exit(0)
  .it('Success with GCS and BigQuery', async ctx => {
    // Check stdout messesges
    expect(ctx.stdout).to.contain('INFO  [GcsStore]')
    expect(ctx.stdout).to.contain('INFO  [BigqueryExporter]')
    expect(ctx.stdout).to.contain('INFO  [MagicPodRunner] Done execute \'magicpod\'. status: success')

    // Check output exists on GCS and BigQuery
    const [rows] = await bigquery.dataset('fake-dataset').table('test_report').getRows()
    expect(rows).to.have.length(100)
    const lastRunFile = await storage.bucket('fake-bucket').file('ci_analyzer/last_run/magicpod.json').download()
    const lastRun = JSON.parse(lastRunFile.toString())
    expect(lastRun).to.have.property('FakeOrganization/FakeProject')
    expect(lastRun['FakeOrganization/FakeProject'].lastRun).to.equal(200)

    // Check output does not exist on local
    try {
      await fs.access('output')
      expect.fail('lastRun file should not be saved in GCS mode')
    } catch (error: any) {
      expect(error.message).to.match(/no such file or directory/)
    }

    try {
      await fs.access(path.join('.magicpod_analyzer', 'last_run', 'magicpod.json'))
      expect.fail('lastRun file should not be saved in GCS mode')
    } catch (error: any) {
      expect(error.message).to.match(/no such file or directory/)
    }
  })

  test
  .stdout()
  .command(['get-batch-runs', '--token', TOKEN_FOR_TEST, '-c', './test/magicpod_analyzer_test_local_local.yaml', '--baseUrl', MAGICPOD_FOR_TEST, '--gcsBaseURL', GCS_FOR_TEST])
  .exit(0)
  .it('Success with local and local', async ctx => {
    // Check stdout messesges
    expect(ctx.stdout).to.contain('INFO  [LocalStore]')
    expect(ctx.stdout).to.contain('INFO  [MagicPodRunner] Done execute \'magicpod\'. status: success')

    // Check output exists on local
    const outputFiles = await fs.readdir('output')
    const outputFile = await fs.readFile(path.join('output', outputFiles[0]), {encoding: 'utf8'})
    const output = JSON.parse(outputFile)
    expect(output).to.have.length(100)
    const lastRunFile = await fs.readFile(path.join('.magicpod_analyzer', 'last_run', 'magicpod.json'), {encoding: 'utf8'})
    const lastRun = JSON.parse(lastRunFile)
    expect(lastRun).to.have.property('FakeOrganization/FakeProject')
    expect(lastRun['FakeOrganization/FakeProject'].lastRun).to.equal(200)

    // Check output does not exist on GCS and BigQuery
    const [rows] = await bigquery.dataset('fake-dataset').table('test_report').getRows()
    expect(rows).to.have.length(0)
    const lastRunFileOnGcs = storage.bucket('fake-bucket').file('ci_analyzer/last_run/magicpod.json')
    expect((await lastRunFileOnGcs.exists())[0]).to.be.false
  })

  test
  .stdout()
  .command(['get-batch-runs', '--token', TOKEN_FOR_TEST, '-c', './test/magicpod_analyzer_test_gcs_bigquery.yaml', '--debug', '--baseUrl', MAGICPOD_FOR_TEST, '--gcsBaseURL', GCS_FOR_TEST])
  .exit(0)
  .it('Debug mode', async ctx => {
    // Check stdout messesges
    expect(ctx.stdout).to.contain('INFO  [MagicPodRunner] --- Enable DEBUG mode ---')
    expect(ctx.stdout).to.contain('INFO  [NullStore] Detect DEBUG mode, nothing is used instead.')
    expect(ctx.stdout).to.contain('DEBUG [MagicPodClient]')
    expect(ctx.stdout).to.contain('INFO  [NullStore] Detect DEBUG mode, skip saving lastRun.')
    expect(ctx.stdout).to.contain('INFO  [MagicPodRunner] Done execute \'magicpod\'. status: success')

    // Check output exists on local but lastRun does not exist
    const outputFiles = await fs.readdir(path.join('output'))
    const outputFile = await fs.readFile(path.join('output', outputFiles[0]), {encoding: 'utf8'})
    const output = JSON.parse(outputFile)
    expect(output).to.have.length(10)
    try {
      await fs.access(path.join('.magicpod_analyzer', 'last_run', 'magicpod.json'))
      expect.fail('lastRun file should not be saved in debug mode')
    } catch (error: any) {
      expect(error.message).to.match(/no such file or directory/)
    }

    // Check output does not exist on GCS and BigQuery
    const [rows] = await bigquery.dataset('fake-dataset').table('test_report').getRows()
    expect(rows).to.have.length(0)
    const lastRunFileOnGcs = storage.bucket('fake-bucket').file('ci_analyzer/last_run/magicpod.json')
    expect((await lastRunFileOnGcs.exists())[0]).to.be.false
  })

  test
  .stdout()
  .command(['get-batch-runs'])
  .catch(/Missing required flag token/s)
  .it('Error without token')
})
