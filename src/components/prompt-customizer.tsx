
"use client";

import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider"; // Slider no longer needed
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { handleCustomizePrompt } from "@/lib/actions";
import type { CustomizeAIPromptOutput } from "@/ai/flows/customize-ai-prompts";
import { useToast } from "@/hooks/use-toast";
import { Wand2, AlertCircle, CheckCircle2, PlusCircle, XCircle, Loader2 } from "lucide-react";

const promptCustomizerSchema = z.object({
  promptTemplate: z.string().min(10, "Prompt template must be at least 10 characters."),
  variables: z.array(z.object({
    key: z.string().min(1, "Variable key cannot be empty."),
    value: z.string().min(1, "Variable value cannot be empty."),
  })).optional(),
  preset: z.string().optional(),
  role: z.string().min(1, "Please select a role."),
});

type PromptCustomizerFormData = z.infer<typeof promptCustomizerSchema>;

const presets = [
  { name: "Creative Writing", template: "Write a short story about {{protagonist}} who discovers a {{magical_object}} in {{setting}}.", vars: [{key: "protagonist", value: "a curious explorer"}, {key: "magical_object", value: "glowing orb"}, {key: "setting", value: "an ancient forest"}] },
  { name: "Code Generation (Python)", template: "Generate a Python function that {{description}}.\n\n```python\n# Your code here\n```", vars: [{key:"description", value:"calculates the factorial of a number"}] },
  { name: "Summarization", template: "Summarize the following text concisely:\n\n{{text_to_summarize}}", vars: [{key:"text_to_summarize", value: "Enter long text here..."}] },
  { name: "Email Composer", template: "Draft a {{email_type}} email to {{recipient}} regarding {{subject}}. The tone should be {{tone}}.", vars: [{key:"email_type", value: "follow-up"}, {key:"recipient", value: "a potential client"}, {key:"subject", value: "our last meeting"}, {key:"tone", value: "professional and courteous"}] },
  { name: "Recipe Generator", template: "Create a recipe for {{dish_name}} that includes {{main_ingredient}} and is suitable for a {{dietary_restriction}} diet. The cooking time should be around {{cooking_time}}.", vars: [{key:"dish_name", value: "a quick weekday dinner"}, {key:"main_ingredient", value: "chicken breast"}, {key:"dietary_restriction", value: "gluten-free"}, {key:"cooking_time", value: "30 minutes"}] },
  { name: "Travel Itinerary", template: "Plan a {{duration_days}}-day travel itinerary for a trip to {{destination}}, focusing on {{interest_points}} and suitable for {{traveler_type}}.", vars: [{key:"duration_days", value: "7"}, {key:"destination", value: "Kyoto, Japan"}, {key:"interest_points", value: "historical temples and local cuisine"}, {key:"traveler_type", value: "a solo traveler"}] },
  { name: "Marketing Slogan", template: "Generate a catchy marketing slogan for a {{product_name}} that targets {{target_audience}} and highlights its {{key_benefit}}.", vars: [{key:"product_name", value: "new eco-friendly water bottle"}, {key:"target_audience", value: "environmentally conscious millennials"}, {key:"key_benefit", value: "sustainability and style"}] },
];

const roles = [
  { value: "Prompt Engineer", label: "Prompt Engineer" },
  { value: "Story Teller", label: "Story Teller" },
  { value: "Code Assistant", label: "Code Assistant" },
  { value: "Marketing Copywriter", label: "Marketing Copywriter" },
  { value: "Content Summarizer", label: "Content Summarizer" },
  { value: "Helpful Assistant", label: "Helpful Assistant" },
  { value: "Technical Writer", label: "Technical Writer" },
  { value: "Travel Agent", label: "Travel Agent" },
  { value: "Chef", label: "Chef" },
];


interface PromptCustomizerProps {
  onCustomizationComplete: (output: CustomizeAIPromptOutput) => void;
  onProcessingStart?: () => void;
}

export function PromptCustomizer({ onCustomizationComplete, onProcessingStart }: PromptCustomizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initialPreset = presets.find(p => p.name === "Code Generation (Python)") || presets[0];
  const initialRole = roles[0].value;


  const form = useForm<PromptCustomizerFormData>({
    resolver: zodResolver(promptCustomizerSchema),
    defaultValues: {
      promptTemplate: initialPreset.template,
      variables: initialPreset.vars,
      preset: initialPreset.name,
      role: initialRole,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variables",
  });

  const handlePresetChange = (presetName: string) => {
    const selectedPreset = presets.find(p => p.name === presetName);
    if (selectedPreset) {
      form.reset({
        ...form.getValues(), 
        promptTemplate: selectedPreset.template,
        variables: selectedPreset.vars,
        preset: selectedPreset.name,
      });
    }
  };

  const onSubmit = async (data: PromptCustomizerFormData) => {
    onProcessingStart?.();
    setIsLoading(true);
    setError(null);

    const variablesObject = data.variables?.reduce((obj, item) => {
      obj[item.key] = item.value;
      return obj;
    }, {} as Record<string, string>);

    const result = await handleCustomizePrompt({
      promptTemplate: data.promptTemplate,
      variables: variablesObject,
      role: data.role,
    });

    if ("error" in result) {
      setError(result.error);
      toast({ title: "Customization Error", description: result.error, variant: "destructive" });
      onCustomizationComplete({ result: "" }); 
    } else {
      onCustomizationComplete(result);
      toast({ title: "Success", description: "Prompt processed successfully.", icon: <CheckCircle2 className="h-5 w-5 text-green-500" />});
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Wand2 className="h-7 w-7 text-primary" />
          Customize AI Prompt
        </CardTitle>
        <CardDescription>Fine-tune parameters, roles, and use templates to craft the perfect prompt for your needs.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preset">Load Preset Configuration</Label>
              <Controller
                name="preset"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={(value) => { field.onChange(value); handlePresetChange(value); }} value={field.value}>
                    <SelectTrigger id="preset">
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="role">AI Role</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>}
            </div>
          </div>


          <div>
            <Label htmlFor="promptTemplate">Prompt Template</Label>
            <Controller
              name="promptTemplate"
              control={form.control}
              render={({ field }) => <Textarea id="promptTemplate" {...field} rows={6} placeholder="Enter your prompt template with {{variables}}..." />}
            />
            {form.formState.errors.promptTemplate && <p className="text-sm text-destructive mt-1">{form.formState.errors.promptTemplate.message}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="variables">Template Variables</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Controller
                    name={`variables.${index}.key`}
                    control={form.control}
                    render={({ field: keyField }) => <Input {...keyField} placeholder="Variable Key" className="w-full"/>}
                  />
                  {form.formState.errors.variables?.[index]?.key && <p className="text-sm text-destructive">{form.formState.errors.variables[index]?.key?.message}</p>}
                </div>
                <div className="flex-1 space-y-1">
                  <Controller
                    name={`variables.${index}.value`}
                    control={form.control}
                    render={({ field: valueField }) => <Input {...valueField} placeholder="Variable Value" className="w-full"/>}
                  />
                  {form.formState.errors.variables?.[index]?.value && <p className="text-sm text-destructive">{form.formState.errors.variables[index]?.value?.message}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove variable" className="mt-px self-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Variable
            </Button>
          </div>

          {/* Temperature and Top P sliders removed */}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Response...
              </>
            ) : (
              "Generate with AI"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PromptCustomizer;
