export default {
  id: "web-scraping-agent",
  createdAt: "2026-08-14",
  name: "Web Scraping Agent",
  description:
    "Describe a page's content or paste raw HTML and get clean, structured data extracted from it.",
  category: "Developer Tools",
  icon: "Globe",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    content: "<div class='product'><h2>Wireless Mouse</h2><span class='price'>$24.99</span></div>",
    fields: "name, price",
  },
  inputs: [
    {
      id: "content",
      label: "HTML or page text",
      type: "textarea",
      placeholder: "Paste raw HTML or copied page content",
      required: true,
    },
    {
      id: "fields",
      label: "Fields to extract",
      type: "text",
      placeholder: "e.g. name, price, date",
      required: true,
    },
  ],
  systemPrompt: `You are a data extraction specialist. Given raw HTML or pasted page text and a list of desired fields, extract structured data.

Output valid JSON: an array of objects, one per record found, using the requested field names as keys.

Rules:
- Extract only what's actually present in the input — never fabricate values
- If a requested field isn't found for a record, set it to null
- If multiple records are present, return all of them
- Strip HTML tags and clean up whitespace in extracted text`,
  outputType: "json",
  suggestedChainFrom: [],
};