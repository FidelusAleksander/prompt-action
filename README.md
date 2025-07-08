# Prompt Action :robot:

[![Run Tests](https://github.com/FidelusAleksander/prompt-action/actions/workflows/test-action.yml/badge.svg)](https://github.com/FidelusAleksander/prompt-action/actions/workflows/test-action.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/FidelusAleksander/prompt-action)](https://github.com/FidelusAleksander/prompt-action/releases)

A GitHub Action that lets you Prompt AI directly in your workflows.

- [Prompt Action :robot:](#prompt-action-robot)
  - [Usage 🚀](#usage-)
    - [Provide prompt directly](#provide-prompt-directly)
    - [Load a prompt from a file](#load-a-prompt-from-a-file)
    - [Add a system prompt](#add-a-system-prompt)
    - [Structured Outputs](#structured-outputs)
  - [Permissions 🔒](#permissions-)
  - [Inputs ⚙️](#inputs-️)
  - [Outputs 📤](#outputs-)
  - [Cool examples 🎮](#cool-examples-)
    - [Respond to Issues](#respond-to-issues)
    - [Automatically format PR titles to conventional commits](#automatically-format-pr-titles-to-conventional-commits)

## Usage 🚀

### Provide prompt directly

```yaml
- uses: FidelusAleksander/prompt-action@v1
  with:
    prompt: 'What is the meaning of life?'
```

### Load a prompt from a file

```yaml
- uses: FidelusAleksander/prompt-action@v1
  with:
    prompt-file: .github/prompts/my-prompt.md
```

### Add a system prompt

```yaml
- uses: FidelusAleksander/prompt-action@v1
  with:
    system-prompt: 'Youa are Gilfoyle from Silicon Valley.'
    prompt: 'Tell me about your latest project.'
```

### Structured Outputs

You can ensure the model returns data in a specific format by providing a
[JSON Schema](https://json-schema.org/implementers/interfaces).

```yaml
- uses: FidelusAleksander/prompt-action@v1
  id: prompt
  with:
    prompt: |
      Will humanity reach Mars by 2035?
    response-schema-file: .github/schemas/simple-response.json
- name: Use the output
  run: |
    echo "Response: ${{ fromJSON(steps.prompt.outputs.text).response }}"
    echo "Confidence: ${{ fromJSON(steps.prompt.outputs.text).confidence }}"
    echo "Tags: ${{ fromJSON(steps.prompt.outputs.text).tags }}"
```

<details><summary>Example schema</code></summary>

```json
{
  "type": "object",
  "properties": {
    "response": {
      "type": "string",
      "description": "The main response text"
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Confidence level from 0 to 1"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Relevant tags or categories"
    }
  },
  "required": ["response", "confidence", "tags"],
  "additionalProperties": false
}
```

</details>

## Permissions 🔒

This actions requires at minimum the following permissions set.

```yaml
permissions:
  models: read
```

## Inputs ⚙️

| Input                  | Description                                                                                                                  | Required | Default                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ |
| `prompt`               | Text that will be used as user prompt                                                                                        | No\*     | -                              |
| `prompt-file`          | Path to a file containing the user prompt                                                                                    | No\*     | -                              |
| `token`                | Personal access token                                                                                                        | No       | `${{ github.token }}`          |
| `model`                | The AI model to use. See [available models](https://github.com/marketplace?type=models)                                      | No       | `gpt-4o`                       |
| `system-prompt`        | Text that will be used as system prompt                                                                                      | No       | "You are a helpful assistant." |
| `system-prompt-file`   | Path to a file containing the system prompt                                                                                  | No       | -                              |
| `response-schema-file` | Path to a file containing the response [JSON Schema](https://json-schema.org/implementers/interfaces) for structured outputs | No       | -                              |

\* Either `prompt` or `prompt-file` must be provided

## Outputs 📤

| Output | Description                      |
| ------ | -------------------------------- |
| `text` | The AI's response to your prompt |

## Cool examples 🎮

Have you come up with a clever use of this action? Open a PR to showcase it here
for the world to see!

### Respond to Issues

Respond to opened issues for extra information

```yaml
name: AI Issue Responder
on:
  issues:
    types: [opened]

permissions:
  issues: write
  models: read

jobs:
  respond-to-issue:
    runs-on: ubuntu-latest
    steps:
      - name: Prompt AI
        id: prompt
        uses: FidelusAleksander/prompt-action@v1
        with:
          model: gpt-4o
          prompt: |
            Respond to a GitHub issue.

            Follow these guidelines:
            1. Thank the user for opening the issue
            2. Determine the issue type:
                - If it's a bug report, ask for any missing information (steps to reproduce, expected vs actual behavior, environment details)
                - If it's a feature request, acknowledge the idea's value and ask for use cases if none were provided
            3. Sign of as "AI Assistant"

            Issue Details:
            AUTHOR: ${{ github.event.issue.user.login }}
            TITLE: ${{ github.event.issue.title }}
            DESCRIPTION: ${{ github.event.issue.body }}

      - name: Comment on issue
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: ${{ github.event.issue.number }}
          body: |
            ## 👋 Hello there!

            ${{ steps.prompt.outputs.text }}

            _This is an automated response from our AI assistant. A human maintainer will review your issue soon._
```

### Automatically format PR titles to conventional commits

This action can help enforce conventional commit styling on PR titles.

Ideas for follow up step:

- comment on the PR with the suggested PR title
- update the PR title

```yaml
name: Update PR Title

on:
  pull_request:
    types: [opened]

permissions:
  models: read

jobs:
  update-pr-title:
    runs-on: ubuntu-latest
    steps:
      - name: Prompt
        uses: FidelusAleksander/prompt-action@v1
        with:
          prompt: |
            Modify this PR title to match conventional commit styling:

            ${{ github.event.pull_request.title }}
```
