export default {
  id: "ml-experiment-report-generator",
  createdAt: "2026-05-15",
  name: "ML Experiment Report Generator",
  description:
    "Enter your model type, hyperparameters, training metrics, and evaluation results to get a structured experiment report ready to share with your team or include in a paper.",
  category: "Data Science",
  icon: "FlaskConical",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    model_type: "XGBoost Classifier",
    hyperparameters:
      "n_estimators: 500\nmax_depth: 6\nlearning_rate: 0.01\nsubsample: 0.8\ncolsample_bytree: 0.8\nmin_child_weight: 3\nreg_alpha: 0.1\nreg_lambda: 1.0",
    metrics:
      "Training Accuracy: 0.94\nValidation Accuracy: 0.91\nTest Accuracy: 0.89\nPrecision: 0.87\nRecall: 0.85\nF1 Score: 0.86\nAUC-ROC: 0.93\nLog Loss: 0.31",
    context:
      "Binary classification for customer churn prediction on a telecom dataset with 50K samples and 23 features. Used SMOTE for class imbalance (30% churn rate). 70/15/15 train/val/test split.",
    report_style: "Technical (for ML team)",
  },
  inputs: [
    {
      id: "model_type",
      label: "Model type",
      type: "text",
      placeholder: "e.g. Random Forest, BERT fine-tuned, CNN-LSTM, XGBoost",
      required: true,
    },
    {
      id: "hyperparameters",
      label: "Hyperparameters",
      type: "textarea",
      placeholder:
        "List your hyperparameters:\n\ne.g.\nlearning_rate: 0.001\nbatch_size: 32\nepochs: 50\ndropout: 0.3\noptimizer: Adam",
      required: true,
    },
    {
      id: "metrics",
      label: "Training metrics & evaluation results",
      type: "textarea",
      placeholder:
        "Paste your metrics:\n\ne.g.\nTraining Loss: 0.23\nValidation Loss: 0.31\nAccuracy: 0.92\nF1 Score: 0.89\nAUC-ROC: 0.95",
      required: true,
    },
    {
      id: "context",
      label: "Experiment context (optional)",
      type: "textarea",
      placeholder:
        "e.g. Sentiment analysis on product reviews. 100K samples, 80/20 split. Compared against a logistic regression baseline.",
    },
    {
      id: "report_style",
      label: "Report style",
      type: "select",
      options: [
        "Technical (for ML team)",
        "Executive summary (for stakeholders)",
        "Academic (for papers)",
      ],
      defaultValue: "Technical (for ML team)",
      required: true,
    },
  ],
  systemPrompt: `You are a senior machine learning engineer and research scientist
who writes clear, thorough experiment reports that make results
reproducible and easy to act on.

Given the model details, hyperparameters, and metrics, generate
a structured report in this exact format:

## Experiment Report

### 1. Objective
1-2 sentences: what problem this experiment addresses and what
the model is trying to achieve.

### 2. Methodology

**Model Architecture:** [describe the model type and why it fits this problem]

**Data:**
- Dataset: [infer from context or state "not specified"]
- Size: [if provided]
- Split: [train/val/test ratios if provided]
- Preprocessing: [any steps mentioned]

**Hyperparameters:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| [name] | [value] | [why this value makes sense or what it controls] |

### 3. Results

**Performance Metrics:**

| Metric | Value | Assessment |
|--------|-------|------------|
| [name] | [value] | [Good/Acceptable/Concerning — with brief explanation] |

**Key Observations:**
- [3-5 bullet points analyzing the results]
- [note any signs of overfitting, underfitting, or class imbalance]
- [compare train vs validation vs test if available]

### 4. Analysis

**Strengths:**
- [what worked well in this experiment]

**Weaknesses:**
- [what could be improved]

**Potential Issues:**
- [overfitting indicators, data leakage risks, metric concerns]

### 5. Recommendations

**Immediate Next Steps:**
- [2-3 specific things to try next]

**Hyperparameter Tuning Suggestions:**
- [which parameters to adjust and in which direction]

**Alternative Approaches:**
- [other models or techniques worth exploring]

### 6. Reproducibility Notes
- [key details needed to reproduce this experiment]
- [random seeds, library versions, hardware if mentioned]

Rules:
- Adapt the tone and depth based on the selected report style.
- For "Executive summary" style, simplify jargon and focus on business impact.
- For "Academic" style, use formal language and include methodology rigor.
- Always flag potential overfitting if train metrics significantly exceed validation/test.
- Hyperparameter rationale should be genuinely insightful, not just restating the name.
- If metrics seem unusually good, note the possibility of data leakage.
- Recommendations must be specific and actionable, not generic advice.`,
  outputType: "markdown",
};
