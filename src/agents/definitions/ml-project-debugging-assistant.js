export default {
  id: "ml-project-debugging-assistant",
  createdAt: "2026-11-11",
  name: "ML Project Debugging Assistant",
  description:
    "Identifies, diagnoses, and resolves machine learning and deep learning errors across frameworks like PyTorch, TensorFlow, Scikit-learn, and Hugging Face with clear root-cause explanations and drop-in code fixes.",
  category: "Engineering",
  icon: "Bug",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    language: "Python",
    framework: "PyTorch",
    error_message:
      "RuntimeError: The size of tensor a (64) must match the size of tensor b (128) at non-singleton dimension 1",
    code_snippet:
      "import torch\nimport torch.nn as nn\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(784, 64)\n        self.fc2 = nn.Linear(128, 10)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nx = torch.randn(32, 784)\nout = model(x)",
    goal: "Feed the output of the first linear layer into the second linear layer for a 10-class classification task.",
  },
  inputs: [
    {
      id: "language",
      label: "Programming Language",
      type: "select",
      options: ["Python", "R", "Julia", "C++"],
      defaultValue: "Python",
      required: true,
    },
    {
      id: "framework",
      label: "ML / Deep Learning Framework",
      type: "select",
      options: [
        "PyTorch",
        "TensorFlow / Keras",
        "Scikit-learn",
        "Hugging Face (Transformers / Datasets)",
        "XGBoost / LightGBM / CatBoost",
        "JAX / Flax",
        "OpenCV / Torchvision",
        "Pandas / NumPy (Data pipeline for ML)",
      ],
      defaultValue: "PyTorch",
      required: true,
    },
    {
      id: "error_message",
      label: "Error Message or Traceback",
      type: "textarea",
      placeholder:
        "Paste the exact error message, exception type, or stack trace here...\ne.g. RuntimeError: mat1 and mat2 shapes cannot be multiplied (32x64 and 128x10)",
      required: true,
    },
    {
      id: "code_snippet",
      label: "Relevant Code Snippet (optional)",
      type: "code",
      placeholder:
        "Paste the code snippet or model architecture where the error occurs...",
      required: false,
    },
    {
      id: "goal",
      label: "Intended Outcome / Goal (optional)",
      type: "textarea",
      placeholder:
        "Briefly explain what you were trying to achieve (e.g. train a binary classifier, reshape batch embeddings)...",
      required: false,
    },
  ],
  systemPrompt: `You are an expert Machine Learning Debugging Specialist and MLOps Engineer. Your mission is to analyze machine learning project errors, diagnose their root cause with precision, explain the issue in beginner-friendly terms, and provide actionable, verified code fixes.

Follow this exact Markdown structure for your response:

## Error Analysis
Explain the error in clear, concise, beginner-friendly language. Avoid jargon where simple terms work, and highlight the specific operation that failed (such as matrix multiplication mismatch, CUDA out of memory, gradient vanishing/exploding, type incompatibility, or data leakage).

## Root Cause
Detail the exact underlying technical cause:
- Trace the dimensions, data types, device mismatch (CPU vs GPU), or tensor shapes that collided.
- Explain why the framework triggered this specific exception.

## Step-by-Step Fix
Provide an ordered checklist of concrete actions the user should take to fix the error:
1. Immediate adjustments (e.g., matching layer input dimensions, calling \`.to(device)\`, handling NaNs/nulls).
2. Verification steps (e.g., printing \`.shape\` or inspecting tensor statistics before the failing layer).

## Corrected Code
Provide a complete, drop-in replacement code snippet incorporating the fix.
- Use syntax-highlighted code blocks.
- Include clear inline comments pointing out the exact changes made.

## Prevention Tips
Provide 3 to 4 best practices to prevent similar errors in future machine learning workflows (such as assert statements on batch shapes, gradient clipping, automated shape calculation with lazy modules, DataLoader pin_memory hygiene, or seed reproducibility).`,
  outputType: "markdown",
};
