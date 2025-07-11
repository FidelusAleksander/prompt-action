# Prompt Action :robot:

[![Run Tests](https://github.com/FidelusAleksander/prompt-action/actions/workflows/test-action.yml/badge.svg)](https://github.com/FidelusAleksander/prompt-action/actions/workflows/test-action.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/FidelusAleksander/prompt-action)](https://github.com/FidelusAleksander/prompt-action/releases)

A GitHub Action that lets you Prompt AI directly in your workflows.

- [Prompt Action :robot:](#prompt-action-robot)
  - [Usage examples 🚀](#usage-examples-)
    - [Simple prompting](#simple-prompting)
    - [Structured Outputs](#structured-outputs)
    - [Use variables in Prompts 🔧](#use-variables-in-prompts-)
  - [Permissions 🔒](#permissions-)
  - [Inputs ⚙️](#inputs-️)
  - [Outputs 📤](#outputs-)

## Usage examples 🚀

### Simple prompting

```yaml
- uses: FidelusAleksander/prompt-action@v1
  with:
    prompt: 'What is the meaning of life?'
```

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
    response-schema-file: path/to/your-schema.json
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

### Use variables in Prompts 🔧

You can create dynamic prompts using [Nunjucks](https://mozilla.github.io/nunjucks/) templating and YAML variables with the usage of the `vars` parameter.

```yaml
- uses: FidelusAleksander/prompt-action@v1
  with:
    system-prompt: |
      You are a {{ language }} expert translator. 
      You will be provided with text to translate to {{ language }}.
      Respond with nothing but the translated text.

      Don't translate the following: {{ never-translate | join(', ') }}

    prompt-file: README.md
    vars: |
      language: Spanish
      never-translate:
        - code blocks
        - markdown headers
        - image alt text
```

> **Note**: Variables can be used for both `prompt`/`prompt-file` and
`system-prompt`/`system-prompt-file` inputs.

## Permissions 🔒

This actions requires at minimum the following permissions set.

```yaml
permissions:
  contents: read
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
| `vars`                 | YAML-formatted variables for [NunJucks](https://mozilla.github.io/nunjucks/) variable substitution in prompts                | No       | -                              |

\* Either `prompt` or `prompt-file` must be provided

## Outputs 📤

| Output | Description                      |
| ------ | -------------------------------- |
| `text` | The AI's response to your prompt |
