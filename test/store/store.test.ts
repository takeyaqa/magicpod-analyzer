import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {Logger} from 'tslog'

import {LastRunStoreConfig} from '../../src/magicpod-config'
import {GcsStore} from '../../src/store/gcs-store'
import {LocalStore} from '../../src/store/local-store'
import {NullStore} from '../../src/store/null-store'
import {LastRunStore} from '../../src/store/store'

chai.use(chaiAsPromised)

const {expect} = chai

const GCS_FOR_TEST = process.env.GITHUB_ACTIONS ? 'https://localhost:4443' : 'http://localhost:4443'

describe('store', () => {
  it('initialize', async () => {
    let config = {backend: 'local', filePath: 'test.json'} as LastRunStoreConfig
    const nullStore = await LastRunStore.init(new Logger(), config, true)
    expect(nullStore.store).to.be.instanceOf(NullStore)
    const localStore = await LastRunStore.init(new Logger(), config)
    expect(localStore.store).to.be.instanceOf(LocalStore)
    config = {backend: 'gcs', project: 'fake-project', bucket: 'fake-bucket', path: 'test.json'} as LastRunStoreConfig
    const gcsStore = await LastRunStore.init(new Logger(), config, false, GCS_FOR_TEST)
    expect(gcsStore.store).to.be.instanceOf(GcsStore)
  })
})
