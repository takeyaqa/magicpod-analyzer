magicpod-analyzer
=================

Export MagicPod test data for analyzing. Inspired by [CIAnalyzer](https://github.com/Kesin11/CIAnalyzer).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/takeyaqa/magicpod-analyzer/blob/main/LICENSE)

[日本語版はこちら](./README.ja.md)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g magicpod-analyzer
$ magicpod-analyzer COMMAND
running command...
$ magicpod-analyzer (--version)
magicpod-analyzer/0.6.0 linux-arm64 node-v22.12.0
$ magicpod-analyzer --help [COMMAND]
USAGE
  $ magicpod-analyzer COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`magicpod-analyzer get-batch-runs`](#magicpod-analyzer-get-batch-runs)
* [`magicpod-analyzer help [COMMAND]`](#magicpod-analyzer-help-command)

## `magicpod-analyzer get-batch-runs`

Retrieve specified project's batch run data from MagicPod.

```
USAGE
  $ magicpod-analyzer get-batch-runs --token <value> [-c <value>] [-d] [--baseUrl <value>] [--bigqueryBaseURL
    <value>] [--gcsBaseURL <value>]

FLAGS
  -c, --config=<value>           Config file default: magicpod_analyzer.yaml
  -d, --debug                    Enable debug mode. You can also set this value via environment variable
                                 `MAGICPOD_ANALYZER_DEBUG`
      --baseUrl=<value>          Base URL for MagicPod API. You can also set this value via environment variable
                                 `MAGICPOD_BASE_URL`
      --bigqueryBaseURL=<value>  Base URL for BigQuery API. You can also set this value via environment variable
                                 `BIGQUERY_BASE_URL`
      --gcsBaseURL=<value>       Base URL for GCS API. You can also set this value via environment variable
                                 `GCS_BASE_URL`
      --token=<value>            (required) Access token for MagicPod API. You can also set this value via environment
                                 variable `MAGICPOD_TOKEN`

DESCRIPTION
  Retrieve specified project's batch run data from MagicPod.

EXAMPLES
  $ magicpod-analyzer get-batch-runs
```

_See code: [src/commands/get-batch-runs.ts](https://github.com/takeyaqa/magicpod-analyzer/blob/v0.6.0/src/commands/get-batch-runs.ts)_

## `magicpod-analyzer help [COMMAND]`

Display help for magicpod-analyzer.

```
USAGE
  $ magicpod-analyzer help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for magicpod-analyzer.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.20/src/commands/help.ts)_
<!-- commandsstop -->
