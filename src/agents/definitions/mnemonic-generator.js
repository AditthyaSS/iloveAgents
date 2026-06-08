export default {
  id: "mnemonic-generator",
  createdAt: "2026-06-04",
  name: "Crammo: Mnemonic Generator", 
  description: 
    "Paste study material and get revision friendly mnemonics.",
  category: "Education",
  icon: "Brain",
  provider: "any",
  defaultProvider: "gemini", 
  model: "gemini-3.1-flash-lite", 
  exampleInputs: {
    source_material: "The order of planets from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune",
  focus_area: "Make it funny and easy to remember"
  },
    inputs: [
  {
    id: "source_material",
    label: "Paste your study material here", 
    type: "textarea",
    placeholder: "Paste your study material here for a mnemonic to ace that exam! ", 
    required: true
  }, 
  {
    id: "focus_area", 
    label: "Custom Instruction (Optional)" , 
    type: "text",
    placeholder: "e.g. Focus only on key dates...",
    required: false
}, 
], 
  systemPrompt: `You are an expert mnemonic generator. Your main task is to help students remember topics and revise using mnemonics. 
  You are to generate the mnemonic exclusively from what the student has pasted under the source material. 
  In generation of the mnemonic use the source materials the student has provided to you. 
  Make sure the mnemonic is created using simple English vocabulary words that the student can recall in the exam. 
  Refer to the mnemonic generation guide below to understand the generation of mnemonics. 

Mnemonic Generation Guide: 
Consider what critical information you need to remember and how you can be creative.
Example:  For my astronomy class, I need to remember the order of planets from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
Take the first letter (or a key word) of the item you need to remember and write it down. Repeat for all items.
Example:  M, V, E, M, J, S, U, N
Create a phrase or a sentence that incorporates the first letters (or key words). Pick the first thing that pops into your head – it doesn’t have to make sense!
Example:  My Very Educated Mother Just Served Us Nachos  


After you generate the mnemonic, provide it in a readable format so that the student can remember it with ease.`,
outputType : "markdown" 

};
    
  
  
  
