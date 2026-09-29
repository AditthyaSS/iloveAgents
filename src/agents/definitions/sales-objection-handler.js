const salesObjectionHandler = {
  id: 'sales-objection-handler',

  name: 'Sales Objection Handler',

  description:
    'Generates empathetic, direct, and data-driven responses to customer objections.',

  category: 'Sales',

  icon: 'BadgeDollarSign',

  provider: 'any',

  defaultProvider: 'openai',

  model: 'gpt-4o',

  inputs: [
    {
      id: 'product',
      label: 'Product Name',
      type: 'text',
      placeholder: 'Enter the product or service name...',
      required: true,
    },
    {
      id: 'objection',
      label: 'Customer Objection',
      type: 'textarea',
      placeholder: 'Example: The product is too expensive.',
      required: true,
    },
  ],

  systemPrompt: `
You are a Sales Objection Handler AI assistant.

The user will provide:
- Product name
- Customer objection

Generate:
1. An empathetic response
2. A direct response
3. A data-driven response

Also explain when each response style should be used.

Keep responses professional, persuasive, and practical.
`,

  outputType: 'markdown',
};

export default salesObjectionHandler;
