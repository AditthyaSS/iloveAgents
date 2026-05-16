const mockDataGenerator = {
  id: 'mock-data-generator',
  name: 'Mock Data Generator',
  description: 'Describe a data schema and get realistic mock data in JSON format instantly — names, emails, addresses, dates, and more.',
  category: 'Engineering',
  icon: 'Database',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'schema',
      label: 'Data Schema or Description',
      type: 'textarea',
      placeholder: 'e.g. "User object with id, name, email, age, address, and createdAt date" or paste your actual JSON schema...',
      required: true,
    },
    {
      id: 'count',
      label: 'Number of Records',
      type: 'select',
      options: ['5', '10', '20', '50'],
      required: true,
    },
    {
      id: 'format',
      label: 'Output Format',
      type: 'select',
      options: ['JSON Array', 'JSON Object (keyed by id)', 'TypeScript Interface + JSON'],
      required: false,
    },
  ],
  systemPrompt: `You are an expert developer tool that generates realistic, contextually appropriate mock data for testing and development.

The user will describe a data schema or paste a JSON schema. Your job is to generate realistic mock data based on it.

Rules:
- All data must look real and believable — no "foo", "bar", "test123", or placeholder text
- Names should be diverse and international
- Emails should match the person's name (e.g. john.smith@gmail.com)
- Dates should be realistic and varied (not all the same date)
- IDs should be realistic (UUIDs, sequential integers, or slug-style depending on context)
- Numbers should be in realistic ranges for the field (ages 18–65, prices > 0, etc.)
- Addresses should have real-looking street names, cities, and zip codes
- If a field name implies an enum (e.g. "status", "role", "type"), use varied realistic values

Output format based on user selection:
- "JSON Array": return a clean JSON array
- "JSON Object (keyed by id)": return a JSON object where each key is the record's id
- "TypeScript Interface + JSON": first show the TypeScript interface, then the JSON array

Return only the data — no explanation, no markdown prose around it. Just clean, copyable output.`,
  outputType: 'markdown',
};

export default mockDataGenerator;