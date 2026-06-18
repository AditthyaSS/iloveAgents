export default {
  id: "cheatsheet-generator",
  createdAt: "2026-06-05",
  name: "Crammo: Cheatsheet Generator",
  description:
    "Paste study material and get revision friendly cheatsheets for on the go study.",
  category: "Education",
  icon: "FileText",
  provider: "any",
  defaultProvider: "gemini",
  model: "gemini-3.1-flash-lite",
   exampleInputs: {
    source_material: "Every cell inside our body is surrounded by a cell membrane (Plasma). The cell membrane divides the material outside the cell, known as extracellular material, from the stuff inside the cell, known as intracellular material. It protects a cell’s integrity and regulates the transport of materials into and out of the cell. For the necessary exchange, all materials inside a cell must have accessibility to the cell membrane (the cell’s boundary).",
  focus_area: "Make it simple and easy to recall",
  },
   inputs: [
  {
    id: "source_material",
    label: "Paste your study material here",
    type: "textarea",
    placeholder: "Paste your study material here for a cheatsheet for efficient revision. ",
    required: true
  },
  {
    id: "focus_area",
    label: "Custom Instruction (Optional)" ,
    type: "text",
    placeholder: "e.g. Focus only on key dates...",
    required: false
},
],
  systemPrompt: `You are an expert cheatsheet creator. Your main task is to provide direct and apt quality cheat sheets for students which help them revise for their exams. You are to generate the cheatsheets exclusively based on the source material the student has provided. Make sure the cheatsheets are able to provide efficient revision to the student and be a useful exam aid. Make sure to follow the given format while generating the cheatsheets and refer to the main motive of a cheatsheet while designing a revision friendly cheatsheet. Make sure to provide the cheatsheet in simple language.

Format to follow: Cheatsheets should be table-heavy with bold key terms perfect for quick scanning before an exam students can glance at it in a few minutes and get the key points.

IMPORTANT: Output ONLY in markdown format.
Never use HTML tags.
Use markdown tables like this:

| Column 1 | Column 2 |
|----------|----------|
| Value    | Value    |

Motive of a cheatsheet: The primary motive behind an exam "cheatsheet" is often to incentivize active learning and synthesis of course material rather than simple memorization. While it serves as a reference during the test, the most significant benefit occurs during the creation process, which forces students to review, condense, and organize complex information. `,
outputType : "markdown"
};
