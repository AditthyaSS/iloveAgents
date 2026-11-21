/**
 * Anthropic model provider configuration and fallback handler.
 */
export const anthropicProviderConfig = {
  defaultModel: "claude-3-5-sonnet-20241022",
  supportedModels: [
    "claude-3-5-sonnet-20241022",
    "claude-3-opus-20240229",
    "claude-3-haiku-20240307"
  ],
  validateModel: (modelName: string): boolean => {
    return anthropicProviderConfig.supportedModels.includes(modelName);
  }
};
