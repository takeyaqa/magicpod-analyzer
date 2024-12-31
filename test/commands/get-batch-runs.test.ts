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

  before(async () => {
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
    return dataset.createTable('test_report', {
      schema: {fields: schema},
    })
  })

  after(async () => {
    await storage.bucket('fake-bucket').deleteFiles({force: true})
    await storage.bucket('fake-bucket').delete()
    return bigquery.dataset('fake-dataset').delete({force: true})
  })

  test
  .stdout()
  .command(['get-batch-runs', '--token', TOKEN_FOR_TEST, '-c', './test/magicpod_analyzer_test.yaml', '--baseUrl', MAGICPOD_FOR_TEST, '--gcsBaseURL', GCS_FOR_TEST])
  .exit(0)
  .it('Success', async ctx => {
    expect(ctx.stdout).to.contain('INFO  [GcsStore]')
    expect(ctx.stdout).to.contain('INFO  [BigqueryExporter]')
    const [rows] = await bigquery.dataset('fake-dataset').table('test_report').getRows()
    expect(rows).to.have.length(100)
    const lastRunFile = await storage.bucket('fake-bucket').file('ci_analyzer/last_run/magicpod.json').download()
    const lastRun = JSON.parse(lastRunFile.toString())
    expect(lastRun).to.have.property('FakeOrganization/FakeProject')
    expect(lastRun['FakeOrganization/FakeProject'].lastRun).to.equal(200)
  })

  test
  .stdout()
  .command(['get-batch-runs', '--token', TOKEN_FOR_TEST, '-c', './test/magicpod_analyzer_test.yaml', '--debug', '--baseUrl', MAGICPOD_FOR_TEST, '--gcsBaseURL', GCS_FOR_TEST])
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
