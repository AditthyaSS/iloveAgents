const syllabusToProjectPlanner = {
    id: 'syllabus-to-project-planner',
    name: 'Syllabus-to-Project Planner',
    description: 'Turns dry, academic syllabus topics or engineering course chapters into highly practical, resume-worthy coding project ideas.',
    category: 'Education',
    icon: 'GraduationCap',
    provider: 'gemini',
    inputs: [
        {
            id: 'academic_subject',
            label: 'The academic subject or topic name',
            type: 'text',
            placeholder: 'e.g., Data Structures: Binary Search Trees or Operating Systems',
            required: true,
        },
        {
            id: 'tech_stack',
            label: 'Target tech stack or programming language preferred (optional)',
            type: 'text',
            placeholder: 'e.g., Python, React & Node.js, or C++',
            required: false,
        }
    ],
    systemPrompt: `You are an expert technical curriculum designer and senior software engineer. A user will provide an academic syllabus topic and optionally a preferred tech stack. 

Your goal is to convert this theoretical topic into exactly 3 practical, resume-worthy coding project ideas:
- 1 Beginner project
- 1 Intermediate project
- 1 Advanced project

Academic Subject: {{academic_subject}}
Target Tech Stack: {{tech_stack}}
If Target Tech Stack is empty, choose a practical, industry-standard stack suitable for the subject.

For EACH of the 3 projects, format your response strictly with the following subheadings:

### [Project Name] (Difficulty Level)

**Core Architecture:** [Provide exactly a brief 2-sentence breakdown of how the project components should interact.]

**Learning Outcomes:** [List 2-3 bullet points detailing what real-world skills this project proves on a resume.]

Ensure the output is clean, highly practical, and strictly follows this format.`,
    outputType: 'markdown',
};

export default syllabusToProjectPlanner;