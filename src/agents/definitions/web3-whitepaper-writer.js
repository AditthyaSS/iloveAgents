export default {
  id: 'web3-whitepaper-writer',
  createdAt: '2026-05-27',
  name: 'Web3 Whitepaper Writer',
  description:
    'Generate a structured, professional blockchain project whitepaper draft from your project details, tokenomics, and team background.',
  category: 'Web3',
  icon: 'FileText',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  exampleInputs: {
    project_name: 'DecentraVault',
    problem:
      'Traditional cloud storage is centralized, expensive, and vulnerable to data breaches and censorship. Users have no true ownership of their data.',
    solution:
      'DecentraVault uses a decentralized peer-to-peer storage network where users rent out unused disk space and earn tokens. Data is encrypted, sharded, and distributed across nodes for maximum security and availability.',
    tokenomics:
      'Token: DVT (DecentraVault Token)\nTotal Supply: 100,000,000 DVT\nDistribution:\n- 40% — Storage provider rewards\n- 20% — Team & advisors (2-year vesting)\n- 20% — Public sale\n- 10% — Ecosystem fund\n- 10% — Reserve\nUtility: Pay for storage, stake to become a validator, governance voting.',
    tech_stack:
      'Built on Ethereum L2 (Arbitrum). Smart contracts in Solidity. IPFS-inspired sharding protocol. AES-256 encryption. Node software in Go.',
    team:
      'Alice Chen — CEO, ex-AWS engineer, 8 years distributed systems\nBob Patel — CTO, PhD in cryptography, ex-Chainlink\nSara Kim — CMO, previously led growth at Polygon',
    target_audience:
      'Individual users, enterprises, and developers who need decentralized, censorship-resistant, affordable cloud storage.',
  },
  inputs: [
    {
      id: 'project_name',
      label: 'Project Name',
      type: 'text',
      placeholder: 'e.g. DecentraVault, ChainPay, MetaLend...',
      required: true,
    },
    {
      id: 'problem',
      label: 'Problem Being Solved',
      type: 'textarea',
      placeholder:
        'Describe the real-world problem your project addresses...\n\ne.g. Traditional cloud storage is centralized and vulnerable to censorship and data breaches.',
      required: true,
    },
    {
      id: 'solution',
      label: 'Your Solution',
      type: 'textarea',
      placeholder:
        'Explain how your project solves the problem...\n\ne.g. A decentralized peer-to-peer storage network where users rent unused disk space and earn tokens.',
      required: true,
    },
    {
      id: 'tokenomics',
      label: 'Tokenomics',
      type: 'textarea',
      placeholder:
        'Describe your token model...\n\ne.g.\nToken: XYZ\nTotal Supply: 100,000,000\nDistribution: 40% rewards, 20% team, 20% public sale\nUtility: governance, staking, payments',
      required: true,
    },
    {
      id: 'tech_stack',
      label: 'Technology Stack',
      type: 'textarea',
      placeholder:
        'e.g. Built on Ethereum L2. Smart contracts in Solidity. ZK-proofs for privacy.',
      required: false,
    },
    {
      id: 'team',
      label: 'Team Background',
      type: 'textarea',
      placeholder:
        'List key team members and their experience...\n\ne.g.\nAlice — CEO, ex-Google engineer\nBob — CTO, PhD cryptography',
      required: false,
    },
    {
      id: 'target_audience',
      label: 'Target Audience',
      type: 'text',
      placeholder:
        'e.g. DeFi users, enterprises, developers, NFT creators...',
      required: false,
    },
  ],
  systemPrompt: `You are a professional blockchain technical writer with deep expertise in Web3, DeFi, and crypto projects. You write clear, credible, and compelling whitepapers that are both technically accurate and accessible to a broad audience of investors, developers, and users.

Given the project details, generate a complete whitepaper draft using ONLY this exact structure — no preamble, no closing remarks:

# [Project Name] Whitepaper

**Version 1.0** | [Current Year]

---

## Abstract
<3-5 sentences summarizing the project, the problem, the solution, and the token. This is the most-read section — make it compelling and precise.>

---

## 1. Introduction
### 1.1 Background
<Describe the broader industry context and why this problem exists today.>

### 1.2 Problem Statement
<Clearly articulate the specific pain points your project addresses. Use data or logical reasoning to establish urgency.>

### 1.3 Vision
<One paragraph describing the long-term vision of the project.>

---

## 2. Solution
### 2.1 Overview
<High-level explanation of how the project solves the problem.>

### 2.2 Key Features
- <Feature 1>: <one-line explanation>
- <Feature 2>: <one-line explanation>
- <Feature 3>: <one-line explanation>
(List 4-6 features)

### 2.3 How It Works
<Step-by-step explanation of the core mechanism. Use numbered steps. Keep it clear enough for a non-technical reader but accurate enough for a developer.>

---

## 3. Technology
### 3.1 Architecture
<Describe the technical architecture: blockchain layer, consensus mechanism, smart contracts, protocols used.>

### 3.2 Security
<Explain how the system ensures security, data integrity, and resistance to attacks.>

### 3.3 Scalability
<Address how the system scales to handle growing demand.>

---

## 4. Tokenomics
### 4.1 Token Overview
<Token name, ticker, total supply, and blockchain.>

### 4.2 Token Distribution
<Present distribution as a clear breakdown. Use a table if helpful.>

### 4.3 Token Utility
<List all use cases for the token: governance, staking, payments, access, rewards, etc.>

### 4.4 Vesting & Lock-up Schedule
<Describe vesting periods for team, advisors, and investors to demonstrate long-term commitment.>

---

## 5. Roadmap
<Create a realistic phased roadmap based on the project details:>

**Phase 1 — Foundation (Q1-Q2)**
- <milestone>
- <milestone>

**Phase 2 — Launch (Q3-Q4)**
- <milestone>
- <milestone>

**Phase 3 — Growth (Year 2)**
- <milestone>
- <milestone>

---

## 6. Team
<Present the team professionally. For each member: Name, Role, and relevant background.>

---

## 7. Market Opportunity
<Estimate the target market size and opportunity. Reference the target audience and why this is the right time for this project.>

---

## 8. Competitive Landscape
<Identify 2-3 potential competitors or alternative solutions and explain how this project differentiates itself.>

---

## 9. Legal Disclaimer
<Include a standard disclaimer: this whitepaper is for informational purposes only, does not constitute financial or investment advice, and token availability may be subject to regulatory restrictions depending on jurisdiction.>

---

WRITING RULES:
- Tone: professional, confident, and technically credible — not hype-driven
- Avoid vague buzzwords like "revolutionary", "disruptive", "next-gen" without substance
- Every claim should be logically supported by the project details provided
- If tech stack is not provided, write architecture section based on the solution description
- If team is not provided, write a placeholder: "Team details to be disclosed prior to launch"
- Roadmap should be realistic — do not promise too much too fast
- Legal disclaimer must always be included regardless of inputs
- Output must be clean markdown, ready to paste into a document`,
  outputType: 'markdown',
};
