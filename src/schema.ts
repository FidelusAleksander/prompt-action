import Ajv from "ajv";
import addFormats from "ajv-formats";
import * as fs from "fs";

const ajv = new Ajv({ 
  allErrors: true, 
  verbose: true,
  strict: false // Allow additional properties for flexibility
});

// Add common formats (email, date, uri, etc.)
addFormats(ajv);

export interface SchemaValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validates a JSON schema itself
 */
export function validateSchema(schema: any): SchemaValidationResult {
  try {
    // Try to compile the schema - this will throw if invalid
    ajv.compile(schema);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * Validates data against a JSON schema
 */
export function validateDataAgainstSchema(data: any, schema: any): SchemaValidationResult {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    if (!valid) {
      const errors = validate.errors?.map(err => 
        `${err.instancePath || 'root'}: ${err.message}`
      ) || ['Unknown validation error'];
      return { valid: false, errors };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * Loads and validates a schema from a file
 */
export function loadSchemaFromFile(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Schema file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in schema file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parses inline schema string
 */
export function parseInlineSchema(schemaString: string): any {
  try {
    return JSON.parse(schemaString);
  } catch (error) {
    throw new Error(`Invalid JSON in inline schema: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates schema instructions for the AI prompt
 */
export function generateSchemaInstructions(schema: any): string {
  const schemaString = JSON.stringify(schema, null, 2);
  
  return `Please respond with valid JSON that matches the following schema:

${schemaString}

Important:
- Return only valid JSON, no additional text
- Ensure all required fields are included
- Follow the exact property names and types specified
- Use null for optional fields that cannot be determined`;
}