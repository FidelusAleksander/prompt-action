# Prompt Action :robot:

[![Run Tests](https://github.com/FidelusAleksander/prompt-action/actions/workflows/test-action.yml/badge.svg)](https://github.com/FidelusAleksander/prompt-action/actions/workflows/test-action.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/FidelusAleksander/prompt-action)](https://github.com/FidelusAleksander/prompt-action/releases)

A GitHub Action that lets you Prompt AI directly in your workflows.

- [Prompt Action :robot:](#prompt-action-robot)
  - [Basic Usage 🚀](#basic-usage-)
    - [Provide prompt directly](#provide-prompt-directly)
    - [Load a prompt from a file](#load-a-prompt-from-a-file)
    - [Get structured outputs (JSON)](#get-structured-outputs-json)
  - [Permissions 🔒](#permissions-)
  - [Inputs ⚙️](#inputs-️)
  - [Outputs 📤](#outputs-)
  - [Advanced Usage 🔧](#advanced-usage-)
    - [Using system prompts with structured outputs](#using-system-prompts-with-structured-outputs)
  - [Cool examples 🎮](#cool-examples-)
    - [Respond to Issues](#respond-to-issues)
    - [Automatically format PR titles to conventional commits](#automatically-format-pr-titles-to-conventional-commits)

## Basic Usage 🚀

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

### Get structured outputs (JSON)

Enable structured outputs by providing a JSON Schema file. This ensures
consistent, typed responses from AI models.

```yaml
- name: Get structured response
  id: ai-response
  uses: FidelusAleksander/prompt-action@v1
  with:
    prompt: 'Analyze this code and provide feedback'
    response-schema-file: '__tests__/code-analysis.json'
```

Learn more about JSON Schema syntax at
[json-schema.org](https://json-schema.org/).

The AI will respond with structured JSON matching your schema.

## Permissions 🔒

This actions requires at minimum the following permissions set.

```yaml
permissions:
  models: read
```

## Inputs ⚙️

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `prompt` | Text that will be used as user prompt | No* | - |
| `prompt-file` | Path to a file containing the user prompt | No* | - |
| `token` | Personal access token | No | `${{ github.token }}` |
| `model` | The AI model to use. See [available models](https://github.com/marketplace?type=models) | No | `gpt-4o` |
| `system-prompt` | Text that will be used as system prompt | No | "You are a helpful assistant." |
| `system-prompt-file` | Path to a file containing the system prompt | No | - |
| `response-schema-file` | Path to a file containing the response [JSON Schema](https://json-schema.org/implementers/interfaces) for structured outputs | No | - |

\* Either `prompt` or `prompt-file` must be provided

## Outputs 📤

| Output | Description                      |
| ------ | -------------------------------- |
| `text` | The AI's response to your prompt |

## Advanced Usage 🔧

### Using system prompts with structured outputs

Combine system prompts with structured outputs for specialized AI behavior:

```yaml
- name: Code review with structured output
  uses: FidelusAleksander/prompt-action@v1
  with:
    prompt: |
      Review this pull request:
      ${{ github.event.pull_request.body }}
    system-prompt: |
      You are a senior software engineer performing code reviews.
      Focus on security, performance, and maintainability.
    response-schema-file: '__tests__/code-review.json'
```

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
