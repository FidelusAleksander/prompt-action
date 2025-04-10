# TypeScript GitHub Action

A GitHub Action built with TypeScript.

## Usage

You can use this action in your workflow by adding the following to your `.github/workflows/main.yml` file:

```yaml
name: My Workflow
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run TypeScript Action
        uses: ./
```

## Development

1. Make changes to the TypeScript code in `src/index.ts`
2. Build the project:
   ```bash
   npm run build
   ```
3. Package the action:
   ```bash
   npm run package
   ```

## License

ISC
