const interiorDesigner = {
  id: 'interior-designer',
  name: 'Interior Designer',
  description: 'AI interior styling consultant that delivers personalized layout plans, color palettes, furniture recommendations, and space optimization strategies.',
  category: 'Design',
  icon: 'Palette',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  exampleInputs: {
    room_type: 'Living Room',
    style_preference: 'Scandinavian / Japandi',
    room_dimensions: '14x18 ft, rectangular with large east-facing window and hardwood flooring',
    color_palette: 'Warm neutrals, oak wood, sage green, and soft cream',
    budget_constraints: '$3,500 budget, pet-friendly fabrics, renter-friendly (minimal wall drilling)'
  },
  inputs: [
    {
      id: 'room_type',
      label: 'Room Type',
      type: 'text',
      placeholder: 'e.g. Living Room, Primary Bedroom, Studio Apartment, Home Office',
      required: true
    },
    {
      id: 'style_preference',
      label: 'Preferred Interior Style',
      type: 'text',
      placeholder: 'e.g. Minimalist, Japandi, Mid-Century Modern, Industrial, Bohemian, Contemporary',
      required: true
    },
    {
      id: 'room_dimensions',
      label: 'Room Dimensions & Architectural Features',
      type: 'textarea',
      placeholder: 'e.g. 12x15 ft rectangular room, 9ft ceiling, natural light from south window, radiator along one wall',
      required: true
    },
    {
      id: 'color_palette',
      label: 'Color Palette & Atmosphere Preferences (Optional)',
      type: 'text',
      placeholder: 'e.g. Warm earthy tones, terracotta and olive, neutral grayscale with brass accents',
      required: false
    },
    {
      id: 'budget_constraints',
      label: 'Budget, Lifestyle & Space Constraints (Optional)',
      type: 'textarea',
      placeholder: 'e.g. $2,000 budget, cat-friendly scratch-resistant materials, multi-purpose work/sleep setup',
      required: false
    }
  ],
  systemPrompt: `You are an expert interior designer and architectural spatial planner.
Given the client's room specifications, preferences, and constraints, generate a comprehensive, structured interior design proposal.

Adhere strictly to this structured format:

## Design Concept & Aesthetic Vision
- **Theme & Vibe**: A concise 2-3 sentence summary defining the aesthetic mood.
- **Focal Point**: Identify the primary focal anchor of the room.

## Color Palette & Material Board
Provide a curated 4-5 color palette with hex codes and descriptive names:
- Color 1: \`#HEX\` — Primary Wall / Base tone (Usage: ...)
- Color 2: \`#HEX\` — Secondary / Large furniture tone (Usage: ...)
- Color 3: \`#HEX\` — Accent / Textile tone (Usage: ...)
- Color 4: \`#HEX\` — Metal / Hardware finish (Usage: ...)
- **Key Textures & Materials**: List 3-4 complementary materials (e.g. bouclé, bleached oak, matte black steel).

## Spatial Layout & Zone Planning
- **Zoning**: Breakdown of functional zones in the room.
- **Placement & Flow**: Specific orientation for key furniture (seating, storage, tables) ensuring clear walkways (minimum 30-36 inches).
- **Space Optimization**: 2-3 clever space-saving or ergonomic layout techniques.

## Curated Furniture & Decor Checklist
Provide a prioritized itemized checklist:
| Category | Recommended Piece & Style | Dimensions / Specs | Priority |
| :--- | :--- | :--- | :--- |
| Core Seating / Bed | ... | ... | High |
| Accent Furniture | ... | ... | High / Medium |
| Storage & Shelving | ... | ... | Medium |
| Rugs & Textiles | ... | ... | High |
| Wall Art / Accessories | ... | ... | Low / Medium |

## Multi-Layer Lighting Strategy
- **Ambient Lighting**: Overall illumination (e.g. flush mount, pendant).
- **Task Lighting**: Functional illumination (e.g. reading lamp, desk task light).
- **Accent / Mood Lighting**: Atmospheric touches (e.g. warm LED backlighting, floor uplight).

## Practical Styling & Implementation Tips
- 3-4 practical styling rules tailored to the client's constraints (renter tips, budget allocations, pet/kid friendly considerations).`
};

export default interiorDesigner;
