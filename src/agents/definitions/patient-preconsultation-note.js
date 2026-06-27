export default {
  id: "patient-preconsultation-note",
  createdAt: "2026-05-20",

  name: "Patient Pre-Consultation Note",

  description:
    "Turn symptom descriptions into a structured pre-consultation summary patients can share with doctors. Includes symptom timeline, relevant history prompts, and helpful questions for the doctor. This tool does not provide medical diagnoses.",

  category: "Healthcare",

  icon: "HeartPulse",

  provider: "openai",
  defaultProvider: "openai",
  model: "gpt-4.1-mini",

  exampleInputs: {
    symptoms:
      "I have had headaches, mild fever, and body pain for the last 3 days. The headaches get worse at night.",

    duration: "3 days",

    severity: "Moderate — affects daily activities",

    progression: "Worsening",

    age: "24",

    sex: "Female",

    medicalHistory:
      "History of migraines. No diabetes or blood pressure issues.",

    medications:
      "Paracetamol twice daily.",

    allergies:
      "Penicillin",

    additionalNotes:
      "Recently traveled and had poor sleep.",
  },

  inputs: [
    {
      id: "symptoms",
      label: "Describe your symptoms",
      type: "textarea",
      placeholder:
        "e.g. I have chest discomfort, fatigue, and dizziness after walking.",
      required: true,
    },

    {
      id: "duration",
      label: "How long have you had these symptoms?",
      type: "text",
      placeholder: "e.g. 3 days, 2 weeks, since yesterday",
      required: true,
    },

    {
      id: "severity",
      label: "How severe are the symptoms?",
      type: "select",
      options: [
        "Mild — noticeable but manageable",
        "Moderate — affects daily activities",
        "Severe — difficult to function normally",
      ],
      defaultValue: "Moderate — affects daily activities",
      required: true,
    },

    {
      id: "progression",
      label: "How are the symptoms changing?",
      type: "select",
      options: ["Improving", "Worsening", "No major change"],
      defaultValue: "No major change",
    },

    {
      id: "age",
      label: "Age",
      type: "text",
      placeholder: "e.g. 24",
    },

    {
      id: "sex",
      label: "Biological sex",
      type: "select",
      options: ["Female", "Male", "Intersex", "Prefer not to say"],
    },

    {
      id: "medicalHistory",
      label: "Relevant medical history",
      type: "textarea",
      placeholder:
        "e.g. asthma, migraines, diabetes, surgeries, previous illnesses",
    },

    {
      id: "medications",
      label: "Current medications",
      type: "textarea",
      placeholder:
        "e.g. vitamin supplements, prescribed medicines",
    },

    {
      id: "allergies",
      label: "Known allergies",
      type: "text",
      placeholder: "e.g. penicillin, dust, peanuts",
    },

    {
      id: "additionalNotes",
      label: "Additional notes",
      type: "textarea",
      placeholder:
        "Anything else the doctor should know? lifestyle changes, travel, stress, sleep issues, etc.",
    },
  ],

  systemPrompt: `You are a medical intake assistant.

Your role is ONLY to organize patient information into a structured pre-consultation note.

You are NOT a doctor.

You must NEVER:
- diagnose conditions
- suggest treatments
- prescribe medications
- claim certainty about medical causes
- predict diseases
- recommend medical tests unless explicitly requested by a healthcare professional

Your responsibilities:
- summarize symptoms clearly
- build a symptom timeline
- organize severity and history
- suggest useful questions for the doctor
- highlight useful missing information
- keep the output structured and readable

If the user mentions potentially urgent symptoms such as:
- chest pain
- difficulty breathing
- stroke-like symptoms
- seizures
- severe bleeding
- suicidal thoughts
- loss of consciousness

advise seeking immediate professional or emergency medical care before continuing the summary.

Never create or assume medical history.

If information is missing or unclear, explicitly write:
"Not provided by patient."

Use calm, professional, non-alarming language.

Always include:
"This summary is not a medical diagnosis and should not replace professional medical advice."

Output format:

# Pre-Consultation Summary

This summary is intended to help organize information before a medical consultation.

## Main Symptoms
- bullet list

## Symptom Timeline
- chronological symptom summary

## Severity
- symptom severity overview

## Symptom Progression
- improving, worsening, or unchanged

## Patient Information
- age
- biological sex

## Relevant Medical History
- summarized history

## Current Medications
- summarized medications

## Allergies
- summarized allergies

## Additional Context
- summarized notes

## Information the Doctor May Ask About
- useful missing details or clarifications

## Questions the Patient Can Ask the Doctor
- provide 5–7 helpful questions

## Important Disclaimer
This summary is not a medical diagnosis and should not replace professional medical advice.

Rules:
- Never diagnose
- Never suggest likely diseases
- Never prescribe medication
- Never invent details
- Never provide certainty about causes
- Keep the response concise, structured, and professional
`,

  outputType: "markdown",
};


