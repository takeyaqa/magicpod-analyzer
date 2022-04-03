import axios, {AxiosInstance} from 'axios'

/* eslint-disable camelcase */
type Status = 'not-running' | 'running' | 'succeeded' | 'failed' | 'aborted' | 'unresolved'

export interface BatchRuns {
  organization_name: string
  project_name: string
  batch_runs: BatchRun[]
}

interface BatchRun {
  batch_run_number: number
  test_setting_name: string
  status: Status
  started_at: string
  finished_at: string
  test_cases: TestCases
  url: string
}

interface TestCases {
  succeeded?: number
  failed?: number
  aborted?: number
  unresolved?: number
  total: number
  details: TestCaseDetail[]
}

interface TestCaseDetail {
  pattern_name?: string
  included_labels: string[]
  excluded_labels: string[]
  results: TestCaseResult[]
}

export interface TestCaseResult {
  order: number
  number?: number
  status: Status
  started_at: string
  finished_at: string
  data_patterns?: DataPattern[]
}

interface DataPattern {
  data_index: number
  status: Status
  started_at: string
  finished_at: string
}
/* eslint-enable camelcase */

export class MagicPodClient {
  private readonly axios: AxiosInstance;

  constructor(token: string) {
    this.axios = axios.create({
      baseURL: 'https://magic-pod.com/api/v1.0',
      headers: {
        Authorization: `Token ${token}`,
        Accept: 'application/json',
      },
    })
  }

  async getBatchRuns(organizationName: string, projectName: string, minBatchRunNumber = 1): Promise<BatchRuns> {
    // Retrieve batch runs
    const originalBatchRuns = await this.retrieveBatchRuns(organizationName, projectName, minBatchRunNumber)

    // Retrieve batch run details
    return this.retrieveDetailedBatchRuns(originalBatchRuns)
  }

  private async retrieveBatchRuns(organizationName: string, projectName: string, minBatchRunNumber = 1): Promise<BatchRuns> {
    const query = `?count=20&min_batch_run_number=${minBatchRunNumber}`
    const res = await this.axios.get(`/${organizationName}/${projectName}/batch-runs/${query}`)
    const batchRuns = res.data as BatchRuns

    // Reverse list to asc
    batchRuns.batch_runs.reverse()

    // Cut running data
    const lastIndex = batchRuns.batch_runs.findIndex(batchRun => batchRun.status === 'running' || batchRun.status === 'unresolved')
    if (lastIndex !== -1) {
      batchRuns.batch_runs = batchRuns.batch_runs.slice(0, lastIndex) // eslint-disable-line camelcase
    }

    return batchRuns
  }

  private async retrieveDetailedBatchRuns(batchRuns: BatchRuns): Promise<BatchRuns> {
    const connections = batchRuns.batch_runs.map(batchRun => {
      return this.axios.get(`/${batchRuns.organization_name}/${batchRuns.project_name}/batch-run/${batchRun.batch_run_number}/`)
    })
    const resultList = await Promise.all(connections)

    /* eslint-disable camelcase */
    return {
      organization_name: batchRuns.organization_name,
      project_name: batchRuns.project_name,
      batch_runs: resultList.map(res => res.data as BatchRun),
    }
    /* eslint-enable camelcase */
  }
}
