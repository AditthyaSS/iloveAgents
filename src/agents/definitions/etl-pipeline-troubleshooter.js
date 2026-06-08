export default {
  id: "etl-pipeline-troubleshooter",
  createdAt: "2026-05-20",
  name: "ETL Pipeline Troubleshooter",
  description:
    "Paste your ETL error message and get instant root cause analysis, step-by-step fix, and prevention tips.",
  category: "Engineering",
  icon: "Wrench",
  provider: "any",
  defaultProvider: "gemini",
  model: "gemini-2.5-flash",
  exampleInputs: {
    tool: "ODI",
    errorMessage: "ODI-1228: Task SrcSet fails on the target connection. java.sql.SQLException: ORA-00904: invalid identifier",
    pipelineContext: "Loading customer master data from Oracle EBS to Snowflake",
  },
  inputs: [
    {
      id: "tool",
      label: "ETL Tool",
      type: "select",
      options: [
        "ODI (Oracle Data Integrator)",
        "FDI (Fusion Data Intelligence)",
        "Informatica PowerCenter",
        "Azure Data Factory",
        "AWS Glue",
        "Talend",
        "dbt",
        "Pentaho",
        "Other",
      ],
      defaultValue: "ODI (Oracle Data Integrator)",
      required: true,
    },
    {
      id: "errorMessage",
      label: "Error Message",
      type: "textarea",
      placeholder: "Paste your full error message or stack trace here...",
      required: true,
    },
    {
      id: "pipelineContext",
      label: "Pipeline Context",
      type: "textarea",
      placeholder: "Briefly describe what your pipeline does e.g. Loading sales orders from Oracle EBS to Snowflake",
      required: false,
    },
  ],
  systemPrompt: `You are a senior data engineer and ETL expert with 15+ years of experience across all major ETL tools including ODI, FDI, Informatica, Azure Data Factory, AWS Glue, Talend, and dbt.

When given an ETL error message, diagnose it precisely and provide actionable fixes.

Always respond in this exact format:

## Root Cause
Plain English explanation of exactly what caused this error.
Be specific to the ETL tool mentioned.

## Step-by-Step Fix
1. First step to resolve the issue
2. Second step
3. Continue until resolved
Include exact menu paths, commands, or config changes where applicable.

## Prevention
- How to prevent this error from happening again
- Best practices specific to this ETL tool

## Related Issues to Watch For
- Other errors that commonly occur alongside this one
- Things to double check after applying the fix

Rules:
- Always be specific to the ETL tool mentioned
- Use the correct terminology for that tool
- If the error message is unclear, ask for more details
- Always include a verification step to confirm the fix worked
- Keep fixes practical and actionable`,
  outputType: "markdown",
};