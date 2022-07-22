magicpod-analyzer
=================

MagicPodのテスト実行データを分析用に出力します. [CIAnalyzer](https://github.com/Kesin11/CIAnalyzer)を参考にしています。

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/magicpod-analyzer.svg)](https://npmjs.org/package/magicpod-analyzer)
[![CircleCI](https://circleci.com/gh/takeya0x86/magicpod-analyzer/tree/main.svg?style=shield)](https://circleci.com/gh/takeya0x86/magicpod-analyzer/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/magicpod-analyzer.svg)](https://npmjs.org/package/magicpod-analyzer)
[![License](https://img.shields.io/npm/l/magicpod-analyzer.svg)](https://github.com/takeya0x86/magicpod-analyzer/blob/main/package.json)

<!-- toc -->
* [使い方](#usage)
* [コマンド](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g magicpod-analyzer
$ magicpod-analyzer COMMAND
running command...
$ magicpod-analyzer (--version)
magicpod-analyzer/0.2.0 darwin-x64 node-v16.13.0
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

特定のプロジェクトの一括実行データを取得する

```
USAGE
  $ magicpod-analyzer get-batch-runs --token <value> [-c <value>]

FLAGS
  -c, --config=<value>  Config file default: magicpod_analyzer.yaml
  --token=<value>       (required) Access token for MagicPod API. You can also set this value via environment variable
                        `MAGICPOD_TOKEN`

DESCRIPTION
  Retrieve specified project's batch run data from MagicPod.

EXAMPLES
  $ magicpod-analyzer get-batch-runs
```

_See code: [dist/commands/get-batch-runs.ts](https://github.com/takeya0x86/magicpod-analyzer/blob/v0.2.0/dist/commands/get-batch-runs.ts)_

## `magicpod-analyzer help [COMMAND]`

magicpod-analyzerのヘルプを表示する

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_
<!-- commandsstop -->

## 概要と仕組み

MagicPodのAPIからテストの実行結果を取得してフォーマットした後に出力します。

出力先はローカルファイルとGoogle BigQueryへのエクスポートを選択できます。最後に取得したテストの実行番号を記録しておき、次回の実行時にはそれ以降の差分のみを取得します。実行番号の記録先はローカルファイルとGoogle Cloud Storageを選択できます。

## ローカル出力での使い方

### 設定ファイル

設定ファイルはYAML形式のファイルで用意します。

```yaml
magicpod:
  projects:
    - MyOrganization/MyProjectOne  # MagicPodの「組織名」と「プロジェクト名」を指定
    - MyOrganization/MyProjectTwo
  exporter:
    local:
      outDir: ./output # デフォルト: output 出力先フォルダ
      format: json # デフォルト: json 'json'と'json_lines'形式をサポート
  lastRunStore:
    backend: local 
    path: .magicpod_analyzer/last_run/magicpod.json # デフォルト: .magicpod_analyzer/last_run/magicpod.json
```

`exporter` はファイルの出力先と形式を指定します。`lastRunStore` は最終取得した番号の記録先を指定します。

### コマンド実行

`<MagicPodToken>` はMagicPodのユーザーページから取得したAPIトークンに置き換えてください

```
magicpod-analyzer get-batch-runs -c magicpod_analyzer.yaml --token=<MagicPodToken>
```

### 出力ファイル

以下ようなの形式のファイルが出力されます。ファイル形式はCIAnalyzerのTest Reportと同一にしてあります。

```json
[
  {
    "workflowId": "MyOrganization/MyProjectOne-CI実行",
    "workflowRunId": "MyOrganization/MyProjectOne-CI実行-1000",
    "buildNumber": 1000,
    "workflowName": "CI実行",
    "createdAt": "2022-07-20T08:22:50.000Z",
    "branch": "",
    "service": "magicpod",
    "testSuites": {
      "name": "CI実行",
      "tests": 2,
      "failures": 0,
      "time": 1058,
      "testsuite": [
        {
          "name": "CI実行",
          "errors": 0,
          "failures": 0,
          "skipped": 0,
          "timestamp": "2022-07-20T08:22:50.000Z",
          "time": 1058,
          "tests": 2,
          "testcase": [
            {
              "classname": "No.1",
              "name": "No.1",
              "time": 53,
              "successCount": 1,
              "status": "SUCCESS"
            },
            {
              "classname": "No.2",
              "name": "No.2",
              "time": 40,
              "successCount": 1,
              "status": "SUCCESS"
            },
          ]
        }
      ]
    },
    "status": "SUCCESS",
    "successCount": 1
  }
]
```

## BigQueryエクスポートでの実行

データをBigQueryにエクスポートし、継続的に実行する方法を解説します。

BigQueryエクスポートの場合Google Cloud Platformの以下の準備が必要になります。

- BigQuery
- Cloud Storage

また、継続実行のためにはCIサーバやcronなどのツールが必要になります。

### BigQuery

リポジトリの `bigquery_schema` ディレクトリにスキーマファイルが用意してあります。

以下が作成のサンプルコマンドです。データセット名やテーブル名は任意の値に置き換えてください。

```
ファイルのダウンロード
git clone https://github.com/takeya0x86/magicpod-analyzer.git
cd magicpod-analyzer

# データセット作成
bq mk
  --project_id=<GCP_PROJECT_ID> \
  --location=<LOCATION> \
  --dataset \
  <DATASET>

# テーブル作成
bq mk
  --project_id=<GCP_PROJECT_ID> \
  --location=<LOCATION> \
  --table \
  --time_partitioning_field=createdAt \
  <DATASET>.<TEST_REPORT_TABLE> \
  ./bigquery_schema/test_report.json
```

### Cloud Storage

最終実行時のビルド番号を保存するバケットを作成します。バケット名は任意の値に置き換えてください。

```
gsutil mb -b on -l <LOCATION> gs://<BUCKET_NAME>
```

### 設定ファイル

先ほど作成したBigQueryとCloud Storageで設定したテーブル名などを設定ファイルにも指定してください。

```yaml
magicpod:
  projects:
    - MyOrganization/MyProjectOne
    - MyOrganization/MyProjectTwo
  exporter:
    bigquery:
      project: <GCP_PROJECT_ID>
      dataset: <DATASET>
      reports:
        - name: test_report
          table: <TEST_REPORT_TABLE>
  lastRunStore:
    backend: gcs
    project: <GCP_PROJECT_ID>
    bucket: <BUCKET_NAME>
```

### 実行

以下の認証情報が必要になります。

- MagicPodトークン（MagicPodのWebページより取得）
- GCPサービスアカウント（GCPのページより作成しjsonファイルをダウンロード）

MagicPodトークンは環境変数 `MAGICPOD_TOKEN` に設定してください。
GCPサービスアカウントは環境変数 `GOOGLE_APPLICATION_CREDENTIALS` にダウンロードしたファイルのパスを指定してください。

```
magicpod-analyzer get-batch-runs -c magicpod_analyzer.yaml
```

前述の環境変数と上記のコマンドをCIツールなどに設定してください。

### ダッシュボード作成

magicpod-analyzer単体ではダッシュボードの表示機能は提供しません。

データを蓄積したBigQueryを[Google Data Studio](https://marketingplatform.google.com/intl/ja/about/data-studio/)や[Redash](https://redash.io/)などに接続してグラフや表を作成してください。
