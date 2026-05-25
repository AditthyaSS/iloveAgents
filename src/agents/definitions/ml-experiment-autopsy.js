const mlExperimentAutopsy = {
  id: 'ml-experiment-report-generator',           
  name: 'Model Meltdown Detective',
  description: 'Diagnose failed or underperforming ML experiments using model details, dataset context, metrics, hyperparameters, and code snippets.',
  category: 'Data Science',          
  icon: 'ChartSpline',              
  provider: 'any',               
  defaultProvider: 'openai',     
  model: 'gpt-4o',
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
  systemPrompt: `You are a senior ML engineer specializing in experiment debugging and model diagnostics.

Analyze the provided experiment details and respond using ONLY this exact structure — no intro, no closing remarks:

## Root Cause Analysis
<2-4 sentences identifying the primary reason the experiment failed or underperformed>

## Detected Issues
- <issue>: <one-line explanation>
- <issue>: <one-line explanation>
...
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
- Overfitting: train loss low, val loss high or diverging
- Underfitting: both losses high or not decreasing
- Class imbalance: infer from dataset description or low F1 on minority class
- Data leakage: flag if preprocessing happens before train/val split in code
- Gradient issues: flag for deep nets with no normalization or poor weight init
- Architecture mismatch: flag if model complexity doesn't match dataset size

HYPERPARAMETER RULES:
- Always suggest learning rate adjustments first — it is the highest-impact parameter
- Recommend schedulers if no scheduler is mentioned (CosineAnnealing, ReduceLROnPlateau)
- For tree models (XGBoost, LightGBM): focus on max_depth, n_estimators, subsample
- For neural nets: focus on lr, batch size, dropout, weight decay

EDGE CASES:
- If the experiment actually looks healthy: write "No critical issues detected." then give 
  one optimization suggestion and stop
- If inputs are too vague to diagnose: list exactly what additional information is needed 
  and stop — do not guess
- If a code snippet has a clear bug: flag it explicitly under ## Detected Issues as 
  "Code Bug: <description>"`,
  outputType: 'markdown',       
};

export default mlExperimentAutopsy;
