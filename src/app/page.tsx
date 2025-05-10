
"use client";

import { useState } from "react";
import { PromptCustomizer } from "@/components/prompt-customizer";
import { ResponseDisplay } from "@/components/response-display";
import { ResponseActions } from "@/components/response-actions";
import type { CustomizeAIPromptOutput } from "@/ai/flows/customize-ai-prompts";
import { Bot, MessagesSquare } from "lucide-react"; // Added MessagesSquare for a more descriptive icon

export default function CustomizePromptPage() {
  const [customizedOutput, setCustomizedOutput] = useState<CustomizeAIPromptOutput | null>(null);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  const handleProcessingStart = () => {
    setIsProcessingResponse(true);
    setCustomizedOutput(null); 
  };

  const handleCustomizationComplete = (output: CustomizeAIPromptOutput) => {
    setCustomizedOutput(output);
    setIsProcessingResponse(false);
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <MessagesSquare className="h-8 w-8 text-primary" />
          Customize AI Prompts
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Use our advanced tools to tailor AI prompts. Adjust parameters, select roles, use templates, and manage variables for optimal results.
        </p>
      </header>
      
      <PromptCustomizer
        onCustomizationComplete={handleCustomizationComplete}
        onProcessingStart={handleProcessingStart}
      />

      {(isProcessingResponse || (customizedOutput && customizedOutput.result)) && (
        <div className="mt-8">
          <ResponseDisplay
            title="AI Generated Response"
            customResponse={customizedOutput?.result}
            isLoading={isProcessingResponse}
            icon={<Bot className="h-6 w-6 text-primary" />}
          />
          {!isProcessingResponse && customizedOutput && customizedOutput.result && (
            <ResponseActions
              responseTextToExport={customizedOutput.result}
              responseTitle="Custom_AI_Response"
            />
          )}
        </div>
      )}
    </div>
  );
}
