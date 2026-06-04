export default {
  id: "solidity-code-reviewer",
  createdAt: "2026-05-24",
  name: "Solidity Code Reviewer",
  description: "Review Solidity smart contract code for security, gas efficiency, and best practices.",
  category: "Web3",
  icon: "ShieldCheck", // optional, follow existing icon naming
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-opus-4-20250514",
  exampleInputs: {
    code: `pragma solidity ^0.8.0;

contract Example {
    function transfer(address to, uint256 amount) public {
        // ...
    }
}`,
    language: "Solidity",
    focus: ["Security", "Gas Optimization"],
  },
  inputs: [
    {
      id: "code",
      label: "Solidity Code",
      type: "code",
      placeholder: "Paste your Solidity contract here...",
      required: true,
    },
    {
      id: "language",
      label: "Language",
      type: "select",
      options: ["Solidity"],
      defaultValue: "Solidity",
      required: true,
    },
    {
      id: "focus",
      label: "Review focus",
      type: "multiselect",
      options: [
        "Security",
        "Gas Optimization",
        "Best Practices",
        "Readability",
        "Common Vulnerabilities"
      ],
      defaultValue: ["Security", "Gas Optimization", "Common Vulnerabilities"],
      required: true,
    },
  ],
  systemPrompt: `You are a senior Solidity engineer reviewing smart contract code. Focus on vulnerabilities, gas usage, best practices, and correctness. For each issue found, explain the problem, show the affected lines or pattern, and provide a corrected suggestion. End with a short security summary and practical recommendations.`,
  outputType: "markdown",
};