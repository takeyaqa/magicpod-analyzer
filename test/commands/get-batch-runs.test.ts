import {BigQuery} from '@google-cloud/bigquery'
import {Storage} from '@google-cloud/storage'
import {runCommand} from '@oclif/test'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import {teenyRequest} from 'teeny-request'

chai.use(chaiAsPromised)

const {expect} = chai

const TOKEN_FOR_TEST = '4uKNEY5hE4w3WCxi'
const MAGICPOD_FOR_TEST = 'http://localhost:3000'
const BIGQUERY_FOR_TEST = 'http://localhost:9050'
const GCS_FOR_TEST = process.env.GITHUB_ACTIONS ? 'https://localhost:4443' : 'http://localhost:4443'
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'bigquery_schema', 'test_report.json')

describe('get-batch-runs', () => {
  let storage: Storage
  let bigquery: BigQuery
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(async () => {
    // monkey patch for teeny-request
    teenyRequest.defaults = (defaults) => (reqOpts, callback) => {
      reqOpts.headers = reqOpts.headers ?? {} // add this line for avoiding undefined error
      const opts = {...defaults, ...reqOpts}
      if (callback === undefined) {
        return teenyRequest(opts)
      }

      teenyRequest(opts, callback)
    }

    // Set environment variables
    originalEnv = {...process.env}
    process.env = {
      ...originalEnv,
      MAGICPOD_EMULATOR_HOST: MAGICPOD_FOR_TEST,
      GCS_EMULATOR_HOST: GCS_FOR_TEST,
      BIGQUERY_EMULATOR_HOST: BIGQUERY_FOR_TEST,
    }

    // Create Fake GCS bucket
    storage = new Storage({projectId: 'fake-project', apiEndpoint: GCS_FOR_TEST})
    await storage.createBucket('fake-bucket')

    // Create Fake BigQuery dataset
    bigquery = new BigQuery({projectId: 'fake-project'})
    const [dataset] = await bigquery.createDataset('fake-dataset')
    const schemaFile = await fs.readFile(path.resolve(SCHEMA_PATH))
    const schema = JSON.parse(schemaFile.toString())
    await dataset.createTable('test_report', {
      schema: {fields: schema},
    })
  })

  afterEach(async () => {
    // Delete Fake GCS bucket
    await storage.bucket('fake-bucket').deleteFiles({force: true})
    await storage.bucket('fake-bucket').delete()

    // Delete Fake BigQuery dataset
    await bigquery.dataset('fake-dataset').delete({force: true})

    // Delete output directory
    await fs.rm('.magicpod_analyzer', {force: true, recursive: true})
    await fs.rm('output', {force: true, recursive: true})

    // Reset environment variables
    process.env = originalEnv
  })

  it('Success with GCS and BigQuery', async () => {
    // Run command
    const {stdout} = await runCommand<{name: string}>([
      'get-batch-runs',
      '--token',
      TOKEN_FOR_TEST,
      '--config',
      './test/magicpod_analyzer_test_gcs_bigquery.yaml',
    ])

    // Check stdout messesges
    // expect(stdout).to.contain('INFO  [GcsStore]')
    // expect(stdout).to.contain('INFO  [BigqueryExporter]')
    expect(stdout).to.contain("Done execute 'magicpod'. status: success")

    // Check output exists on GCS and BigQuery
    // const [rows] = await bigquery.dataset('fake-dataset').table('test_report').getRows()
    // expect(rows).to.have.length(100)
    const [result] = await bigquery.query('SELECT COUNT(*) AS rowCount FROM fake-dataset.test_report')
    expect(result[0].rowCount).to.equal(100)
    const lastRunFile = await storage.bucket('fake-bucket').file('ci_analyzer/last_run/magicpod.json').download()
    const lastRun = JSON.parse(lastRunFile.toString())
    expect(lastRun).to.have.property('FakeOrganization/FakeProject')
    expect(lastRun['FakeOrganization/FakeProject'].lastRun).to.equal(200)

    // Check output does not exist on local
    await expect(fs.access('output')).to.be.rejectedWith('no such file or directory')
    await expect(fs.access(path.join('.magicpod_analyzer', 'last_run', 'magicpod.json'))).to.be.rejectedWith(
      'no such file or directory',
    )
  })

  it('Success with local and local', async () => {
    // Run command
    const {stdout} = await runCommand<{name: string}>([
      'get-batch-runs',
      '--token',
      TOKEN_FOR_TEST,
      '--config',
      './test/magicpod_analyzer_test_local_local.yaml',
    ])

    // Check stdout messesges
    // expect(stdout).to.contain('INFO  [LocalStore]')
    expect(stdout).to.contain("Done execute 'magicpod'. status: success")

    // Check output exists on local
    const outputFiles = await fs.readdir('output')
    const outputFile = await fs.readFile(path.join('output', outputFiles[0]), {encoding: 'utf8'})
    const output = JSON.parse(outputFile)
    expect(output).to.have.length(100)
    const lastRunFile = await fs.readFile(path.join('.magicpod_analyzer', 'last_run', 'magicpod.json'), {
      encoding: 'utf8',
    })
    const lastRun = JSON.parse(lastRunFile)
    expect(lastRun).to.have.property('FakeOrganization/FakeProject')
    expect(lastRun['FakeOrganization/FakeProject'].lastRun).to.equal(200)

    // Check output does not exist on GCS and BigQuery
    // const [rows] = await bigquery.dataset('fake-dataset').table('test_report').getRows()
    // expect(rows).to.have.length(0)
    const [result] = await bigquery.query('SELECT COUNT(*) AS rowCount FROM fake-dataset.test_report')
    expect(result[0].rowCount).to.equal(0)
    const lastRunFileOnGcs = storage.bucket('fake-bucket').file('ci_analyzer/last_run/magicpod.json')
    const [existsLastRunFileOnGcs] = await lastRunFileOnGcs.exists()
    expect(existsLastRunFileOnGcs).to.be.false
  })

  it('Debug mode', async () => {
    // Run command
    const {stdout} = await runCommand<{name: string}>([
      'get-batch-runs',
      '--token',
      TOKEN_FOR_TEST,
      '--config',
      './test/magicpod_analyzer_test_gcs_bigquery.yaml',
      '--debug',
    ])

    // Check stdout messesges
    expect(stdout).to.contain('--- Enable DEBUG mode ---')
    expect(stdout).to.contain('Detect DEBUG mode, nothing is used instead.')
    // expect(stdout).to.contain('DEBUG [MagicPodClient]')
    expect(stdout).to.contain('Detect DEBUG mode, skip saving lastRun.')
    expect(stdout).to.contain("Done execute 'magicpod'. status: success")

    // Check output exists on local but lastRun does not exist
    const outputFiles = await fs.readdir(path.join('output'))
    const outputFile = await fs.readFile(path.join('output', outputFiles[0]), {encoding: 'utf8'})
    const output = JSON.parse(outputFile)
    expect(output).to.have.length(10)
    await expect(fs.access(path.join('.magicpod_analyzer', 'last_run', 'magicpod.json'))).to.be.rejectedWith(
      'no such file or directory',
    )

    // Check output does not exist on GCS and BigQuery
    // const [rows] = await bigquery.dataset('fake-dataset').table('test_report').getRows()
    // expect(rows).to.have.length(0)
    const [result] = await bigquery.query('SELECT COUNT(*) AS rowCount FROM fake-dataset.test_report')
    expect(result[0].rowCount).to.equal(0)
    const lastRunFileOnGcs = storage.bucket('fake-bucket').file('ci_analyzer/last_run/magicpod.json')
    const [existsLastRunFileOnGcs] = await lastRunFileOnGcs.exists()
    expect(existsLastRunFileOnGcs).to.be.false
  })

  it('Error without MagicPod token', async () => {
    // Run command
    const {error} = await runCommand<{name: string}>([
      'get-batch-runs',
      '--config',
      './test/magicpod_analyzer_test_gcs_bigquery.yaml',
    ])

    // Check error messesges
    expect(error?.message).to.match(/Missing required flag token/)
  })

  it('Error invalid MagicPod token', async () => {
    // Run command
    const {stdout, error} = await runCommand<{name: string}>([
      'get-batch-runs',
      '--token',
      'invalid',
      '--config',
      './test/magicpod_analyzer_test_gcs_bigquery.yaml',
    ])

    // Check error messesges
    expect(stdout).to.contain('Unauthorized')
    expect(error?.message).to.match(/Some error raised in 'FakeOrganization\/FakeProject', so it skipped\./)
  })

  it('Error config file not found', async () => {
    // Run command
    const {error} = await runCommand<{name: string}>([
      'get-batch-runs',
      '--token',
      TOKEN_FOR_TEST,
      '--config',
      './test/magicpod_analyzer_test_not_exist.yaml',
    ])

    // Check error messesges
    expect(error?.message).to.match(
      /ENOENT: no such file or directory, open '\.\/test\/magicpod_analyzer_test_not_exist.yaml'/,
    )
  })
})
