import {BatchRuns, TestCaseResult} from './magicpod-client.js'

export interface TestReport {
  workflowId: string
  workflowRunId: string
  buildNumber: number
  workflowName: string
  createdAt: Date
  branch: string
  service: string
  status: string
  successCount: number
  testSuites: TestSuites
}

interface TestSuites {
  name: string
  tests: number
  failures: number
  time: number
  testsuite: TestSuite[]
}

interface TestSuite {
  name: string
  errors: number
  failures: number
  skipped: number
  timestamp: Date
  time: number
  tests: number
  testcase: TestCase[]
}

interface TestCase {
  classname: string
  name: string
  time: number
  successCount: number
  status: string
}

export class MagicPodAnalyzer {
  async createTestReports(batchRuns: BatchRuns): Promise<TestReport[]> {
    const testReports: TestReport[] = []
    for (const batchRun of batchRuns.batch_runs) {
      const duration = this.calcDuration(batchRun.started_at, batchRun.finished_at)
      testReports.push({
        workflowId: `${batchRuns.organization_name}/${batchRuns.project_name}-${batchRun.test_setting_name}`,
        workflowRunId: `${batchRuns.organization_name}/${batchRuns.project_name}-${batchRun.test_setting_name}-${batchRun.batch_run_number}`,
        buildNumber: batchRun.batch_run_number,
        workflowName: batchRun.test_setting_name,
        createdAt: new Date(batchRun.started_at),
        branch: '',
        service: 'magicpod',
        testSuites: {
          name: batchRun.test_setting_name,
          tests: batchRun.test_cases.total,
          failures: batchRun.test_cases.failed ?? 0,
          time: duration,
          testsuite: [
            {
              name: batchRun.test_setting_name,
              errors: 0,
              failures: batchRun.test_cases.failed ?? 0,
              skipped: 0,
              timestamp: new Date(batchRun.started_at),
              time: duration,
              tests: batchRun.test_cases.total,
              testcase: this.convertTestCases(batchRun.test_cases.details[0].results),
            },
          ],
        },
        status: batchRun.status === 'succeeded' ? 'SUCCESS' : 'FAILURE',
        successCount: batchRun.status === 'succeeded' ? 1 : 0,
      })
    }

    return testReports
  }

  private convertTestCases(testCaseResults: TestCaseResult[]): TestCase[] {
    return testCaseResults.map((testCaseResult) => {
      const name = testCaseResult.number ? `No.${testCaseResult.number}` : 'No.'
      return {
        classname: name,
        name,
        time: this.calcDuration(testCaseResult.started_at, testCaseResult.finished_at),
        successCount: testCaseResult.status === 'succeeded' ? 1 : 0,
        status: testCaseResult.status === 'succeeded' ? 'SUCCESS' : 'FAILURE',
      }
    })
  }

  private calcDuration(startedAt: string, finishedAt: string): number {
    return (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000
  }
}
