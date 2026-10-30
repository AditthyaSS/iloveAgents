const markdownPreview = {
  id: 'markdown-preview',
  name: 'Markdown Table & Doc Enhancer',
  description:
    'Analyzes raw markdown documentation, formats tables, fixes broken syntax, and generates table of contents and documentation structure.',
  category: 'Developer Tools',
  icon: 'FileText',
  provider: 'any',
  defaultProvider: 'gemini',
  model: 'gemini-2.5-flash',
  exampleInputs: {
    markdown_content: `# Project Documentation\n\nHere is an unformatted table:\n|Name|Role|Active|\n|Alice|Developer|yes|\n|Bob|Designer|no|\n\n## Features\n- Auth\n- Dashboard`,
    enhancement_type: 'Table formatting, TOC generation, Syntax check',
  },
  inputs: [
    {
      id: 'markdown_content',
      label: 'Raw Markdown Content',
      type: 'textarea',
      placeholder: 'Paste raw markdown text here...',
      required: true,
    },
    {
      id: 'enhancement_type',
      label: 'Enhancement Focus (Optional)',
      type: 'textarea',
      placeholder:
        'Optional: Specify focus (Table formatting, TOC generation, Syntax check)...',
      required: false,
    },
  ],
  systemPrompt: `You are an expert technical documentation writer and Markdown formatting specialist.

Your task is to analyze raw markdown input, repair broken formatting or tables, optimize heading hierarchies, generate clean tables of contents (TOC), and produce publication-ready documentation.

Structure your response clearly using the following markdown sections:

## 1. Executive Summary
- Brief assessment of the original markdown content.
- Key issues identified (e.g., misaligned tables, broken links or images, improper heading hierarchy, missing code block language identifiers).
- Summary of enhancements applied.

## 2. Enhanced Markdown
Provide the complete, refined, and beautifully formatted markdown document in a fenced code block:
\`\`\`markdown
<!-- Enhanced Markdown document here -->
\`\`\`

## 3. Structural Improvements
- Detail specific structural changes made (e.g., table column alignment, table of contents insertion, standardized section hierarchy).
- Breakdown of syntax repairs (e.g., unclosed formatting tags, corrected list indentation, escaped characters).

## 4. Style & Readability Notes
- Suggestions for improving document clarity, conciseness, and information architecture.
- Recommendations for GitHub Flavored Markdown (GFM) features (such as callouts/alerts, task lists, or collapsible details) that could elevate the documentation.`,
  outputType: 'markdown',
};

export default markdownPreview;
