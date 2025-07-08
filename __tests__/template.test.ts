/**
 * Unit tests for the template functionality, src/template.ts
 */
import { processTemplate } from '../src/template.js'

describe('processTemplate', () => {
  describe('Basic functionality', () => {
    it('should return template as-is when no vars provided', () => {
      const template = 'Hello world'
      const result = processTemplate(template, '')
      expect(result).toBe('Hello world')
    })

    it('should return template as-is when vars is whitespace', () => {
      const template = 'Hello world'
      const result = processTemplate(template, '   \n  ')
      expect(result).toBe('Hello world')
    })

    it('should perform basic variable substitution', () => {
      const template = 'Hello {{ name }}'
      const vars = 'name: world'
      const result = processTemplate(template, vars)
      expect(result).toBe('Hello world')
    })

    it('should handle multiple variables', () => {
      const template = 'Hello {{ name }}, you are {{ age }} years old'
      const vars = `
        name: Alice
        age: 30
      `
      const result = processTemplate(template, vars)
      expect(result).toBe('Hello Alice, you are 30 years old')
    })
  })

  describe('Complex templating', () => {
    it('should handle nested objects', () => {
      const template = 'Hello {{ user.name }}, your email is {{ user.email }}'
      const vars = `
        user:
          name: Bob
          email: bob@example.com
      `
      const result = processTemplate(template, vars)
      expect(result).toBe('Hello Bob, your email is bob@example.com')
    })

    it('should handle arrays and loops', () => {
      const template = `Items:
{% for item in items %}
- {{ item }}
{% endfor %}`
      const vars = `
        items:
          - apple
          - banana
          - cherry
      `
      const result = processTemplate(template, vars)
      expect(result.trim()).toBe(`Items:

- apple

- banana

- cherry`)
    })

    it('should handle conditional logic', () => {
      const template = `{% if has_tests %}Include tests{% else %}No tests{% endif %}`
      const vars = 'has_tests: true'
      const result = processTemplate(template, vars)
      expect(result).toBe('Include tests')

      const vars2 = 'has_tests: false'
      const result2 = processTemplate(template, vars2)
      expect(result2).toBe('No tests')
    })

    it('should handle filters', () => {
      const template = '{{ name | upper }}'
      const vars = 'name: world'
      const result = processTemplate(template, vars)
      expect(result).toBe('WORLD')
    })

    it('should handle array joins', () => {
      const template = '{{ items | join(", ") }}'
      const vars = `
        items:
          - apple
          - banana
          - cherry
      `
      const result = processTemplate(template, vars)
      expect(result).toBe('apple, banana, cherry')
    })
  })

  describe('Error handling', () => {
    it('should throw error for invalid YAML', () => {
      const template = 'Hello {{ name }}'
      const invalidYaml = `
        name: "unclosed string
        age: 30
      `
      expect(() => processTemplate(template, invalidYaml)).toThrow(
        'Invalid YAML in vars parameter'
      )
    })

    it('should throw error for non-object YAML', () => {
      const template = 'Hello {{ name }}'
      const invalidVars = '- item1\n- item2'
      expect(() => processTemplate(template, invalidVars)).toThrow(
        'Variables must be a YAML object'
      )
    })

    it('should throw error for undefined variables', () => {
      const template = 'Hello {{ undefinedVar }}'
      const vars = 'name: world'
      expect(() => processTemplate(template, vars)).toThrow(
        'Template rendering error'
      )
    })

    it('should throw error for template syntax errors', () => {
      const template = 'Hello {{ name'
      const vars = 'name: world'
      expect(() => processTemplate(template, vars)).toThrow(
        'Template rendering error'
      )
    })

    it('should handle null/undefined YAML gracefully', () => {
      const template = 'Hello world'
      const result = processTemplate(template, 'null')
      expect(result).toBe('Hello world')
    })

    it('should handle empty YAML object', () => {
      const template = 'Hello world'
      const vars = '{}'
      const result = processTemplate(template, vars)
      expect(result).toBe('Hello world')
    })
  })

  describe('Real-world examples', () => {
    it('should handle GitHub workflow context example', () => {
      const template = `Generate a PR description for {{ repo_name }}.
      
Branch: {{ branch }}
Author: {{ author }}
Files changed: {{ files_count }}

Changes summary:
{{ changes }}`

      const vars = `
        repo_name: my-awesome-repo
        branch: feature/new-feature
        author: developer
        files_count: 5
        changes: Added new functionality
      `

      const result = processTemplate(template, vars)
      expect(result).toContain('my-awesome-repo')
      expect(result).toContain('feature/new-feature')
      expect(result).toContain('developer')
      expect(result).toContain('5')
      expect(result).toContain('Added new functionality')
    })

    it('should handle code review example', () => {
      const template = `You are a {{ language }} expert.
Please review for: {{ review_focus | join(', ') }}.

Code:
{{ code }}`

      const vars = `
        language: TypeScript
        review_focus:
          - performance
          - security
          - best practices
        code: "function hello() { return 'world'; }"
      `

      const result = processTemplate(template, vars)
      expect(result).toContain('TypeScript expert')
      expect(result).toContain('performance, security, best practices')
      expect(result).toContain("function hello() { return 'world'; }")
    })
  })
})
