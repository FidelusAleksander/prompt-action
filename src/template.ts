import * as yaml from 'js-yaml'
import * as nunjucks from 'nunjucks'

/**
 * Process a prompt template with the provided variables
 * @param template The template string to process
 * @param varsYaml YAML string containing template variables
 * @returns The rendered template
 */
export function processTemplate(template: string, varsYaml: string): string {
  // If no vars provided, return template as-is
  if (!varsYaml || varsYaml.trim() === '') {
    return template
  }

  let variables: Record<string, unknown>
  try {
    // Parse YAML variables
    const parsed = yaml.load(varsYaml)
    if (parsed === null || parsed === undefined) {
      variables = {}
    } else if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      variables = parsed as Record<string, unknown>
    } else {
      throw new Error('Variables must be a YAML object')
    }
  } catch (error) {
    throw new Error(
      `Invalid YAML in vars parameter: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  try {
    // Configure Nunjucks environment with safe defaults
    const env = new nunjucks.Environment(null, {
      autoescape: false, // Don't escape HTML since we're dealing with plain text prompts
      throwOnUndefined: true // Throw error for undefined variables
    })

    // Render the template
    return env.renderString(template, variables)
  } catch (error) {
    throw new Error(
      `Template rendering error: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
