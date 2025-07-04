import * as fs from "fs";
import * as path from "path";
import {
  validateSchema,
  validateDataAgainstSchema,
  loadSchemaFromFile,
  parseInlineSchema,
  generateSchemaInstructions
} from "../src/schema";

describe("Schema utilities", () => {
  const validSchema = {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number" },
      email: { type: "string", format: "email" }
    },
    required: ["name", "age"]
  };

  const invalidSchema = {
    type: "invalid-type",
    properties: "not-an-object"
  };

  describe("validateSchema", () => {
    it("should validate a correct schema", () => {
      const result = validateSchema(validSchema);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should reject an invalid schema", () => {
      const result = validateSchema(invalidSchema);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it("should handle empty schema", () => {
      const result = validateSchema({});
      expect(result.valid).toBe(true);
    });
  });

  describe("validateDataAgainstSchema", () => {
    it("should validate data that matches schema", () => {
      const validData = {
        name: "John Doe",
        age: 30,
        email: "john@example.com"
      };
      
      const result = validateDataAgainstSchema(validData, validSchema);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should reject data that doesn't match schema", () => {
      const invalidData = {
        name: "John Doe",
        age: "thirty" // should be number
      };
      
      const result = validateDataAgainstSchema(invalidData, validSchema);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it("should reject data missing required fields", () => {
      const incompleteData = {
        name: "John Doe"
        // missing required 'age' field
      };
      
      const result = validateDataAgainstSchema(incompleteData, validSchema);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(err => err.includes("age"))).toBe(true);
    });

    it("should handle validation errors gracefully", () => {
      const result = validateDataAgainstSchema({ name: "test" }, invalidSchema);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("parseInlineSchema", () => {
    it("should parse valid JSON schema string", () => {
      const schemaString = JSON.stringify(validSchema);
      const result = parseInlineSchema(schemaString);
      expect(result).toEqual(validSchema);
    });

    it("should throw error for invalid JSON", () => {
      const invalidJson = "{ name: 'invalid' }"; // missing quotes
      expect(() => parseInlineSchema(invalidJson)).toThrow("Invalid JSON in inline schema");
    });

    it("should throw error for empty string", () => {
      expect(() => parseInlineSchema("")).toThrow("Invalid JSON in inline schema");
    });
  });

  describe("loadSchemaFromFile", () => {
    const tmpDir = "/tmp/schema-tests";
    const validSchemaFile = path.join(tmpDir, "valid-schema.json");
    const invalidSchemaFile = path.join(tmpDir, "invalid-schema.json");
    const nonExistentFile = path.join(tmpDir, "non-existent.json");

    beforeAll(() => {
      // Create temp directory and test files
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      fs.writeFileSync(validSchemaFile, JSON.stringify(validSchema, null, 2));
      fs.writeFileSync(invalidSchemaFile, "{ invalid json }");
    });

    afterAll(() => {
      // Clean up test files
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should load valid schema from file", () => {
      const result = loadSchemaFromFile(validSchemaFile);
      expect(result).toEqual(validSchema);
    });

    it("should throw error for non-existent file", () => {
      expect(() => loadSchemaFromFile(nonExistentFile)).toThrow("Schema file not found");
    });

    it("should throw error for invalid JSON file", () => {
      expect(() => loadSchemaFromFile(invalidSchemaFile)).toThrow("Invalid JSON in schema file");
    });
  });

  describe("generateSchemaInstructions", () => {
    it("should generate proper schema instructions", () => {
      const instructions = generateSchemaInstructions(validSchema);
      
      expect(instructions).toContain("Please respond with valid JSON");
      expect(instructions).toContain("Return only valid JSON, no additional text");
      expect(instructions).toContain("Ensure all required fields are included");
      expect(instructions).toContain(JSON.stringify(validSchema, null, 2));
    });

    it("should handle empty schema", () => {
      const instructions = generateSchemaInstructions({});
      expect(instructions).toContain("Please respond with valid JSON");
      expect(instructions).toContain("{}");
    });

    it("should handle complex nested schema", () => {
      const complexSchema = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              contacts: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      };
      
      const instructions = generateSchemaInstructions(complexSchema);
      expect(instructions).toContain("Please respond with valid JSON");
      expect(instructions).toContain(JSON.stringify(complexSchema, null, 2));
    });
  });
});