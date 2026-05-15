export default {
  id: "api-error-message-writer",
  createdAt: "2025-05-15",
  name: "API Error Message Writer",
  description:
    "Generate concise and developer friendly API error messages.",
  category: "Engineering",
  icon: "FileCode",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    errorCode:"404",
    technicalDetails:"Requested user profile could not be found",
  audience: "Frontend Developer",
  },
  inputs: [
    {
      id: "errorCode",
      label: "Error Code",
      type: "text",
      placeholder: "404",
      required: true,
    },
    {
      id: "technicalDetails",
      label: "Technical Details",
      type: "textarea",
      placeholder: "Describe the API error or technical issue",
      required: true,
    },
    {
      id: "audience",
      label: "Audience",
      type: "select",
      options: [
        "Frontend Developer",
        "Backend Developer",
        "Mobile Developer",
        "End User",
      ],
      defaultValue: "Frontend Developer",
      required: true,
    },
  ],
  systemPrompt: `You are an expert API error message writer.
  Given an error code,technical details, and audience,generate a clear,professional and developer friendly API error message.
Include:
-A user friendly error message
-A brief explanation of the cause of error
-A suggested resolution
Keep the tone professional,concise and helpful`,
 outputType: "text",
};