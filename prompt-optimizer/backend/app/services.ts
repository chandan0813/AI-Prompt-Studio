// prompt-optimizer/backend/app/services.ts
import { OptimizeInput, OptimizeOutput, RunInput, RunOutput } from './schemas';
import { ai } from '../../../genkit.config';

const systemInstruction = `You are a helpful AI assistant. Rewrite the user’s request to be maximally clear, specific, and actionable for an LLM. Include context, constraints, examples.`;
const baseInstruction = `Given a role, task, set of requirements, and instructions, generate a well-formed prompt that incorporates these elements to be clear, concise, and effective for a large language model.`;


export async function optimizePrompt(input: OptimizeInput): Promise<OptimizeOutput> {
  const { raw_prompt } = input;

  // Placeholder logic to parse raw_prompt into structured elements.
  // For a more robust solution, consider using another LLM call or NLP techniques
  // to extract Role, Task, Requirements, and Instructions from raw_prompt.
  // For now, we'll use the raw_prompt as the main task and provide defaults.

  const defaultRole = "Helpful Assistant";
  const task = raw_prompt; // The user's input is considered the core task.
  const defaultRequirements = "The output should be a refined prompt suitable for an LLM. It should be specific, actionable, and provide sufficient context. Avoid ambiguity.";
  const defaultInstructions = "Analyze the user's input and restructure it into an optimized prompt. If the user's input implies a role, task, specific requirements, or instructions, try to extract and clearly state them in the optimized prompt. Ensure the optimized prompt is ready to be sent to an LLM for execution.";

  // Attempt to extract or infer elements from the raw prompt if possible.
  // This is a simplified example.
  let inferredRole = defaultRole;
  if (raw_prompt.toLowerCase().startsWith("act as") || raw_prompt.toLowerCase().startsWith("pretend to be")) {
    // Basic role extraction
    const roleMatch = raw_prompt.match(/^(act as|pretend to be)\s+([^.]+)/i);
    if (roleMatch && roleMatch[2]) {
      inferredRole = roleMatch[2].trim();
    }
  }


  const structuredPromptForOptimization = `
Based on the following user input, generate an optimized prompt. The optimized prompt should clearly define the Role, Task, Requirements, and Instructions for an LLM.

User's Raw Prompt:
"${raw_prompt}"

---
Guidance for Optimization:

1.  **Role**: Define the persona the LLM should adopt. If the user specified a role (e.g., "act as a chef"), use that. Otherwise, infer a suitable role or use "${inferredRole}".
2.  **Task**: Clearly state the primary objective or what the LLM needs to accomplish. This should be derived directly from the user's raw prompt.
3.  **Requirements**: Specify constraints, desired output format, length, style, tone, or any conditions the LLM's response must meet. If not explicitly stated by the user, infer reasonable requirements or use: "${defaultRequirements}".
4.  **Instructions**: Provide step-by-step guidance, examples, or information on how the LLM should approach the task. If not detailed by the user, use: "${defaultInstructions}".

---
Optimized Prompt Structure (Example):
Role: [Clearly defined role for the LLM]
Task: [Specific and actionable task for the LLM]
Requirements: [List of constraints, output format, style, etc.]
Instructions: [Step-by-step guidance, examples, or process for the LLM]
---

Generate the optimized prompt below:
`;

  const optimizationPrompt = ai.prompt(
    `${systemInstruction}\n\n${baseInstruction}\n\n${structuredPromptForOptimization}`
  );

  const response = await optimizationPrompt.run();

  return { optimized_prompt: response.output! };
}

export async function runPrompt(input: RunInput): Promise<RunOutput> {
  const { prompt } = input;

  const geminiResponse = await ai.prompt(prompt).run();

  // Mock metadata for now
  // In a real scenario, Genkit or the Gemini SDK might provide actual usage data.
  const metadata = {
    usage: {
        prompt_tokens: prompt.length / 4, // Rough estimate
        completion_tokens: geminiResponse.output!.length / 4, // Rough estimate
        total_tokens: (prompt.length + geminiResponse.output!.length) / 4 // Rough estimate
    }
  };


  return { response: geminiResponse.output!, metadata: metadata };
}
