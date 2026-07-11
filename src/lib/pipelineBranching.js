/**
 * Conditional branching support for workflow pipelines.
 *
 * A workflow's `agents` array historically holds plain agent id strings that
 * run sequentially. This module adds one new entry shape, the conditional
 * branch step:
 *
 * {
 *   type: 'conditional_branch',
 *   id: 'route',
 *   condition: '{{ steps.classify.output }}',
 *   branches: {
 *     billing:   ['refund-policy-writer'],
 *     technical: ['bug-report-generator'],
 *     default:   ['eli5-explainer'],
 *   },
 * }
 *
 * The condition template is resolved against the pipeline context, the
 * resolved value is matched against branch labels (trimmed, case-insensitive),
 * and exactly one branch's agent list executes per run. When no label matches,
 * the `default` branch runs.
 */

export const CONDITIONAL_STEP_TYPE = 'conditional_branch'

export const DEFAULT_BRANCH = 'default'

/**
 * True when a workflow entry is a conditional branch step object.
 * Plain agent id strings return false, preserving backwards compatibility.
 * @param {string|object} entry
 * @returns {boolean}
 */
export function isConditionalStep(entry) {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    entry.type === CONDITIONAL_STEP_TYPE
  )
}

/**
 * Resolve `{{ path.to.value }}` placeholders in a template string against a
 * context object. Unresolvable paths render as an empty string. Only dotted
 * property lookups are supported; the template is never evaluated as code,
 * so workflow definitions cannot inject executable expressions.
 *
 * @param {string} template e.g. '{{ steps.classify.output }}'
 * @param {object} context  e.g. { input: '...', steps: { classify: { output: 'billing' } } }
 * @returns {string}
 */
export function resolveTemplate(template, context) {
  if (typeof template !== 'string') return ''
  return template.replace(/\{\{\s*([\w.[\]-]+)\s*\}\}/g, (_, path) => {
    const value = getPath(context, path)
    return value == null ? '' : String(value)
  })
}

/**
 * Select which branch label should execute for a resolved condition value.
 * Matching is exact after trimming and lowercasing both sides. Falls back to
 * the `default` branch, and returns null when neither matches.
 *
 * @param {string} conditionValue
 * @param {Record<string, string[]>} branches
 * @returns {string|null} the matched branch label
 */
export function selectBranch(conditionValue, branches) {
  if (!branches || typeof branches !== 'object') return null
  const normalized = String(conditionValue ?? '').trim().toLowerCase()
  const match = Object.keys(branches).find(
    (label) => label !== DEFAULT_BRANCH && label.trim().toLowerCase() === normalized
  )
  if (match) return match
  return Object.prototype.hasOwnProperty.call(branches, DEFAULT_BRANCH) ? DEFAULT_BRANCH : null
}

/**
 * Evaluate a conditional step against the pipeline context.
 *
 * @param {object} step   conditional_branch step object
 * @param {object} context pipeline context ({ input, steps })
 * @returns {{ conditionValue: string, branchLabel: string|null, branchAgents: string[] }}
 */
export function evaluateConditionalStep(step, context) {
  const conditionValue = resolveTemplate(step.condition, context).trim()
  const branchLabel = selectBranch(conditionValue, step.branches)
  const branchAgents = branchLabel ? step.branches[branchLabel] ?? [] : []
  return { conditionValue, branchLabel, branchAgents: Array.isArray(branchAgents) ? branchAgents : [] }
}

/**
 * Validate a conditional step definition. Returns a list of human-readable
 * problems; an empty list means the step is well-formed.
 * @param {object} step
 * @returns {string[]}
 */
export function validateConditionalStep(step, allSteps = []) {
  const problems = []
  if (!step.id) problems.push('Conditional step is missing an "id".')
  if (!step.condition) problems.push('Conditional step is missing a "condition" template.')
  const labels = step.branches && typeof step.branches === 'object' ? Object.keys(step.branches) : []
  if (labels.length === 0) problems.push('Conditional step defines no branches.')
  if (!labels.includes(DEFAULT_BRANCH)) {
    problems.push('Conditional step has no "default" branch; runs with an unmatched condition will fail.')
  }
  for (const label of labels) {
    if (!Array.isArray(step.branches[label]) || step.branches[label].length === 0) {
      problems.push(`Branch "${label}" has no agent steps.`)
    }
  }
  const circularProblems = detectCircularBranches(step, allSteps)
  problems.push(...circularProblems)
  return problems
}

function getPath(obj, path) {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

/**
 * Detect circular references in conditional branch definitions.
 *
 * A circular reference occurs when:
 * 1. A branch directly executes a conditional step it depends on
 * 2. A branch executes a chain of steps that loops back
 *
 * @param {object} step    conditional_branch step object
 * @param {object[]} allSteps all workflow steps for cycle detection
 * @returns {string[]} list of circular reference problems detected
 */
export function detectCircularBranches(step, allSteps = []) {
  const problems = []
  if (!step.branches || typeof step.branches !== 'object') return problems

  const visited = new Set()
  const recursionStack = new Set()

  function hasCycle(stepId, target) {
    if (stepId === target) return true
    if (visited.has(stepId)) return false
    if (recursionStack.has(stepId)) return true

    recursionStack.add(stepId)

    const currentStep = allSteps.find((s) => s.id === stepId || (typeof s === 'string' && s === stepId))
    if (currentStep && isConditionalStep(currentStep)) {
      const branches = currentStep.branches || {}
      for (const agents of Object.values(branches)) {
        if (Array.isArray(agents)) {
          for (const agentId of agents) {
            if (hasCycle(agentId, target)) {
              recursionStack.delete(stepId)
              return true
            }
          }
        }
      }
    }

    recursionStack.delete(stepId)
    visited.add(stepId)
    return false
  }

  for (const branchLabel of Object.keys(step.branches)) {
    const agents = step.branches[branchLabel]
    if (Array.isArray(agents)) {
      for (const agentId of agents) {
        if (agentId === step.id) {
          problems.push(`Branch "${branchLabel}" directly references the conditional step itself, creating a cycle.`)
        } else {
          visited.clear()
          recursionStack.clear()
          if (hasCycle(agentId, step.id)) {
            problems.push(
              `Branch "${branchLabel}" references a step that eventually loops back to this conditional step.`
            )
          }
        }
      }
    }
  }

  return problems
}
