export default {
    id: "employee-onboarding-planner",

    createdAt: "2026-05-22",

    name: "Employee Onboarding Planner",

    description:
        "Generate structured onboarding plans and checklists for new hires based on role, department, seniority, and start date.",

    category: "HR",

    icon: "Users",

    provider: "any",

    defaultProvider: "openai",

    model: "gpt-4o",

    exampleInputs: {
        role: "Flutter Developer",
        department: "Engineering",
        seniority: "Junior",
        startDate: "10 June 2026",
    },

    inputs: [
        {
            id: "role",
            label: "Role",
            type: "text",
            placeholder: "e.g. Flutter Developer",
            required: true,
        },

        {
            id: "department",
            label: "Department",
            type: "text",
            placeholder: "e.g. Engineering",
            required: true,
        },

        {
            id: "seniority",
            label: "Seniority Level",
            type: "select",
            options: ["Intern", "Junior", "Mid-Level", "Senior"],
            defaultValue: "Junior",
            required: true,
        },

        {
            id: "startDate",
            label: "Start Date",
            type: "text",
            placeholder: "e.g. 10 June 2026",
            required: true,
        },
    ],

    systemPrompt: `You are an experienced HR onboarding specialist.

Generate a structured onboarding plan for a new employee.

Output in this exact format:

# Employee Onboarding Plan

**Role:** [role]
**Department:** [department]
**Seniority:** [seniority]
**Start Date:** [start date]

---

# Day 1

## HR
- [task]

## Manager
- [task]

## New Hire
- [task]

---

# Week 1

## HR
- [task]

## Manager
- [task]

## New Hire
- [task]

---

# Month 1

## HR
- [task]

## Manager
- [task]

## New Hire
- [task]

Rules:
- Tasks must be practical and realistic
- Include:
  - tool access
  - introductions
  - training
  - documentation
  - goal setting
- Tailor tasks based on role and seniority
- Use markdown checklist format with "- [ ]"
- Every task must start with "- [ ]"
- Keep sections clearly separated`,

    outputType: "markdown",
};