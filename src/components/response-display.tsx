
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bot, FileText, BarChart3, Copy, Check } from "lucide-react";

interface ResponseDisplayProps {
  title: string;
  extractedText?: string | null;
  summary?: string | null;
  customResponse?: string | null; // For customize prompt output
  isLoading: boolean;
  icon?: React.ReactNode;
}

export function ResponseDisplay({
  title,
  extractedText,
  summary,
  customResponse,
  isLoading,
  icon = <Bot className="h-6 w-6 text-primary" />
}: ResponseDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    if (customResponse) {
      try {
        await navigator.clipboard.writeText(customResponse);
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Response copied to clipboard.",
        });
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy response to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const renderContent = () => {
    if (extractedText || summary) {
      return (
        <Accordion type="multiple" defaultValue={["summary", "extractedText"]} className="w-full">
          {summary && (
            <AccordionItem value="summary">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Summary
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-auto max-h-60 p-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          )}
          {extractedText && (
            <AccordionItem value="extractedText">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Extracted Text
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-auto max-h-96 p-1">
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap">{extractedText}</pre>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      );
    }
    if (customResponse) {
       return (
        <ScrollArea className="h-auto max-h-96 p-1">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap">{customResponse}</pre>
        </ScrollArea>
       );
    }
    return <p className="text-muted-foreground">No response data to display yet.</p>;
  };
  
  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              {icon}
              {title}
            </CardTitle>
             <Skeleton className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-1/4 mt-4" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            {icon}
            {title}
          </CardTitle>
          {customResponse && !isLoading && (
            <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy response">
              {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
