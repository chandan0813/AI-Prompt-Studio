
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, ThumbsUp, ThumbsDown, Smile, Frown, Meh } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResponseActionsProps {
  responseTextToExport: string | null | undefined;
  responseTitle?: string;
}

type Rating = "good" | "bad" | "neutral" | null;

export function ResponseActions({ responseTextToExport, responseTitle = "AI_Response" }: ResponseActionsProps) {
  const [rating, setRating] = useState<Rating>(null);
  const { toast } = useToast();

  const handleExport = (format: "txt" | "md") => {
    if (!responseTextToExport) {
      toast({ title: "Error", description: "No text to export.", variant: "destructive" });
      return;
    }

    const blob = new Blob([responseTextToExport], { type: format === "md" ? "text/markdown" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${responseTitle}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `Response exported as ${format.toUpperCase()}.` });
  };

  const handleRate = (newRating: Rating) => {
    setRating(newRating);
    // In a real app, this would send feedback to a server
    toast({ title: "Feedback Received", description: `You rated this response as ${newRating}.` });
  };

  const ratingEmojis = [
    { id: "good", icon: <ThumbsUp className="h-5 w-5 text-green-500" />, label: "Good" },
    { id: "neutral", icon: <Meh className="h-5 w-5 text-yellow-500" />, label: "Neutral" },
    { id: "bad", icon: <ThumbsDown className="h-5 w-5 text-red-500" />, label: "Bad" },
  ] as const;


  return (
    <div className="mt-6 p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg bg-card">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground">Rate this response:</p>
        {ratingEmojis.map((emoji) => (
          <Button
            key={emoji.id}
            variant={rating === emoji.id ? "default" : "outline"}
            size="icon"
            onClick={() => handleRate(emoji.id)}
            aria-label={emoji.label}
            className={`rounded-full transition-all ${
              rating === emoji.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
            } hover:scale-110`}
          >
            {emoji.icon}
          </Button>
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={!responseTextToExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Response
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("txt")} disabled={!responseTextToExport}>
            Export as TXT
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("md")} disabled={!responseTextToExport}>
            Export as Markdown
          </DropdownMenuItem>
          {/* PDF export is complex client-side, might need a library like jsPDF or server-side generation */}
          {/* <DropdownMenuItem disabled>Export as PDF (Coming Soon)</DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
