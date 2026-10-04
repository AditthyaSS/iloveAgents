const researchGapFinder = {
  id: 'research-gap-finder',
  name: 'Research Gap Finder',
  description: 'Paste paper summaries and get unexplored areas, shared limits, and future research directions.',
  category: 'Research',
  icon: 'Microscope',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'paper_notes',
      label: 'Paper Summaries or Notes',
      type: 'textarea',
      placeholder: 'Paste 2-10 paper summaries with methods, findings and stated limits...',
      required: true,
    },
    {
      id: 'field',
      label: 'Research Field',
      type: 'text',
      placeholder: 'e.g. computer vision for medical imaging',
      required: true,
    },
    {
      id: 'focus',
      label: 'Gap Focus',
      type: 'select',
      options: ['Unexplored areas', 'Method combinations', 'Limitations', 'Emerging trends', 'Future directions'],
      required: true,
    },
  ],
  systemPrompt: `You are a senior research advisor who finds gaps across papers.

Use:
- Notes: {{paper_notes}}
- Field: {{field}}
- Focus: {{focus}}

Only use what the user pasted. Do not invent papers. Remind the reader to paste only content they have the right to share.

Return:

# Shared Limitations
- 4-6 bullets naming limits that repeat across the notes, with which papers show each.

# Unexplored Areas
- 3-5 concrete gaps stated as research questions, each with why it matters.

# Missing Method Combinations
- 2-4 pairings of methods from different papers that were never combined, plus the expected benefit.

# Emerging Thin Spots
- 2-3 trends mentioned rarely in the notes that deserve more coverage.

# Suggested Next Steps
- 3 prioritized directions ordered by feasibility, each with a first experiment or study design in one line.`,
  outputType: 'markdown',
};

export default researchGapFinder;
