import axios, {AxiosInstance} from 'axios'
import {minBy} from 'lodash'

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

const COUNT = 100

export class MagicPodClient {
  private readonly axios: AxiosInstance;

  constructor(token: string) {
    this.axios = axios.create({
      baseURL: 'https://app.magicpod.com/api/v1.0',
      headers: {
        Authorization: `Token ${token}`,
        Accept: 'application/json',
      },
    })
  }

  async getBatchRuns(organizationName: string, projectName: string, minBatchRunNumber?: number): Promise<BatchRuns> {
    // Retrieve batch runs
    const originalBatchRuns = await this.retrieveBatchRuns(organizationName, projectName, minBatchRunNumber)

    // Retrieve batch run details
    return this.retrieveDetailedBatchRuns(originalBatchRuns)
  }

  private async retrieveBatchRuns(organizationName: string, projectName: string, minBatchRunNumber?: number): Promise<BatchRuns> {
    const query = minBatchRunNumber ? `&min_batch_run_number=${minBatchRunNumber + 1}` : ''
    const res = await this.axios.get(`/${organizationName}/${projectName}/batch-runs/?count=${COUNT}${query}`)
    const batchRuns = res.data as BatchRuns

    // Cut running data
    const firstInprogress = minBy(
      batchRuns.batch_runs.filter(batchRun => batchRun.status === 'running' || batchRun.status === 'unresolved'),
      'batch_run_number',
    )
    if (firstInprogress) {
      // eslint-disable-next-line camelcase
      batchRuns.batch_runs = batchRuns.batch_runs.filter(batchRun => batchRun.batch_run_number < firstInprogress.batch_run_number)
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
