import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import {loadConfig} from '../src/magicpod-config'

chai.use(chaiAsPromised)

const {expect} = chai

describe('magicpod-config', () => {
  it('loadConfig magicpod_analyzer_test_gcs_bigquery.yaml', async () => {
    const config = await loadConfig('./test/magicpod_analyzer_test_gcs_bigquery.yaml')
    expect(config).to.deep.equal({
      projects: [
        {
          organization: 'FakeOrganization',
          name: 'FakeProject',
          fullName: 'FakeOrganization/FakeProject',
        },
      ],
      exporter: {
        bigquery: {
          project: 'fake-project',
          dataset: 'fake-dataset',
          reports: [{name: 'test_report', table: 'test_report'}],
        },
      },
      lastRunStore: {
        backend: 'gcs',
        project: 'fake-project',
        bucket: 'fake-bucket',
      },
    })
  })

  it('loadConfig magicpod_analyzer_test_local_local.yaml', async () => {
    const config = await loadConfig('./test/magicpod_analyzer_test_local_local.yaml')
    expect(config).to.deep.equal({
      projects: [
        {
          organization: 'FakeOrganization',
          name: 'FakeProject',
          fullName: 'FakeOrganization/FakeProject',
        },
      ],
      exporter: {
        local: {
          outputDir: 'output',
        },
      },
      lastRunStore: {
        backend: 'local',
      },
    })
  })

  it('load Config not found', async () => {
    await expect(loadConfig('./test/not_found.yaml')).to.be.rejectedWith('ENOENT: no such file or directory')
  })
})
