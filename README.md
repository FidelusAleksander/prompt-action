# Prompt Action :robot:

[![Run Tests](https://github.com/FidelusAleksander/prompt-action/actions/workflows/test-action.yml/badge.svg)](https://github.com/FidelusAleksander/prompt-action/actions/workflows/test-action.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/FidelusAleksander/prompt-action)](https://github.com/FidelusAleksander/prompt-action/releases)

A GitHub Action that lets you Prompt AI directly in your workflows.

- [Prompt Action :robot:](#prompt-action-robot)
  - [Basic Usage 🚀](#basic-usage-)
    - [Provide prompt directly](#provide-prompt-directly)
    - [Load a prompt from a file](#load-a-prompt-from-a-file)
  - [Permissions 🔒](#permissions-)
  - [Inputs ⚙️](#inputs-️)
  - [Outputs 📤](#outputs-)
  - [Cool examples 🎮](#cool-examples-)
    - [Respond to Issues](#respond-to-issues)
    - [Automatically format PR titles to conventional commits](#automatically-format-pr-titles-to-conventional-commits)

## Basic Usage 🚀

### Provide prompt directly

```yaml
- uses: FidelusAleksander/prompt-action@v1
  with:
    prompt: "What is the meaning of life?"
```

### Load a prompt from a file

```yaml
- uses: FidelusAleksander/prompt-action@v1
  with:
    prompt-file: .github/prompts/my-prompt.md
```

## Permissions 🔒

This actions requires at minimum the following permissions set.

```
permissions:
  models: read
```

## Inputs ⚙️

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `prompt` | The text prompt to send to the AI | No* | - |
| `prompt-file` | Path to a file containing the prompt | No* | - |
| `token` | Personal access token | No | `${{ github.token }}` |
| `model` | The AI model to use. See [available models](https://github.com/marketplace?type=models) | No | `gpt-4o` |
| `response-schema` | JSON schema to constrain the AI response format (inline) | No | - |
| `response-schema-file` | Path to a file containing JSON schema to constrain the AI response format | No | - |

\* Either `prompt` or `prompt-file` must be provided  
\** When both `response-schema` and `response-schema-file` are provided, `response-schema-file` takes precedence

## Outputs 📤

| Output | Description |
|--------|-------------|
| `text` | The AI's response to your prompt |

## Cool examples 🎮

Have you come up with a clever use of this action? Open a PR to showcase it here for the world to see!

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

### Structured Output with Response Schema

Extract issue metadata with structured JSON response:

```yaml
- name: Extract issue metadata
  id: extract
  uses: FidelusAleksander/prompt-action@v1
  with:
    prompt: |
      Analyze this GitHub issue and extract key information:
      {{ issue_body }}
    response-schema: |
      {
        "type": "object",
        "properties": {
          "category": {
            "type": "string",
            "enum": ["bug", "feature", "question", "documentation"]
          },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high", "critical"]
          },
          "estimated_effort": {
            "type": "string",
            "enum": ["small", "medium", "large"]
          },
          "labels": {
            "type": "array",
            "items": {"type": "string"}
          },
          "summary": {
            "type": "string",
            "maxLength": 200
          }
        },
        "required": ["category", "priority", "summary"]
      }
    vars: |
      issue_body: ${{ github.event.issue.body }}

- name: Use structured output
  run: |
    echo "Category: ${{ fromJson(steps.extract.outputs.text).category }}"
    echo "Priority: ${{ fromJson(steps.extract.outputs.text).priority }}"
    echo "Summary: ${{ fromJson(steps.extract.outputs.text).summary }}"
```

### Code Analysis with Schema File

Create a schema file `.github/schemas/code-analysis.json`:

```json
{
  "type": "object",
  "properties": {
    "security_issues": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
          "description": {"type": "string"},
          "line_number": {"type": "number"},
          "recommendation": {"type": "string"}
        },
        "required": ["severity", "description", "recommendation"]
      }
    },
    "performance_suggestions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {"type": "string"},
          "description": {"type": "string"},
          "impact": {"type": "string", "enum": ["low", "medium", "high"]}
        }
      }
    },
    "overall_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 10
    },
    "summary": {"type": "string"}
  },
  "required": ["security_issues", "overall_score", "summary"]
}
```

Then use it in your workflow:

```yaml
- name: Analyze code security
  id: analyze
  uses: FidelusAleksander/prompt-action@v1
  with:
    prompt: |
      Analyze the following code for security vulnerabilities and performance issues:
      
      ```{{ language }}
      {{ code }}
      ```
    response-schema-file: .github/schemas/code-analysis.json
    vars: |
      language: javascript
      code: ${{ steps.get-code.outputs.content }}

- name: Process analysis results
  run: |
    ANALYSIS='${{ steps.analyze.outputs.text }}'
    echo "Overall Score: $(echo $ANALYSIS | jq '.overall_score')"
    echo "Security Issues: $(echo $ANALYSIS | jq '.security_issues | length')"
    
    # Create GitHub issue if critical security issues found
    CRITICAL_COUNT=$(echo $ANALYSIS | jq '[.security_issues[] | select(.severity == "critical")] | length')
    if [ "$CRITICAL_COUNT" -gt 0 ]; then
      echo "::warning::Found $CRITICAL_COUNT critical security issues"
    fi
```

### Contact Information Extraction

Extract structured contact information from text:

```yaml
- name: Extract contact information
  id: extract-contacts
  uses: FidelusAleksander/prompt-action@v1
  with:
    prompt: |
      Extract contact information from the following text:
      {{ text_content }}
    response-schema: |
      {
        "type": "object",
        "properties": {
          "contacts": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {"type": "string"},
                "email": {"type": "string", "format": "email"},
                "phone": {"type": "string"},
                "company": {"type": "string"},
                "role": {"type": "string"}
              },
              "required": ["name"]
            }
          },
          "confidence_score": {
            "type": "number",
            "minimum": 0,
            "maximum": 1
          }
        },
        "required": ["contacts", "confidence_score"]
      }
    vars: |
      text_content: ${{ steps.get-text.outputs.content }}

- name: Process contacts
  run: |
    CONTACTS='${{ steps.extract-contacts.outputs.text }}'
    echo "Found $(echo $CONTACTS | jq '.contacts | length') contacts"
    echo "Confidence: $(echo $CONTACTS | jq '.confidence_score')"
```

## Schema Validation 🔍

When using structured output:

- The action validates your JSON schema before sending it to the AI
- AI responses are validated against the schema (warnings are issued for non-compliant responses)
- The action supports JSON Schema Draft 7+ including common formats (email, date, uri, etc.)
- Schema files take precedence over inline schemas when both are provided
- The original response is always returned, even if it doesn't match the schema

## Benefits of Structured Output 🎯

- **Reliable parsing**: Structured output can be reliably parsed with `fromJson()`
- **Type safety**: Schema validation ensures expected data structure
- **Automation-friendly**: Enables complex workflow automation based on AI analysis
- **Consistent output**: Reduces variability in AI responses
- **Error reduction**: Prevents downstream workflow failures due to unexpected formats
