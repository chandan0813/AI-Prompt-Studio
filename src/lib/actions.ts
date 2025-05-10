
"use server";

import { customizeAIPrompt as customizeAIPromptFlow, type CustomizeAIPromptInput, type CustomizeAIPromptOutput } from "@/ai/flows/customize-ai-prompts";

export async function handleCustomizePrompt(
  input: CustomizeAIPromptInput
): Promise<CustomizeAIPromptOutput | { error: string }> {
  try {
    const result = await customizeAIPromptFlow(input);
    return result;
  } catch (error)
{
    console.error("Error customizing prompt:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during prompt customization." };
  }
}
