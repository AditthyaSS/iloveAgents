export interface MLDebuggerInputs {
  errorMessage: string;
  codeSnippet?: string;
  framework?: string;
}

export const mlProjectDebuggerAgent = {
  id: "ml-project-debugger",
  name: "ML Project Debugger",
  category: "Debugging & Diagnostics",
  description: "Diagnoses machine learning pipeline errors, data leakage, and training bottlenecks.",
  version: "1.0.0",
  inputs: [
    { name: "errorMessage", type: "string", required: true, description: "Traceback or error message" },
    { name: "codeSnippet", type: "string", required: false, description: "Relevant Python / ML code" },
    { name: "framework", type: "string", required: false, description: "ML framework (PyTorch, TensorFlow, Scikit-Learn)" }
  ],
  run: async (inputs: MLDebuggerInputs | string) => {
    const errorText = typeof inputs === "string" ? inputs : inputs.errorMessage || "";
    const code = typeof inputs === "object" && inputs.codeSnippet ? `\nCode:\n${inputs.codeSnippet}` : "";
    const framework = typeof inputs === "object" && inputs.framework ? ` (${inputs.framework})` : "";

    return `### ML Error Analysis${framework}
**Detected Issue**: Analyzing provided traceback and execution context.

#### Likely Root Cause
${errorText ? `The error "${errorText}" usually occurs due to shape mismatch, data type inconsistency, or unhandled null values during tensor conversion.` : "No explicit traceback provided."}

#### Recommended Fix Steps
1. Verify batch dimensions and tensor shapes before passing data to the model.
2. Check dataset splitting logic to prevent data leakage between train/test splits.
3. Validate feature scaling and null value handling in pre-processing pipelines.

#### Prevention Tips
- Add runtime shape assertions using \`assert tensor.shape == expected_shape\`.
- Use logging hooks during forward passes to isolate tensor dimension mismatches early.
${code}`;
  }
};

export default mlProjectDebuggerAgent;
