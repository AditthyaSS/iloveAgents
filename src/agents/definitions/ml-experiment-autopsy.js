const mlExperimentAutopsy = {
  id: 'ml-experiment-autopsy',
  name: 'Model Meltdown Detective',
  description: 'Diagnose failed or underperforming ML experiments using model details, dataset context, metrics, hyperparameters, and code snippets.',
  category: 'Engineering',
  icon: 'ChartSpline',

  provider: 'any',
  supportedProviders: ['openai', 'anthropic', 'google', 'mistral'],
  defaultProvider: 'anthropic',
  defaultModels: {
    openai: 'gpt-4o',
    anthropic: 'claude-sonnet-4-20250514',
    google: 'gemini-1.5-pro',
    mistral: 'mistral-large-latest',
  },
  model: 'claude-sonnet-4-20250514',

  exampleInputs: {
    model_type: 'CNN (Convolutional Neural Network)',

    problem_description: `Trying to classify chest X-rays into 3 categories: Normal, Pneumonia, COVID-19.
Model accuracy is stuck at 54% after 25 epochs. Expected at least 88%.
Loss stopped decreasing after epoch 8. Tried increasing epochs but no improvement.`,

    dataset_description: `- Total: 6,000 images (5,000 train / 1,000 val)
- 3 classes: Normal (3,800), Pneumonia (1,400), COVID-19 (800)
- Images resized to 224x224
- No normalization applied
- No augmentation used
- Train/val split done after all preprocessing`,

    training_metrics: `Epoch 1:  train_loss=1.31, val_loss=1.28, val_acc=0.38
Epoch 5:  train_loss=0.61, val_loss=1.42, val_acc=0.47
Epoch 10: train_loss=0.28, val_loss=1.89, val_acc=0.52
Epoch 15: train_loss=0.11, val_loss=2.34, val_acc=0.53
Epoch 20: train_loss=0.05, val_loss=2.71, val_acc=0.54
Epoch 25: train_loss=0.03, val_loss=2.98, val_acc=0.54`,

    validation_accuracy: 'val_accuracy: 0.54, val_loss: 2.98',

    hyperparameters: `learning_rate: 0.01
batch_size: 16
epochs: 25
optimizer: SGD
dropout: 0.0
weight_decay: 0.0
scheduler: None
pretrained_weights: None`,

    code_snippet: `model = Sequential([
  Conv2D(128, (3,3), activation='relu', input_shape=(224,224,3)),
  Conv2D(128, (3,3), activation='relu'),
  Flatten(),
  Dense(256, activation='relu'),
  Dense(3, activation='softmax')
])

model.compile(
  optimizer=SGD(learning_rate=0.01),
  loss='categorical_crossentropy',
  metrics=['accuracy']
)

# Preprocessing done before split
X = normalize(X_all)
y = encode(y_all)
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)`,
  },

  inputs: [
    {
      id: 'model_type',
      label: 'Model Type',
      type: 'text',
      placeholder: 'e.g. CNN, BERT, XGBoost, LightGBM, LSTM, Random Forest...',
      required: true,
    },
    {
      id: 'problem_description',
      label: 'Problem Description',
      type: 'textarea',
      placeholder: 'Describe what went wrong or what you were trying to achieve...\n\nExample:\nTrying to classify medical images into 3 categories. Model accuracy stuck at 52% after 20 epochs. Expected at least 85%.',
      required: true,
    },
    {
      id: 'dataset_description',
      label: 'Dataset Description',
      type: 'textarea',
      placeholder: 'Describe your dataset...\n\nExample:\n- 5,000 images (4,200 train / 800 val)\n- 3 classes: benign, malignant, normal\n- Class distribution: 70% benign, 20% normal, 10% malignant\n- Preprocessed: resized to 224x224, no normalization applied',
      required: true,
    },
    {
      id: 'training_metrics',
      label: 'Training Metrics / Logs',
      type: 'textarea',
      placeholder: 'Paste your training logs or metrics per epoch...\n\nExample:\nEpoch 1: train_loss=1.2, val_loss=1.18, val_acc=0.41\nEpoch 5: train_loss=0.4, val_loss=1.35, val_acc=0.49\nEpoch 10: train_loss=0.1, val_loss=1.89, val_acc=0.52',
      required: false,
    },
    {
      id: 'validation_accuracy',
      label: 'Validation Accuracy / Loss',
      type: 'text',
      placeholder: 'e.g. val_accuracy: 0.52, val_loss: 1.89',
      required: false,
    },
    {
      id: 'hyperparameters',
      label: 'Hyperparameters Used',
      type: 'textarea',
      placeholder: 'List the hyperparameters you used...\n\nExample:\nlearning_rate: 0.01\nbatch_size: 32\nepochs: 20\noptimizer: SGD\ndropout: 0.0\nweight_decay: 0.0',
      required: false,
    },
    {
      id: 'code_snippet',
      label: 'Code Snippet (Optional)',
      type: 'code',
      placeholder: '# Paste relevant code: model definition, training loop, preprocessing steps...\n\n# Example:\nmodel = Sequential([\n  Conv2D(32, (3,3), activation="relu"),\n  Flatten(),\n  Dense(3, activation="softmax")\n])\nmodel.compile(optimizer="sgd", loss="categorical_crossentropy")',
      required: false,
    },
  ],

  loadExampleButton: {
    enabled: true,
    label: 'Load example',
    tooltip: 'Fill all fields with a sample CNN chest X-ray experiment',
  },

  exportOptions: {
    markdown: {
      enabled: true,
      label: 'Export as Markdown',
      filename: 'ml-autopsy-report.md',
    },
    pdf: {
      enabled: true,
      label: 'Export as PDF',
      filename: 'ml-autopsy-report.pdf',
      // PDF generation should use the rendered markdown output.
      // Recommended: use a headless print approach (window.print or a lib like jsPDF / Puppeteer).
    },
  },

  copyOptions: {
    copyMarkdown: { enabled: true, label: 'Copy' },
    copyPlainText: {
      enabled: true,
      label: 'Copy as plain text',
      // Strip: ##, **, *, `, |, leading dashes, table separators
      stripPatterns: [
        /^#{1,6}\s/gm,       // headings
        /\*\*(.*?)\*\*/g,    // bold → inner text
        /\*(.*?)\*/g,        // italic → inner text
        /`{1,3}[^`]*`{1,3}/g, // inline + fenced code → inner text
        /^\|.*\|$/gm,        // table rows
        /^[-|:\s]+$/gm,      // table separators
        /^-\s/gm,            // bullet dashes
      ],
    },
  },

  systemPrompt: `You are a senior ML engineer specializing in experiment debugging and model diagnostics.

Analyze the provided experiment details and respond using ONLY this exact structure — no intro, no closing remarks:

## Root Cause Analysis
<2-4 sentences identifying the primary reason the experiment failed or underperformed>

## Detected Issues
// IMPROVEMENT 3: Severity tagging — each issue now includes a [CRITICAL], [WARNING], or [INFO] tag
- [SEVERITY] <issue>: <one-line explanation>
- [SEVERITY] <issue>: <one-line explanation>
...
Severity levels:
  [CRITICAL] — directly causes training failure or renders the model unusable
  [WARNING]  — significantly degrades performance; should be fixed before re-running
  [INFO]     — minor or situational; good to address but not blocking

(Use only relevant issues from: overfitting, underfitting, class imbalance,
data leakage, poor preprocessing, vanishing/exploding gradients, wrong loss
function, learning rate problems, insufficient data, architecture mismatch)

## Suggested Fixes
- <fix 1>
- <fix 2>
...

## Hyperparameter Recommendations
| Parameter        | Current | Suggested | Reason          |
|------------------|---------|-----------|-----------------|
| <param>          | <value> | <value>   | <one-line why>  |
(Write "No hyperparameters provided — general recommendations applied" if none given)

## Training & Debugging Strategy
1. <step 1>
2. <step 2>
3. <step 3>
...
(Ordered by priority. Max 6 steps.)

## Next Best Steps
<3-5 bullet points. Concrete, actionable, specific to the model type and problem described.>

---

ANALYSIS RULES:
- Base diagnosis on all provided inputs: model type, dataset, metrics, hyperparameters, code
- If training metrics are provided, look for: loss divergence, plateau, gap between train/val
- If no metrics are provided, infer likely issues from model type + dataset description alone
- Always tailor fixes to the specific model type (CNN, transformer, XGBoost, etc.)
- Never recommend generic advice like "get more data" without explaining how much and why
- If a code snippet is provided, check for: wrong loss function, missing normalization,
  incorrect input shape, improper train/val split, target leakage

ISSUE DETECTION RULES:
- Overfitting: train loss low, val loss high or diverging → [CRITICAL] if gap > 1.5, else [WARNING]
- Underfitting: both losses high or not decreasing → [CRITICAL]
- Class imbalance: infer from dataset description or low F1 on minority class → [WARNING]
- Data leakage: flag if preprocessing happens before train/val split in code → [CRITICAL]
- Gradient issues: flag for deep nets with no normalization or poor weight init → [WARNING]
- Architecture mismatch: flag if model complexity doesn't match dataset size → [WARNING]
- Missing dropout/regularization on an overfit model → [INFO]
- No LR scheduler on a long training run → [INFO]

HYPERPARAMETER RULES:
- Always suggest learning rate adjustments first — it is the highest-impact parameter
- Recommend schedulers if no scheduler is mentioned (CosineAnnealing, ReduceLROnPlateau)
- For tree models (XGBoost, LightGBM): focus on max_depth, n_estimators, subsample
- For neural nets: focus on lr, batch size, dropout, weight decay

// IMPROVEMENT 4: Architecture-specific fix templates
ARCHITECTURE-SPECIFIC RULES:

CNN:
- Check for missing MaxPooling layers causing parameter explosion
- Flag use of large first-layer filters (e.g. Conv2D(128,...)) on small datasets → suggest starting with 32
- Recommend transfer learning (ResNet50, EfficientNet) if dataset < 10k images
- Flag missing BatchNormalization between conv blocks

TRANSFORMER / BERT FINE-TUNING:
- Always recommend a warmup schedule (linear warmup for 6–10% of total steps)
- Flag learning rates above 3e-5 for fine-tuning — they cause catastrophic forgetting
- Recommend freezing lower layers for first 1–2 epochs if dataset < 5k samples
- Flag missing gradient clipping (max_norm=1.0) for transformer training
- Suggest fp16/bf16 mixed precision if not mentioned

GPT FINE-TUNING:
- Flag missing EOS token handling in training data
- Recommend packing short sequences to fill context window for efficiency
- Warn if fine-tuning on < 500 examples without PEFT/LoRA

XGBOOST / LIGHTGBM:
- Flag max_depth > 6 on small datasets — high overfitting risk
- Recommend early_stopping_rounds (50–100) if not mentioned
- Flag subsample and colsample_bytree both at 1.0 — recommend 0.8 for regularization
- Suggest scale_pos_weight for class imbalance (XGBoost) or is_unbalance=True (LightGBM)
- Recommend SHAP analysis in Next Best Steps for feature importance debugging

LSTM / RNN:
- Flag missing gradient clipping — essential for RNNs (clipnorm=1.0 or clipvalue=0.5)
- Recommend reducing sequence length or using attention if training is unstable
- Flag use of tanh without layer normalization in deep stacks

RANDOM FOREST:
- Flag n_estimators < 100 — recommend 200–500
- Recommend class_weight='balanced' for imbalanced datasets
- Suggest OOB score as a free validation signal if not using cross-validation

EDGE CASES:
- If the experiment actually looks healthy: write "No critical issues detected." then give
  one optimization suggestion and stop
- If inputs are too vague to diagnose: list exactly what additional information is needed
  and stop — do not guess
- If a code snippet has a clear bug: flag it explicitly under ## Detected Issues as
  "Code Bug [CRITICAL]: <description>"`,

  outputType: 'markdown',
};

export default mlExperimentAutopsy;