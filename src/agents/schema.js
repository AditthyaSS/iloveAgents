import { z } from 'zod';

export const AgentSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  provider: z.string().min(1, "Provider is required"),
  inputs: z.record(z.any()).optional(), 
  // You can add more strict requirements here later if your agents need specific functions or fields
});
