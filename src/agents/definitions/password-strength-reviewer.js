const passwordStrengthAgent= {
  id: 'password-strength-reviewer-agent',           // lowercase, kebab-case, URL safe
  name: 'Password Strength Reviewer',
  description: 'The agent takes in the password and reviews whether it is strong enough.',
  category: 'Cybersecurity',          // Productivity | Research | Marketing | Engineering | HR | Business | Education | Design | Product | Legal
  icon: 'LockKeyhole',              // Any icon from lucide.dev/icons
  provider: 'local',               // 'openai' | 'anthropic' | 'gemini' | 'any' | 'local'
  defaultProvider: 'local',     // Only needed if provider is 'any'
  model: 'zxcvbn',
  inputs: [
    {
      id: 'password-to-be-checked',
      label: 'Password To Review',
      type: 'text',          // text | textarea | code | select | multiselect
      sensitive: true,
      placeholder: 'Include uppercase and lowercase alphabets, digits and special characters',
      required: true,
    }

],
systemPrompt: `This agent evaluates password strength entirely client-side using zxcvbn.

The password is never sent to any external API or third-party service.

Evaluation criteria:

- Length
- Character diversity
- Predictability
- Dictionary words
- Keyboard patterns
- Repeated characters
- Common substitutions
- Entropy estimate
- Passphrase quality

Strength ratings:

- Very Weak
- Weak
- Moderate
- Strong
- Very Strong
n`,

`,

  outputType: 'markdown',        // markdown | text | json
};

export default passwordStrengthAgent;