
// src/ai/flows/customize-ai-prompts.ts
'use server';

/**
 * @fileOverview A flow for customizing AI prompts with parameter adjustments, templates, role-playing, and internal prompt optimization.
 *
 * - customizeAIPrompt - A function that allows users to fine-tune AI parameters, use templates, set an AI role,
 *                       and have their initial prompt template optimized before execution.
 * - CustomizeAIPromptInput - The input type for the customizeAIPrompt function.
 * - CustomizeAIPromptOutput - The return type for the customizeAIPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for the internal prompt optimizer
const PromptOptimizerInputSchema = z.object({
  rawInitialPrompt: z.string().describe("The user's initial prompt idea or template, possibly with placeholders."),
  aiRole: z.string().optional().describe("The AI role specified by the user for the target LLM."),
});
type PromptOptimizerInput = z.infer<typeof PromptOptimizerInputSchema>;

const PromptOptimizerOutputSchema = z.object({
  refinedPromptBody: z.string().describe("The refined prompt body, structured for effectiveness, preserving placeholders."),
});
type PromptOptimizerOutput = z.infer<typeof PromptOptimizerOutputSchema>;

// Genkit prompt definition for the internal optimizer
const promptOptimizerGenkitPrompt = ai.definePrompt({
  name: 'promptOptimizerInternal',
  input: { schema: PromptOptimizerInputSchema },
  output: { schema: PromptOptimizerOutputSchema },
  prompt: `You are an expert prompt engineer. Your task is to take a user's initial prompt idea and a specified AI role, and then refine the prompt idea into a well-structured body of text that an LLM (acting in the specified role) can effectively execute.

User's Initial Prompt Idea (this might be a simple instruction, a template with placeholders like {{variable}}, or a general concept):
"{{{rawInitialPrompt}}}"

Specified AI Role for the target LLM: "{{#if aiRole}}{{aiRole}}{{else}}Helpful Assistant{{/if}}"

---
Your Goal:
Transform the 'User's Initial Prompt Idea' into a more effective prompt body. This refined prompt body will be given to an LLM that is ALREADY instructed to 'Act as a {{#if aiRole}}{{aiRole}}{{else}}Helpful Assistant{{/if}}'.
Therefore, DO NOT include "Act as a {{#if aiRole}}{{aiRole}}{{else}}Helpful Assistant{{/if}}" or similar role-setting instructions in your output.

Consider the following elements when refining the prompt idea:
1.  **Task Identification**: Clearly identify the primary task the target LLM (acting as '{{#if aiRole}}{{aiRole}}{{else}}Helpful Assistant{{/if}}') needs to perform based on the 'User's Initial Prompt Idea'.
2.  **Implicit Requirements**: Infer and make explicit any requirements for the target LLM's output. This could include desired format, length, style, tone, constraints, or information to include/exclude.
3.  **Actionable Instructions**: Formulate clear instructions for the target LLM on how to approach the task. If the initial idea contains placeholders (e.g., {{variable_name}}), ensure they are preserved in your refined output.

---
Output Format:
Provide ONLY the refined prompt body. It should be ready to be directly processed by the target LLM.
Preserve any {{variable_name}} placeholders found in the 'User's Initial Prompt Idea'.

Example:
If User's Initial Prompt Idea is: "tell me about {{topic}}" and AI Role is "Teacher",
Your output (the refinedPromptBody) might be:
"Please explain the key concepts of {{topic}} in a way that is easy for a high school student to understand. Include a real-world example and a brief summary of its importance."
(Notice: No "Act as a Teacher" here, and {{topic}} is preserved.)

---
Now, generate the refined prompt body based on the provided 'User's Initial Prompt Idea' and 'Specified AI Role'.`,
  config: { 
    temperature: 0.4, // Optimizer can run with default temperature, or slightly lower for consistency
     safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE'},
    ],
  }
});


// Input schema for the main customization flow
const CustomizeAIPromptInputSchema = z.object({
  promptTemplate: z
    .string()
    .describe('The initial idea or template for the prompt, with placeholders for variables.'),
  variables: z
    .record(z.string())
    .optional()
    .describe('A map of variable names to values to substitute into the prompt template.'),
  role: z
    .string()
    .optional()
    .describe('The role the AI should adopt, e.g., "Prompt Engineer", "Story Teller".'),
});
export type CustomizeAIPromptInput = z.infer<typeof CustomizeAIPromptInputSchema>;

const CustomizeAIPromptOutputSchema = z.object({
  result: z.string().describe('The result of the prompt after applying parameters, variables, and role.'),
});
export type CustomizeAIPromptOutput = z.infer<typeof CustomizeAIPromptOutputSchema>;


// Schema for the final execution prompt (after optimization and variable filling)
const FinalExecutionInputSchema = z.object({
  role: z.string().optional(),
  finalFilledOptimizedPromptBody: z.string(),
});

// Genkit prompt definition for the final execution
const finalExecutionGenkitPrompt = ai.definePrompt({
  name: 'finalExecutionPromptWithRole',
  input: { schema: FinalExecutionInputSchema },
  output: { schema: CustomizeAIPromptOutputSchema }, // Output is the final AI result
  prompt: `{{#if role}}Act as a {{role}}.{{/if}}

{{{finalFilledOptimizedPromptBody}}}`,
  config: () => ({ 
    temperature: 0.7, // Default temperature
    topP: 0.9,      // Default topP
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE'},
    ],
  }),
});


export async function customizeAIPrompt(input: CustomizeAIPromptInput): Promise<CustomizeAIPromptOutput> {
  return customizeAIPromptFlow(input);
}

const customizeAIPromptFlow = ai.defineFlow(
  {
    name: 'customizeAIPromptFlowWithOptimizationAndRole',
    inputSchema: CustomizeAIPromptInputSchema,
    outputSchema: CustomizeAIPromptOutputSchema,
  },
  async (input: CustomizeAIPromptInput) => {
    // Step 1: Optimize the raw prompt template
    const optimizerInput: PromptOptimizerInput = {
      rawInitialPrompt: input.promptTemplate,
      aiRole: input.role,
    };
    const optimizerResponse = await promptOptimizerGenkitPrompt(optimizerInput);
    
    let refinedPromptBodyWithPlaceholders = optimizerResponse.output?.refinedPromptBody;

    if (!refinedPromptBodyWithPlaceholders) {
      // Fallback or error handling if optimizer fails
      console.warn("Prompt optimizer did not return refined body, using raw template.");
      refinedPromptBodyWithPlaceholders = input.promptTemplate;
    }

    // Step 2: Fill variables into the refined (or fallback) prompt body
    let finalFilledOptimizedPromptBody = refinedPromptBodyWithPlaceholders;
    if (input.variables) {
      for (const [key, value] of Object.entries(input.variables)) {
        // Using a more robust regex for {{variable_name}}
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        finalFilledOptimizedPromptBody = finalFilledOptimizedPromptBody.replace(regex, value);
      }
    }

    // Step 3: Prepare input for the final execution prompt
    const finalExecutionInput = {
      role: input.role,
      finalFilledOptimizedPromptBody: finalFilledOptimizedPromptBody,
    };

    // Step 4: Execute the final, optimized, and filled prompt
    const executionResponse = await finalExecutionGenkitPrompt(finalExecutionInput);
    
    if (!executionResponse.output) {
        throw new Error("Failed to get a result from the final prompt execution.");
    }
    return executionResponse.output;
  }
);
