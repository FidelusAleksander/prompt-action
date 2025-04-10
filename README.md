# ask-ai action

A GitHub Action that lets you ask AI questions directly in your workflows.

## Usage

You can use this action in two ways:

1. By providing a direct prompt:
```yaml
- uses: FidelusAleksander/ask-ai@main
  with:
    prompt: "What is the meaning of life?"
```

2. By loading a prompt from a file:
```yaml
- uses: FidelusAleksander/ask-ai@main
  with:
    prompt-file: .github/prompts/my-prompt.txt
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `prompt` | The text prompt to send to the AI | No* | - |
| `prompt-file` | Path to a file containing the prompt | No* | - |
| `token` | Personal access token | Yes | `${{ github.token }}` |
| `model` | The AI model to use | No | `gpt-4o` |

\* Either `prompt` or `prompt-file` must be provided

## Outputs

| Output | Description |
|--------|-------------|
| `text` | The AI's response to your prompt |

## Examples

### Using a direct prompt
```yaml
- name: Ask AI a question
  uses: FidelusAleksander/ask-ai@main
  with:
    prompt: "What are the best practices for writing GitHub Actions?"
```

### Using a prompt file
```yaml
- name: Ask AI with prompt from file
  uses: FidelusAleksander/ask-ai@main
  with:
    prompt-file: .github/prompts/code-review.txt
```

### Using both in different steps
```yaml
- name: Code review with AI
  uses: FidelusAleksander/ask-ai@main
  with:
    prompt-file: .github/prompts/code-review.txt

- name: Follow-up question
  uses: FidelusAleksander/ask-ai@main
  with:
    prompt: "Can you explain that in simpler terms?"
```
