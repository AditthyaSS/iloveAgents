export default {
  id: "patient-discharge-summary-writer",
  createdAt: "2026-05-14",
  name: "Patient Discharge Summary Writer",
  description:
    "Turn diagnosis, treatment, medications, and follow-up instructions into a clear patient-friendly discharge summary.",
  category: "Healthcare",
  icon: "FileText",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    patientName: "Asha Mehta",
    diagnosis: "Mild pneumonia",
    treatmentGiven:
      "Chest X-ray, oxygen monitoring, antibiotics started in clinic, fever medicine given, breathing improved before discharge.",
    medications:
      "Amoxicillin-clavulanate 625 mg twice daily for 5 days; paracetamol 500 mg as needed for fever, maximum 3 tablets per day.",
    followUpInstructions:
      "Return for review in 5 days. Come back sooner for worsening breathlessness, chest pain, persistent high fever, or confusion.",
  },
  inputs: [
    {
      id: "patientName",
      label: "Patient name",
      type: "text",
      placeholder: "e.g. Asha Mehta",
    },
    {
      id: "diagnosis",
      label: "Diagnosis or reason for visit",
      type: "textarea",
      placeholder: "e.g. Mild pneumonia confirmed by chest X-ray",
      required: true,
    },
    {
      id: "treatmentGiven",
      label: "Treatment given",
      type: "textarea",
      placeholder:
        "e.g. Oxygen monitoring, antibiotics started, wound cleaned and dressed",
      required: true,
    },
    {
      id: "medications",
      label: "Medications prescribed",
      type: "textarea",
      placeholder:
        "e.g. Amoxicillin 500 mg three times daily for 5 days; paracetamol as needed",
      required: true,
    },
    {
      id: "followUpInstructions",
      label: "Follow-up instructions and warning signs",
      type: "textarea",
      placeholder:
        "e.g. Follow up in one week; return sooner for fever, severe pain, or breathing trouble",
      required: true,
    },
  ],
  systemPrompt: `You write clear, patient-friendly hospital or clinic discharge summaries.
Use plain language while preserving the clinical facts supplied by the user.

Output in this exact format:

## Discharge Summary

**Patient:** [patient name or "Not specified"]
**Diagnosis:** [diagnosis]

---

### What happened during your visit
Explain the diagnosis and treatment in simple terms. Keep this to 3-4 short sentences.

### Medicines to take
Create a clear bullet list from the medication instructions.
For each medicine include the name, dose, how often to take it, and duration when provided.
If any detail is missing, say "not specified" instead of guessing.

### Care at home
- [practical home-care instruction based only on the provided treatment and diagnosis]
- [repeat as needed]

### Follow-up plan
Explain when and where the patient should follow up, using the provided instructions.

### Get medical help urgently if
List the warning signs provided by the clinician. If none were provided, write:
"No urgent warning signs were specified. Contact your healthcare provider if symptoms worsen."

---

## Notes for the clinician to review
- [missing medication details, unclear follow-up timing, or other gaps that should be checked before sharing]

Rules:
- Do not add a new diagnosis, medicine, dose, or test result that was not provided.
- Do not replace professional medical judgment.
- Use calm, respectful language suitable for patients and caregivers.
- Keep sentences short and avoid medical jargon when a plain-language phrase works.`,
  outputType: "markdown",
};
