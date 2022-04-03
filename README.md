magicpod-analyzer
================

Export MagicPod test data for analyzing. Inspired by [CIAnalyzer](https://github.com/Kesin11/CIAnalyzer).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/magicpod-analyzer.svg)](https://npmjs.org/package/magicpod-analyzer)
[![CircleCI](https://circleci.com/gh/takeya0x86/magicpod-analyzer/tree/main.svg?style=shield)](https://circleci.com/gh/takeya0x86/magicpod-analyzer/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/magicpod-analyzer.svg)](https://npmjs.org/package/magicpod-analyzer)
[![License](https://img.shields.io/npm/l/magicpod-analyzer.svg)](https://github.com/takeya0x86/magicpod-analyzer/blob/main/package.json)

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
magicpod-analyzer/0.0.0 darwin-x64 node-v16.13.0
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
  $ magicpod-analyzer get-batch-runs [PROJECT] --token <value> [--minBatchRunNumber <value>]

ARGUMENTS
  PROJECT  organizationName/projectName

FLAGS
  --minBatchRunNumber=<value>  The specified count of records ending with (and larger than or equals to) this minimum batch run number is retrieved.
  --token=<value>              (required) Access token for MagicPod API. You can also set this value via environment variable `MAGICPOD_TOKEN`

DESCRIPTION
  Retrieve specified project's batch run data from MagicPod.

EXAMPLES
  $ magicpod-analyzer get-batch-runs MyOrganization/MyProject
```

## `magicpod-analyzer help [COMMAND]`

Display help for magicpod-analyzer.

```
USAGE
  $ magicpod-analyzer help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for magicpod-analyzer.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_
