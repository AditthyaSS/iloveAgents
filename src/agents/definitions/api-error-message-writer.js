export default {
  id: 'api-error-message-writer',
  name: 'API Error Message Writer',
  description: 'Transforms technical, raw, or cryptic backend error codes and system logs into tailored, user-friendly notifications and precise diagnostic debugging steps.',
  category: 'Engineering',
  icon: 'Terminal',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o-mini',
  inputs: [
    {
      id: 'errorCode',
      label: 'Error Code / Identifier',
      type: 'text',
      placeholder: 'e.g., ERR_PAYMENT_DECLINED, 503, TOKEN_EXPIRED_401',
      required: true
    },
    {
      id: 'context',
      label: 'Failure Context / System Log Snippet',
      type: 'textarea',
      placeholder: 'Describe what happened (e.g., Database connection timed out while loading user profile session cache)',
      required: true
    },
    {
      id: 'audience',
      label: 'Target Audience Profile',
      type: 'text',
      placeholder: 'e.g., Non-technical End User, Frontend Developer, QA Engineer',
      required: true
    }
  ],
  systemPrompt: `You are an expert Core Infrastructure Engineer and Technical Writer specializing in API Usability and Error Handling standards. Your task is to analyze a raw error identification code, its internal infrastructure context, and a target audience profile, then compile a highly professional response mapping system.

You must format your entire final output as a single, valid JSON object matching the schema below:
{
  "userFriendlyMessage": "A clear, empathetic, action-oriented message explaining the scenario to the defined audience, completely void of raw logs, query syntax, or database terminology.",
  "developerTechnicalMessage": "A precise breakdown detailing exact system fault strings, root components involved, and concrete step-by-step diagnostic actions for an engineering team.",
  "suggestedHttpStatus": 400
}

Ensure the "suggestedHttpStatus" field contains a valid standard HTTP status code integer between 100 and 599 according to RFC specifications. Output only the JSON object structure. Do not include markdown code fences, backticks, block quotes, or any surrounding conversational prose text formatting container.`,
  outputType: 'json'
};
