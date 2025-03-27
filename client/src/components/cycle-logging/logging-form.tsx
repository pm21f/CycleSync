import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FLOW_OPTIONS, SYMPTOM_OPTIONS, MOOD_OPTIONS } from "@/lib/constants";
import { CycleEntry } from "@/types";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  periodFlow: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  moods: z.array(z.string()).optional(),
  notes: z.string().optional()
});

interface LoggingFormProps {
  selectedDate: Date;
  existingEntry?: CycleEntry;
}

const LoggingForm: React.FC<LoggingFormProps> = ({ selectedDate, existingEntry }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      periodFlow: existingEntry?.periodFlow || "none",
      symptoms: existingEntry?.symptoms || [],
      moods: existingEntry?.moods || [],
      notes: existingEntry?.notes || ""
    }
  });
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest(
        existingEntry ? "PUT" : "POST",
        existingEntry 
          ? `/api/cycle-entries/${existingEntry.id}` 
          : "/api/cycle-entries",
        {
          ...data,
          userId: user?.id,
          date: selectedDate
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Entry for ${format(selectedDate, "MMM dd, yyyy")} has been saved.`,
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/cycle-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cycle-predictions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Update form when existingEntry changes
  useEffect(() => {
    if (existingEntry) {
      form.reset({
        periodFlow: existingEntry.periodFlow || "none",
        symptoms: existingEntry.symptoms || [],
        moods: existingEntry.moods || [],
        notes: existingEntry.notes || ""
      });
    } else {
      form.reset({
        periodFlow: "none",
        symptoms: [],
        moods: [],
        notes: ""
      });
    }
  }, [existingEntry, form]);
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Log</CardTitle>
          <div className="text-primary font-medium text-sm">
            {format(selectedDate, "MMMM dd, yyyy")}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Period Flow Section */}
            <div className="mb-6">
              <FormField
                control={form.control}
                name="periodFlow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium mb-3">Period Flow</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {FLOW_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={field.value === option.value ? "default" : "outline"}
                          className={
                            field.value === option.value
                              ? "bg-primary text-white"
                              : "text-neutral-500 hover:bg-neutral-50"
                          }
                          onClick={() => field.onChange(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Symptoms Section */}
            <div className="mb-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium mb-3">Symptoms</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {SYMPTOM_OPTIONS.map((symptom) => {
                        const isSelected = field.value?.includes(symptom.id);
                        return (
                          <div
                            key={symptom.id}
                            onClick={() => {
                              const newSymptoms = isSelected
                                ? field.value?.filter(id => id !== symptom.id) || []
                                : [...(field.value || []), symptom.id];
                              field.onChange(newSymptoms);
                            }}
                            className={`rounded-lg border p-3 flex flex-col items-center justify-center text-center cursor-pointer ${
                              isSelected
                                ? "border-secondary bg-secondary/5"
                                : "border-neutral-200 hover:bg-neutral-50"
                            }`}
                          >
                            <i className={`${symptom.icon} ${isSelected ? "text-secondary" : "text-neutral-400"} text-xl mb-1`}></i>
                            <span className={`text-xs ${isSelected ? "text-neutral-700" : "text-neutral-600"}`}>
                              {symptom.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Mood Section */}
            <div className="mb-6">
              <FormField
                control={form.control}
                name="moods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium mb-3">Mood</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {MOOD_OPTIONS.map((mood) => {
                        const isSelected = field.value?.includes(mood.id);
                        return (
                          <Button
                            key={mood.id}
                            type="button"
                            variant={isSelected ? "secondary" : "outline"}
                            className={
                              isSelected
                                ? "bg-primary/10 text-primary border-primary"
                                : "text-neutral-500 hover:bg-neutral-50"
                            }
                            onClick={() => {
                              const newMoods = isSelected
                                ? field.value?.filter(id => id !== mood.id) || []
                                : [...(field.value || []), mood.id];
                              field.onChange(newMoods);
                            }}
                          >
                            {mood.emoji} {mood.label}
                          </Button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Notes Section */}
            <div className="mb-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium mb-3">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about your day..."
                        rows={3}
                        className="shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isPending}
                className="shadow-sm"
              >
                {isPending ? "Saving..." : "Save Today's Log"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoggingForm;
