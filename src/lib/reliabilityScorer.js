

export const calculateReliabilityScore = (agent) => {
  

  let score = 20; // Base start

  if (agent.rating) score += (agent.rating * 10); 
  if (agent.usageCount) score += Math.min(agent.usageCount / 10, 40); 
  
  const finalScore = Math.min(Math.round(score), 100);

  let badge = 'Low';
  if (finalScore >= 70) badge = 'High';
  else if (finalScore >= 40) badge = 'Medium';

  return { score: finalScore, badge };
};