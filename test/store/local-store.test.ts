import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as td from 'testdouble'

import {LocalStore} from '../../src/store/local-store'

chai.use(chaiAsPromised)

const {expect} = chai

describe('local-store', () => {
  let store: LocalStore
  let fsDouble: typeof fs

  beforeEach(async () => {
    fsDouble = td.replace('node:fs/promises')
    store = new LocalStore(path.join('.magicpod_analyzer', 'last_run', 'magicpod.json'))
    store.fs = fsDouble
  })

  afterEach(async () => {
    td.reset()
  })

  it('initialize with no params', () => {
    const store = new LocalStore()
    expect(path.isAbsolute(store.filePath)).to.be.true
    expect(store.filePath).to.equal(path.join(process.cwd(), '.magicpod_analyzer', 'last_run', 'magicpod.json'))
  })

  it('initialize with path', () => {
    const store = new LocalStore('test.json')
    expect(path.isAbsolute(store.filePath)).to.be.true
    expect(store.filePath).to.equal(path.join(process.cwd(), 'test.json'))
  })

  it('read with no previous file', async () => {
    td.when(fsDouble.access(store.filePath)).thenReject('Error')
    expect(await store.read()).to.be.empty
  })

  it('read with exists previous file', async () => {
    td.when(fsDouble.readFile(store.filePath, {encoding: 'utf8'})).thenResolve(`{
  "FakeProject/FakeOrganization": {
    "lastRun": 1,
    "updatedAt":"2025-01-01T12:00:00.000Z"
  }
}`)
    const lastRun = await store.read()
    expect(lastRun).to.be.deep.equal({
      'FakeProject/FakeOrganization': {lastRun: 1, updatedAt: '2025-01-01T12:00:00.000Z'},
    })
  })

  it('write', async () => {
    td.when(fsDouble.readFile(store.filePath, {encoding: 'utf8'})).thenResolve(`{
  "FakeProject/FakeOrganization": {
    "lastRun": 1,
    "updatedAt":"2025-01-01T12:00:00.000Z"
  }
}`)
    const lastRun = await store.write({
      'FakeProject/FakeOrganization': {lastRun: 2, updatedAt: new Date('2025-01-02T12:00:00.000Z')},
    })
    expect(lastRun).to.be.deep.equal({
      'FakeProject/FakeOrganization': {lastRun: 2, updatedAt: new Date('2025-01-02T12:00:00.000Z')},
    })
    td.verify(
      fsDouble.writeFile(
        path.join(process.cwd(), '.magicpod_analyzer', 'last_run', 'magicpod.json'),
        `{
  "FakeProject/FakeOrganization": {
    "lastRun": 2,
    "updatedAt": "2025-01-02T12:00:00.000Z"
  }
}`,
      ),
    )
  })
})
