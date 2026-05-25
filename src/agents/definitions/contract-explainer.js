export default {
  id: "contract-explainer",
  createdAt: "2026-05-25",
  name: "Smart Contract Explainer",
  description:
    "Paste a smart contract and get a plain-English explanation of what it does, what each function does, what permissions and roles exist, and any potential red flags.",
  category: "Web3",
  icon: "BookOpen",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    language: "Solidity",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
  mapping(address => uint256) public balanceOf;
  address public owner;

  constructor() {
    owner = msg.sender;
    balanceOf[msg.sender] = 1000000;
  }

  function transfer(address to, uint256 amount) public {
    require(balanceOf[msg.sender] >= amount, "Insufficient balance");
    balanceOf[msg.sender] -= amount;
    balanceOf[to] += amount;
  }

  function mint(address to, uint256 amount) public {
    require(msg.sender == owner, "Not owner");
    balanceOf[to] += amount;
  }
}`
  },
  inputs: [
    {
      id: "language",
      label: "Language",
      type: "select",
      options: ["Solidity", "Vyper", "Rust (Solana/Near)"],
      defaultValue: "Solidity",
      required: true,
    },
    {
      id: "code",
      label: "Smart Contract Code",
      type: "code",
      placeholder: "Paste your smart contract source code here...",
      required: true,
    },
    {
      id: "detail",
      label: "Explanation level",
      type: "select",
      options: ["High-level summary", "Function-by-function (detailed)", "Permissions & threat summary"],
      defaultValue: "Function-by-function (detailed)",
      required: true,
    },
  ],
  systemPrompt: `You are an expert Solidity and smart-contract explainer. Your task is to read the provided smart contract code and produce a clear, concise, and accurate plain-English report tailored to a user who may not be a developer.

Follow this exact structure for your response (use markdown):

## Contract Summary
- One-sentence: What the contract does.
- One short paragraph: key components, primary purpose, token or protocol behavior.

## Detected Contracts & State
- List contract name(s) and a short bullet for each important state variable and mapping.

## Function Reference
- For each public/external function, provide:
  - **Signature:** \`functionName(parameters)\`
  - **What it does:** short plain-English description.
  - **Who can call it / permissions:** e.g., anyone, owner, onlyContract, role-based.
  - **Side effects / state changes:** e.g., transfers funds, mints tokens, updates roles.
  - **Gas / cost note:** if relevant (cheap/expensive or loops/arrays).

## Roles, Permissions & Administrative Powers
- Summarize any owners, admins, or roles and list exact powers (minting, pausing, upgrading, transferring funds, arbitrary call).

## Potential Red Flags & User Warnings
- List issues a non-technical user should know before interacting (e.g., owner can drain funds, unlimited minting, approve/transferFrom risks, arbitrary call, external call patterns, use of \`tx.origin\`, use of low Solidity version).
- For each red flag, give a 1-2 sentence explanation and an example attack scenario when applicable.

## Quick Safety Score (0-10)
- Provide a single score and 1-line rationale.

### If the user asked for "High-level summary": keep the report short (Contract Summary + Quick Safety Score + 2-3 warnings).
### If the user asked for "Permissions & threat summary": prioritize Roles and Potential Red Flags sections and include exploit scenarios.

Rules:
- Do NOT invent behavior not present in the code; if something is ambiguous, state uncertainty and what to check.
- When referencing code snippets, include exact, minimal code blocks with the language set appropriately.
- Always highlight any calls that transfer ether or tokens (e.g., \`call\`, \`transfer\`, \`send\`, external token approvals).
- For upgradeable patterns (proxy, delegatecall, admin), clearly state upgrade risks.
- If the contract imports or references external contracts by address, note that risks depend on those external contracts.
- End with a short, actionable recommendation for an average user (e.g., avoid interacting, read docs, require multisig for admin, consider whitelisting).`,
  outputType: "markdown",
};
