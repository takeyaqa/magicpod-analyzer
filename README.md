magicpod-analyzer
=================

Export MagicPod test data for analyzing. Inspired by [CIAnalyzer](https://github.com/Kesin11/CIAnalyzer).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/magicpod-analyzer.svg)](https://npmjs.org/package/magicpod-analyzer)
[![Downloads/week](https://img.shields.io/npm/dw/magicpod-analyzer.svg)](https://npmjs.org/package/magicpod-analyzer)

[日本語版はこちら](./README.ja.md)

> [!IMPORTANT]
> This project is now in Maintenance Mode. No new features will be added, but we will address critical bug fixes and update dependencies as needed. 
> For users seeking more actively developed solutions, we recommend exploring similar tools that may better meet your requirements. Thank you for your understanding and continued support.

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
magicpod-analyzer/0.9.3 linux-arm64 node-v22.14.0
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
  $ magicpod-analyzer get-batch-runs -t <value> [-c <value>] [-d]

FLAGS
  -c, --config=<value>  Config file default: magicpod_analyzer.yaml
  -d, --debug           Enable debug mode. You can also set this value via environment variable
                        `MAGICPOD_ANALYZER_DEBUG`
  -t, --token=<value>   (required) Access token for MagicPod API. You can also set this value via environment variable
                        `MAGICPOD_TOKEN`

DESCRIPTION
  Retrieve specified project's batch run data from MagicPod.

EXAMPLES
  $ magicpod-analyzer get-batch-runs
```

_See code: [src/commands/get-batch-runs.ts](https://github.com/takeyaqa/magicpod-analyzer/blob/v0.9.3/src/commands/get-batch-runs.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.27/src/commands/help.ts)_
<!-- commandsstop -->
