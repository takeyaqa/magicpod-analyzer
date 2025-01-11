import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {Logger} from 'tslog'

import {NullStore} from '../../src/store/null-store'

chai.use(chaiAsPromised)

const {expect} = chai

describe('null-store', () => {
  let store: NullStore

  beforeEach(async () => {
    store = new NullStore(new Logger())
  })

  it('read', async () => {
    expect(await store.read()).to.be.empty
  })

  it('write', async () => {
    expect(await store.write({'FakeProject/FakeOrganization': {lastRun: 1, updatedAt: new Date()}})).to.be.empty
  })
})
