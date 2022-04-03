import {Command, Flags} from '@oclif/core'
import {MagicPodClient} from '../magicpod-client'
import {MagicPodAnalyzer} from '../magicpod-analyzer'
import {LocalExporter} from '../local-exporter'

export default class GetBatchRuns extends Command {
  static description = 'Retrieve specified project\'s batch run data from MagicPod.'

  static examples = [
    '<%= config.bin %> <%= command.id %> MyOrganization/MyProject',
  ]

  static args = [
    {name: 'project', description: 'organizationName/projectName', required: true},
  ]

  static flags = {
    token: Flags.string({description: 'Access token for MagicPod API. You can also set this value via environment variable `MAGICPOD_TOKEN`', env: 'MAGICPOD_TOKEN', required: true}),
    minBatchRunNumber: Flags.string({description: 'The specified count of records ending with (and larger than or equals to) this minimum batch run number is retrieved.'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(GetBatchRuns)

    const [organizationName, projectName] = args.project.split('/')

    if (organizationName && projectName) {
      this.log(`Retrieve batch run data from ${organizationName}/${projectName}`)

      // retrieve
      const client = new MagicPodClient(flags.token ?? '')
      const minBatchRunNumber = flags.minBatchRunNumber ? Number.parseInt(flags.minBatchRunNumber, 10) : undefined
      const data = await client.getBatchRuns(organizationName, projectName, minBatchRunNumber)

      // convert
      const analyzer = new MagicPodAnalyzer()
      const report = await analyzer.createTestReports(data)

      // export
      const exporter = new LocalExporter()
      const outputPath = await exporter.exportTestReports(report)
      this.log(`Export test reports to ${outputPath}`)
      this.exit()
    } else {
      this.error('You must set project (organizationName/projectName)', {exit: 1})
    }
  }
}
