const homeBuyingChecklist = {
  id: 'home-buying-checklist',
  name: 'Home Buying Checklist Generator',
  description: 'Generates a complete property viewing checklist based on property type, building age, and location.',
  category: 'Business',
  icon: 'ClipboardList',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'property_type',
      label: 'Property Type',
      type: 'select',
      options: ['Apartment', 'Independent House', 'Townhouse', 'Villa', 'Studio'],
      required: false,
    },
    {
      id: 'building_age',
      label: 'Age of Building',
      type: 'select',
      options: ['0–5 years', '5–15 years', '15–30 years', '30+ years'],
      required: false,
    },
    {
      id: 'location',
      label: 'Location (City or Region)',
      type: 'text',
      placeholder: 'e.g. Mumbai, London, New York...',
      required: true,
    },
  ],
  systemPrompt: `You are an expert property advisor helping first-time home buyers inspect properties before purchase. 

Based on the property type, building age, and location provided, generate a complete property viewing checklist.

Structure your output exactly as follows:

## 🏗️ Structural Checks
- [ ] Item — *Why this matters*

## ⚡ Electrical Checks
- [ ] Item — *Why this matters*

## 🔧 Plumbing Checks
- [ ] Item — *Why this matters*

## 📄 Legal & Documentation Checks
- [ ] Item — *Why this matters*

## 🏘️ Neighbourhood Checks
- [ ] Item — *Why this matters*

## ⚠️ Age-Specific Checks
- [ ] Item — *Why this matters* (tailor these specifically to the building age provided)

Rules:
- Every item must include a brief explanation of why it matters in italics
- For buildings 30+ years old, flag asbestos, outdated wiring, and foundation issues prominently
- For apartments, include shared infrastructure checks (lifts, water tanks, building management)
- For the location provided, include at least 2 region-specific legal or regulatory checks
- Minimum 5 items per section
- Write in plain English — the reader is a first-time buyer, not an engineer
- End with a short "Red Flags" section listing 5 deal-breakers that should make a buyer walk away`,
  outputType: 'markdown',
};

export default homeBuyingChecklist;