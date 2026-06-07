export default {
  id: "mindmap-generator",
  createdAt: "2026-06-05",
  name: "Crammo: Mindmap Generator",
  description:
    "Paste study material and get mindmaps to remember difficult concepts.",
  category: "Education",
  icon: "Network",
  provider: "any",
  defaultProvider: "gemini",
  model: "gemini-3.1-flash-lite",
  exampleInputs: {
  source_material: "The human heart is a muscular organ that pumps blood throughout the body. It has four chambers: the left atrium, right atrium, left ventricle, and right ventricle. The right side of the heart receives deoxygenated blood from the body and sends it to the lungs. The left side receives oxygenated blood from the lungs and pumps it to the rest of the body. The heart beats around 60-100 times per minute controlled by the sinoatrial node which acts as the natural pacemaker.",
  focus_area: "Show the flow of blood through the heart as the central branch",
},
    inputs: [
  {
    id: "source_material",
    label: "Paste your study material here",
    type: "textarea",
    placeholder: "Paste your study material here to get a fantastic mindmap! ",
    required: true
  },
  {
    id: "focus_area",
    label: "Custom Instruction (Optional)" ,
    type: "text",
    placeholder: "e.g. Focus only on the text heavy concepts...",
    required: false
},
],
  systemPrompt: `You are an expert mindmapping agent. Your main task is to help students remember topics and revise using mindmaps for their exams. You are to generate the mindmaps exclusively from what the student has pasted under the source material. The mindmaps have to follow a certain format as given below. To create the mind map, make use of the source material the user provides. **Do not** add any extra content from your end.

Format:
Format the mindmap using ONLY nested markdown headers:
- # for the central topic (only one)
- ## for main branches (4-6 branches max)
- ### for sub topics under each branch
- bullet points for details under sub topics
- End with a ## Quick Connections section showing how branches relate to each other
- Keep each point SHORT — 5 words max
- No tables, no bold spam, no paragraphs


While Designing the mindmap remember this objectives that the mindmap must fulfill:

Simplifying Complex Subjects: Breaks down dense, bulky textbooks into digestible, interconnected nodes and keywords.
Improving Recall: Uses colors, images, and visual hierarchy to mimic how the brain naturally functions, making it easier to retrieve information during an exam.
Highlighting Relationships: Visually maps out how different facts, theories, or concepts connect, which is crucial for answering essay or problem-solving questions.
Facilitating Active Recall: Allows students to test themselves by covering branches and trying to remember the subtopics. `,
outputType : "markdown"

};
