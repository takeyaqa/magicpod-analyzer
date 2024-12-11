magicpod-analyzer
=================

Export MagicPod test data for analyzing. Inspired by [CIAnalyzer](https://github.com/Kesin11/CIAnalyzer).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/magicpod-analyzer.svg)](https://npmjs.org/package/magicpod-analyzer)
[![Downloads/week](https://img.shields.io/npm/dw/magicpod-analyzer.svg)](https://npmjs.org/package/magicpod-analyzer)
[![License](https://img.shields.io/npm/l/magicpod-analyzer.svg)](https://github.com/takeyaqa/magicpod-analyzer/blob/main/package.json)

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
magicpod-analyzer/0.5.0 darwin-arm64 node-v18.16.0
$ magicpod-analyzer --help [COMMAND]
USAGE
  $ magicpod-analyzer COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`magicpod-analyzer get-batch-runs`](#magicpod-analyzer-get-batch-runs)
* [`magicpod-analyzer help [COMMANDS]`](#magicpod-analyzer-help-commands)

## `magicpod-analyzer get-batch-runs`

Retrieve specified project's batch run data from MagicPod.

```
USAGE
  $ magicpod-analyzer get-batch-runs --token <value> [-c <value>] [-d]

FLAGS
  -c, --config=<value>  Config file default: magicpod_analyzer.yaml
  -d, --debug           Enable debug mode. You can also set this value via environment variable
                        `MAGICPOD_ANALYZER_DEBUG`
  --token=<value>       (required) Access token for MagicPod API. You can also set this value via environment variable
                        `MAGICPOD_TOKEN`

DESCRIPTION
  Retrieve specified project's batch run data from MagicPod.

EXAMPLES
  $ magicpod-analyzer get-batch-runs
```

_See code: [dist/commands/get-batch-runs.ts](https://github.com/takeyaqa/magicpod-analyzer/blob/v0.5.0/dist/commands/get-batch-runs.ts)_

## `magicpod-analyzer help [COMMANDS]`

Display help for magicpod-analyzer.

```
USAGE
  $ magicpod-analyzer help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for magicpod-analyzer.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_
<!-- commandsstop -->
