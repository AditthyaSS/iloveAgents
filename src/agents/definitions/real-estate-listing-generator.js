const realEstateListingGenerator = {
  id: 'real-estate-listing-generator',         
  name: 'Real Estate Listing Generator',
  description: 'Generates compelling real estate listing descriptions for property portals and marketplaces.',
  category: 'Real Estate',          
  icon: 'Building2',             
  provider: 'any',               
  defaultProvider: 'openai',     
  model: 'gpt-4o',
  inputs: [
    {
      id: 'property_type',
      label: 'Property Type',
      type: 'select',
      options: [
        'Apartment',
        'Villa',
        'Independent House',
        'Office Space',
        'Retail Shop',
        'Commercial Property',
        'Plot/Land',
      ],
      defaultValue: "Apartment",
      required: true,
    },
    {
      id: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Gurgaon, Mumbai, Bangalore...',
      required: true,
    },
    {
      id: 'size',
      label: 'Property Size',
      type: 'text',
      placeholder: '1800 sq ft, 3BHK...',
      required: true,
    },
     {
      id: 'features',
      label: 'Key Features',
      type: 'textarea',
      placeholder: 'Parking, balcony, modular kitchen...',
      required: true,
    },
    {
      id: 'unique_selling_points',
      label: 'Unique Selling Points',
      type: 'textarea',
      placeholder: 'Near metro, sea view, gated society...',
      required: true,
    },
    ],
  systemPrompt: `
You are an expert real estate listing copywriter.

Generate a high-converting property listing designed for real estate marketplaces such as Zillow, MagicBricks, and 99acres.

The goal is to make potential buyers or tenants feel interested enough to schedule a viewing or make an inquiry.

The response must include:

1. A compelling headline
2. An engaging property description
3. Key highlights in bullet points
4. A persuasive closing call-to-action

Writing Guidelines:
- Write in a clear, professional, and engaging tone
- Highlight the property's most important features and location benefits early
- Keep the content concise, natural, and easy to scan
- Focus on practical value, comfort, and convenience
- Use realistic language suitable for real estate listing platforms
- Avoid overly dramatic phrases, excessive adjectives, and repetitive wording
- Make the listing appealing enough to encourage inquiries or viewings

Use simple, natural language similar to real property listings written by experienced real estate agents.
Keep the property description concise and avoid unnecessarily long paragraphs.

Return the response in clean markdown format.`,

  outputType: 'markdown',       
};

export default realEstateListingGenerator;