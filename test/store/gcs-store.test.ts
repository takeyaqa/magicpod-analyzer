import {File} from '@google-cloud/storage'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as path from 'node:path'
import * as td from 'testdouble'
import {Logger} from 'tslog'

import {GcsStore} from '../../src/store/gcs-store'

chai.use(chaiAsPromised)

const {expect} = chai

describe('gcs-store', () => {
  let store: GcsStore
  let fileDouble: File

  beforeEach(async () => {
    fileDouble = td.object<File>()
    store = new GcsStore(new Logger(), 'fake-project', 'fake-bucket', path.join('ci_analyzer', 'last_run', 'magicpod.json'))
    store.file = fileDouble
  })

  afterEach(async () => {
    td.reset()
  })

  it('initialize error', () => {
    expect(() => new GcsStore(new Logger(), undefined, undefined)).to.throw('Must need \'project\' and \'bucket\' params for lastRunStore in config')
    expect(() => new GcsStore(new Logger(), 'fake-project', undefined)).to.throw('Must need \'project\' and \'bucket\' params for lastRunStore in config')
    expect(() => new GcsStore(new Logger(), undefined, 'fake-bucket')).to.throw('Must need \'project\' and \'bucket\' params for lastRunStore in config')
  })

  it('initialize with no params', () => {
    const store = new GcsStore(new Logger(), 'fake-project', 'fake-bucket')
    expect(store.gcsPath).to.equal('gs://fake-bucket/ci_analyzer/last_run/magicpod.json')
  })

  it('initialize with path', () => {
    const store = new GcsStore(new Logger(), 'fake-project', 'fake-bucket', path.join('test', 'last_run', 'magicpod.json'))
    expect(store.gcsPath).to.equal('gs://fake-bucket/test/last_run/magicpod.json')
  })

  it('read with no previous file', async () => {
    td.when(fileDouble.exists()).thenResolve([false])
    expect(await store.read()).to.be.empty
  })

  it('read with exists previous file', async () => {
    td.when(fileDouble.exists()).thenResolve([true])
    td.when(fileDouble.download()).thenResolve([Buffer.from('{"FakeProject/FakeOrganization": {"lastRun": 1, "updatedAt": "2025-01-01T12:00:00.000Z"}}')])
    const lastRun = await store.read()
    expect(lastRun).to.be.deep.equal({'FakeProject/FakeOrganization': {lastRun: 1, updatedAt: '2025-01-01T12:00:00.000Z'}})
  })

  it('write', async () => {
    td.when(fileDouble.exists()).thenResolve([true])
    td.when(fileDouble.download()).thenResolve([Buffer.from('{"FakeProject/FakeOrganization": {"lastRun": 1, "updatedAt": "2025-01-01T12:00:00.000Z"}}')])
    const lastRun = await store.write({'FakeProject/FakeOrganization': {lastRun: 2, updatedAt: new Date('2025-01-02T12:00:00.000Z')}})
    expect(lastRun).to.be.deep.equal({'FakeProject/FakeOrganization': {lastRun: 2, updatedAt: new Date('2025-01-02T12:00:00.000Z')}})
    td.verify(fileDouble.save(JSON.stringify({'FakeProject/FakeOrganization': {lastRun: 2, updatedAt: new Date('2025-01-02T12:00:00.000Z')}}, null, 2)))
  })
})
