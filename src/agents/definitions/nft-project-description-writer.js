const nftProjectDescriptionWriter = {
  id: 'nft-project-description-writer',
  name: 'NFT Project Description Writer',
  description: 'Writes engaging and compelling descriptions for NFT collections.',
  category: 'Marketing',
  icon: 'Image',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'projectName',
      label: 'Project Name',
      type: 'text',
      placeholder: 'e.g., CryptoPunks',
      required: true,
    },
    {
      id: 'theme',
      label: 'Theme & Concept',
      type: 'textarea',
      placeholder: 'Describe the art style, theme, and inspiration...',
      required: true,
    },
    {
      id: 'totalSupply',
      label: 'Total Supply',
      type: 'text',
      placeholder: 'e.g., 10,000',
      required: true,
    },
    {
      id: 'utility',
      label: 'Utility & Perks',
      type: 'textarea',
      placeholder: 'What do holders get? (e.g., community access, airdrops)',
      required: true,
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      type: 'textarea',
      placeholder: 'Describe planned milestones and roadmap...',
      required: true,
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      type: 'text',
      placeholder: 'e.g., Art collectors, Gamers, Crypto natives',
      required: false,
    },
  ],
  systemPrompt: `You are an expert Copywriter specializing in Web3 and NFTs.
Your task is to write compelling, exciting, and professional descriptions for an NFT project.
Use the user-provided fields (Project Name, Theme & Concept, Total Supply, Utility & Perks, Roadmap, and optional Target Audience) from the input message.

Please produce three separate, destination-tailored descriptions, each formatted in Markdown:

## OpenSea
A concise marketplace description containing a catchy hook, the core concept, utility highlights, and a call-to-action (CTA). Keep it to ~1-3 short paragraphs.

## Website
A long-form, detailed description suitable for the project's official website. Go deep into the story, theme, detailed utilities/perks, roadmap milestones, and a final CTA.

## Twitter
An ultra-short bio or CTA (one line) that fits within Twitter's character limits, designed to capture immediate interest.

Ensure each section is clearly headed with its respective markdown title (e.g., "## OpenSea", "## Website", "## Twitter"). Use a tone that appeals to the specified target audience.`,
  outputType: 'markdown',
};

export default nftProjectDescriptionWriter;
