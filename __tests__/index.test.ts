const mockCore = {
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  warning: jest.fn(),
};

const mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
};

const mockGenerateAIResponse = jest.fn();

jest.mock("@actions/core", () => mockCore);
jest.mock("fs", () => mockFs);
jest.mock("../src/ai", () => ({
  generateAIResponse: mockGenerateAIResponse,
}));

describe("GitHub Action", () => {
  const mockToken = "test-token";
  const mockModel = "test-model";
  const mockPrompt = "test prompt";
  const mockResponse = "test response";
  const mockSystemPrompt = "test system prompt";

  beforeEach(() => {
    jest.resetAllMocks();
    mockGenerateAIResponse.mockResolvedValue(mockResponse);
    mockCore.getInput.mockImplementation((name: string) => {
      switch (name) {
        case "token":
          return mockToken;
        case "model":
          return mockModel;
        default:
          return "";
      }
    });
  });

  it("should work with prompt input", async () => {
    mockCore.getInput.mockImplementation((name: string) => {
      switch (name) {
        case "prompt":
          return mockPrompt;
        case "system-prompt":
          return mockSystemPrompt;
        case "token":
          return mockToken;
        case "model":
          return mockModel;
        default:
          return "";
      }
    });

    await import("../src/index");

    expect(mockGenerateAIResponse).toHaveBeenCalledWith(
      mockPrompt,
      mockSystemPrompt,
      mockModel,
      mockToken,
    );
    expect(mockCore.setOutput).toHaveBeenCalledWith("text", mockResponse);
  });

  it("should work with prompt-file input", async () => {
    const promptFilePath = "test-prompt.txt";
    const fileContent = "prompt from file";

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(fileContent);
    mockCore.getInput.mockImplementation((name: string) => {
      switch (name) {
        case "prompt-file":
          return promptFilePath;
        case "system-prompt":
          return mockSystemPrompt;
        case "token":
          return mockToken;
        case "model":
          return mockModel;
        default:
          return "";
      }
    });

    await import("../src/index");

    expect(mockFs.existsSync).toHaveBeenCalledWith(promptFilePath);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(promptFilePath, "utf8");
    expect(mockGenerateAIResponse).toHaveBeenCalledWith(
      fileContent,
      mockSystemPrompt,
      mockModel,
      mockToken,
    );
    expect(mockCore.setOutput).toHaveBeenCalledWith("text", mockResponse);
  });

  it("should throw error when prompt file doesn't exist", async () => {
    const promptFilePath = "non-existent.txt";

    mockFs.existsSync.mockReturnValue(false);
    mockCore.getInput.mockImplementation((name: string) => {
      switch (name) {
        case "prompt-file":
          return promptFilePath;
        case "system-prompt":
          return mockSystemPrompt;
        case "token":
          return mockToken;
        case "model":
          return mockModel;
        default:
          return "";
      }
    });

    await import("../src/index");

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      `Prompt file not found: ${promptFilePath}`,
    );
  });

  it("should throw error when neither prompt nor prompt-file is provided", async () => {
    await import("../src/index");

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      "Either 'prompt' or 'prompt-file' input must be provided",
    );
  });

  describe("Schema functionality", () => {
    const validSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" }
      },
      required: ["name"]
    };

    const validJsonResponse = JSON.stringify({ name: "John", age: 30 });
    const invalidJsonResponse = "This is not JSON";

    it("should work with inline response schema", async () => {
      const schemaString = JSON.stringify(validSchema);
      mockGenerateAIResponse.mockResolvedValue(validJsonResponse);
      
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case "prompt":
            return mockPrompt;
          case "system-prompt":
            return mockSystemPrompt;
          case "response-schema":
            return schemaString;
          case "token":
            return mockToken;
          case "model":
            return mockModel;
          default:
            return "";
        }
      });

      await import("../src/index");

      // Check that the prompt was modified to include schema instructions
      expect(mockGenerateAIResponse).toHaveBeenCalledWith(
        expect.stringContaining("Please respond with valid JSON"),
        mockSystemPrompt,
        mockModel,
        mockToken,
      );
      expect(mockCore.setOutput).toHaveBeenCalledWith("text", validJsonResponse);
    });

    it("should work with response schema from file", async () => {
      const schemaFile = "/tmp/test-schema.json";
      mockFs.existsSync.mockImplementation((path: string) => path === schemaFile);
      mockFs.readFileSync.mockImplementation((path: string) => {
        if (path === schemaFile) {
          return JSON.stringify(validSchema);
        }
        return "";
      });
      mockGenerateAIResponse.mockResolvedValue(validJsonResponse);
      
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case "prompt":
            return mockPrompt;
          case "system-prompt":
            return mockSystemPrompt;
          case "response-schema-file":
            return schemaFile;
          case "token":
            return mockToken;
          case "model":
            return mockModel;
          default:
            return "";
        }
      });

      await import("../src/index");

      expect(mockFs.existsSync).toHaveBeenCalledWith(schemaFile);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(schemaFile, "utf8");
      expect(mockGenerateAIResponse).toHaveBeenCalledWith(
        expect.stringContaining("Please respond with valid JSON"),
        mockSystemPrompt,
        mockModel,
        mockToken,
      );
      expect(mockCore.setOutput).toHaveBeenCalledWith("text", validJsonResponse);
    });

    it("should prioritize schema file over inline schema", async () => {
      const schemaFile = "/tmp/test-schema.json";
      const inlineSchema = JSON.stringify({ type: "string" });
      
      mockFs.existsSync.mockImplementation((path: string) => path === schemaFile);
      mockFs.readFileSync.mockImplementation((path: string) => {
        if (path === schemaFile) {
          return JSON.stringify(validSchema);
        }
        return "";
      });
      mockGenerateAIResponse.mockResolvedValue(validJsonResponse);
      
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case "prompt":
            return mockPrompt;
          case "system-prompt":
            return mockSystemPrompt;
          case "response-schema":
            return inlineSchema;
          case "response-schema-file":
            return schemaFile;
          case "token":
            return mockToken;
          case "model":
            return mockModel;
          default:
            return "";
        }
      });

      await import("../src/index");

      // Should use schema from file, not inline
      expect(mockFs.readFileSync).toHaveBeenCalledWith(schemaFile, "utf8");
      expect(mockGenerateAIResponse).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(validSchema, null, 2)),
        mockSystemPrompt,
        mockModel,
        mockToken,
      );
    });

    it("should handle invalid inline schema", async () => {
      const invalidSchema = "{ invalid json }";
      
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case "prompt":
            return mockPrompt;
          case "system-prompt":
            return mockSystemPrompt;
          case "response-schema":
            return invalidSchema;
          case "token":
            return mockToken;
          case "model":
            return mockModel;
          default:
            return "";
        }
      });

      await import("../src/index");

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("Invalid JSON in inline schema")
      );
    });

    it("should handle non-existent schema file", async () => {
      const nonExistentFile = "/tmp/non-existent.json";
      mockFs.existsSync.mockReturnValue(false);
      
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case "prompt":
            return mockPrompt;
          case "system-prompt":
            return mockSystemPrompt;
          case "response-schema-file":
            return nonExistentFile;
          case "token":
            return mockToken;
          case "model":
            return mockModel;
          default:
            return "";
        }
      });

      await import("../src/index");

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        `Schema file not found: ${nonExistentFile}`
      );
    });

    it("should warn when AI response doesn't match schema", async () => {
      const schemaString = JSON.stringify(validSchema);
      const invalidResponse = JSON.stringify({ name: "John", age: "thirty" }); // age should be number
      mockGenerateAIResponse.mockResolvedValue(invalidResponse);
      
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case "prompt":
            return mockPrompt;
          case "system-prompt":
            return mockSystemPrompt;
          case "response-schema":
            return schemaString;
          case "token":
            return mockToken;
          case "model":
            return mockModel;
          default:
            return "";
        }
      });

      await import("../src/index");

      expect(mockCore.warning).toHaveBeenCalledWith(
        expect.stringContaining("AI response does not match schema")
      );
      expect(mockCore.setOutput).toHaveBeenCalledWith("text", invalidResponse);
    });

    it("should warn when AI response is not valid JSON", async () => {
      const schemaString = JSON.stringify(validSchema);
      mockGenerateAIResponse.mockResolvedValue(invalidJsonResponse);
      
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case "prompt":
            return mockPrompt;
          case "system-prompt":
            return mockSystemPrompt;
          case "response-schema":
            return schemaString;
          case "token":
            return mockToken;
          case "model":
            return mockModel;
          default:
            return "";
        }
      });

      await import("../src/index");

      expect(mockCore.warning).toHaveBeenCalledWith(
        expect.stringContaining("AI response is not valid JSON")
      );
      expect(mockCore.setOutput).toHaveBeenCalledWith("text", invalidJsonResponse);
    });

    it("should work without schema (backward compatibility)", async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case "prompt":
            return mockPrompt;
          case "system-prompt":
            return mockSystemPrompt;
          case "token":
            return mockToken;
          case "model":
            return mockModel;
          default:
            return "";
        }
      });

      await import("../src/index");

      expect(mockGenerateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
      );
      expect(mockCore.setOutput).toHaveBeenCalledWith("text", mockResponse);
      expect(mockCore.warning).not.toHaveBeenCalled();
    });
  });

  // Clear the module cache after each test
  afterEach(() => {
    jest.resetModules();
  });
});
