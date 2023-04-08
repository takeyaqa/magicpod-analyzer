import {Command, Flags} from '@oclif/core'
import {Logger} from 'tslog'
import {loadConfig} from '../magicpod-config'
import {MagicPodRunner} from '../magicpod-runner'

export default class GetBatchRuns extends Command {
  static description = 'Retrieve specified project\'s batch run data from MagicPod.'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    config: Flags.string({description: 'Config file default: magicpod_analyzer.yaml', char: 'c'}),
    token: Flags.string({description: 'Access token for MagicPod API. You can also set this value via environment variable `MAGICPOD_TOKEN`', env: 'MAGICPOD_TOKEN', required: true}),
    debug: Flags.boolean({description: 'Enable debug mode. You can also set this value via environment variable `MAGICPOD_ANALYZER_DEBUG`', env: 'MAGICPOD_ANALYZER_DEBUG', char: 'd'}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(GetBatchRuns)

    const logger = new Logger({
      overwriteConsole: true,
      minLevel: flags.debug ? 'debug' : 'info',
      displayInstanceName: true,
      displayDateTime: false,
      displayFunctionName: false,
      displayFilePath: 'hidden',
    })
    const configFile = flags.config ?? 'magicpod_analyzer.yaml'

    const config = await loadConfig(configFile)
    const runner = new MagicPodRunner(logger, config, flags.token)
    const result = await runner.run()
    if (result.error) {
      this.error(result.error, {exit: 1})
    } else {
      this.exit()
    }
  }
}
