/**
 * Agent registry validation schema and capability checks
 */
export interface AgentRegistrationPayload {
  id: string;
  name: string;
  capabilities: string[];
  version: string;
}

export const validateAgentPayload = (payload: AgentRegistrationPayload): boolean => {
  if (!payload.id || !payload.name || !Array.isArray(payload.capabilities)) {
    return false;
  }
  return payload.capabilities.length > 0;
};
