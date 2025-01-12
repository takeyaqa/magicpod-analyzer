import {Logger} from 'tslog'

import {minBy} from './util'

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

const DEFAULT_COUNT = 100
const DEBUG_COUNT = 10

export class MagicPodClient {
  readonly baseUrl: string
  readonly headers: Record<string, string>
  private readonly logger: Logger
  private readonly debugMode: boolean

  constructor(token: string, logger: Logger, debugMode = false) {
    const baseUrl = process.env.MAGICPOD_EMULATOR_HOST ?? 'https://app.magicpod.com'
    this.baseUrl = `${baseUrl}/api/v1.0`
    this.headers = {
      Authorization: `Token ${token}`,
      Accept: 'application/json',
    }
    this.logger = logger.getChildLogger({name: MagicPodClient.name})
    this.debugMode = debugMode
  }

  async getBatchRuns(organizationName: string, projectName: string, minBatchRunNumber?: number): Promise<BatchRuns> {
    // Retrieve batch runs
    const originalBatchRuns = await this.retrieveBatchRuns(organizationName, projectName, minBatchRunNumber)

    // Retrieve batch run details
    return this.retrieveDetailedBatchRuns(originalBatchRuns)
  }

  private async retrieveBatchRuns(
    organizationName: string,
    projectName: string,
    minBatchRunNumber?: number,
  ): Promise<BatchRuns> {
    const query = minBatchRunNumber ? `&min_batch_run_number=${minBatchRunNumber + 1}` : ''
    const count = this.debugMode ? DEBUG_COUNT : DEFAULT_COUNT
    const path = `/${organizationName}/${projectName}/batch-runs/?count=${count}${query}`
    const response = await this.fetchWithLogging(new Request(`${this.baseUrl}${path}`, {headers: this.headers}))
    const batchRuns = (await response.json()) as BatchRuns

    // Cut running data
    const firstInprogress = minBy(
      batchRuns.batch_runs.filter((batchRun) => batchRun.status === 'running' || batchRun.status === 'unresolved'),
      (batchRun) => batchRun.batch_run_number,
    )
    if (firstInprogress) {
      // eslint-disable-next-line camelcase
      batchRuns.batch_runs = batchRuns.batch_runs.filter(
        (batchRun) => batchRun.batch_run_number < firstInprogress.batch_run_number,
      )
    }

    return batchRuns
  }

  private async retrieveDetailedBatchRuns(batchRuns: BatchRuns): Promise<BatchRuns> {
    const connections = batchRuns.batch_runs.map(async (batchRun) => {
      const path = `/${batchRuns.organization_name}/${batchRuns.project_name}/batch-run/${batchRun.batch_run_number}/`
      const response = await this.fetchWithLogging(new Request(`${this.baseUrl}${path}`, {headers: this.headers}))
      return (await response.json()) as BatchRun
    })
    const resultBatchRuns = await Promise.all(connections)

    /* eslint-disable camelcase */
    return {
      organization_name: batchRuns.organization_name,
      project_name: batchRuns.project_name,
      batch_runs: resultBatchRuns,
    }
    /* eslint-enable camelcase */
  }

  private async fetchWithLogging(request: Request): Promise<Response> {
    this.printDebugRequest(request)
    const response = await fetch(request)
    if (!response.ok) {
      const message = this.printErrorResponse(request, response)
      throw new Error(message)
    }

    return response
  }

  private printDebugRequest(request: Request): void {
    const requestUrl = new URL(request.url)
    this.logger.debug(`${request.method} ${requestUrl.pathname}${requestUrl.search}`)
    this.logger.debug('request', {
      method: request.method,
      origin: requestUrl.origin,
      path: `${requestUrl.pathname}${requestUrl.search}`,
    })
  }

  private printErrorResponse(request: Request, response: Response): string {
    const requestUrl = new URL(request.url)
    const responseUrl = new URL(response.url)
    const message = `Request failed with status code ${response.status}`
    this.logger.error({
      message,
      request: {
        method: request.method,
        origin: requestUrl.origin,
        path: `${requestUrl.pathname}${requestUrl.search}`,
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        origin: responseUrl.origin,
        path: `${responseUrl.pathname}${responseUrl.search}`,
      },
    })
    return message
  }
}
