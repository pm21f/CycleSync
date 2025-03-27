import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertIcon } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CycleInsight } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useCycle } from "@/hooks/use-cycle";
import { INSIGHT_CATEGORIES, MENSTRUAL_PHASES } from "@/lib/constants";

const InsightsPage: React.FC = () => {
  const { user } = useAuth();
  const { entries, prediction, summary } = useCycle();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Generate insights based on data
  const generateInsights = (): CycleInsight[] => {
    const insights: CycleInsight[] = [];
    
    if (!summary) return insights;
    
    // Cycle length insights
    if (summary.cycleLength < 21) {
      insights.push({
        title: "Short Cycle Pattern",
        description: "Your cycles are consistently shorter than 21 days. This could be normal for you, but might be worth discussing with a healthcare provider.",
        icon: "ri-heart-pulse-line",
        urgent: true
      });
    } else if (summary.cycleLength > 35) {
      insights.push({
        title: "Long Cycle Pattern",
        description: "Your cycles are consistently longer than 35 days. This could be normal for you, but might be worth discussing with a healthcare provider, especially if it's a recent change.",
        icon: "ri-heart-pulse-line",
        urgent: true
      });
    }
    
    // Period length insights
    if (summary.periodLength > 7) {
      insights.push({
        title: "Extended Period Duration",
        description: "Your periods typically last longer than 7 days. If this is accompanied by heavy bleeding, consider consulting a healthcare provider.",
        icon: "ri-droplet-line",
        urgent: true
      });
    }
    
    // Variability insights
    if (entries.length >= 3) {
      // Check for consistency
      insights.push({
        title: "Regular Cycle Pattern",
        description: `Your cycles have been consistent for the past few months, averaging ${summary.cycleLength} days.`,
        icon: "ri-heart-line",
        urgent: false
      });
    }
    
    // Current cycle phase insights
    if (summary.currentCycleDay <= summary.periodLength) {
      insights.push({
        title: "Menstrual Phase",
        description: "You're currently in your menstrual phase. Focus on self-care, staying hydrated, and gentle exercise if comfortable.",
        icon: "ri-water-flash-line",
        urgent: false
      });
    } else if (summary.ovulation.daysCount === 0) {
      insights.push({
        title: "Ovulation Day",
        description: "Today is your estimated ovulation day. You may experience increased discharge and slight cramping.",
        icon: "ri-egg-line",
        urgent: false
      });
    } else if (summary.fertility.daysCount >= -3 && summary.fertility.daysCount <= 3) {
      insights.push({
        title: "Fertile Window",
        description: "You're currently in your fertile window. If trying to conceive, this is an optimal time.",
        icon: "ri-seedling-line",
        urgent: false
      });
    }
    
    // Always add a general tip
    insights.push({
      title: "Cycle Tracking Tip",
      description: "Consistent tracking improves prediction accuracy. Try logging your symptoms daily for the most personalized insights.",
      icon: "ri-information-line",
      urgent: false
    });
    
    return insights;
  };

  const insights = generateInsights();

  // Filter insights by category
  const filteredInsights = selectedCategory === "all" 
    ? insights 
    : insights.filter(insight => {
        if (selectedCategory === "cycle" && (insight.title.includes("Cycle") || insight.title.includes("Period"))) return true;
        if (selectedCategory === "symptoms" && insight.title.includes("Symptom")) return true;
        if (selectedCategory === "mood" && insight.title.includes("Mood")) return true;
        if (selectedCategory === "fertility" && (insight.title.includes("Fertile") || insight.title.includes("Ovulation"))) return true;
        return false;
      });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-800 mb-2">Health Insights</h1>
        <p className="text-neutral-500">Understand your cycle patterns and get personalized health recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <CardTitle>Your Insights</CardTitle>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {INSIGHT_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {filteredInsights.length > 0 ? (
                <div className="space-y-4">
                  {filteredInsights.map((insight, index) => (
                    <div 
                      key={index} 
                      className={`rounded-lg ${
                        insight.urgent 
                          ? "bg-primary/5 border border-primary/20" 
                          : "bg-neutral-50 border border-neutral-200"
                      } p-4`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <i className={`${insight.icon} ${insight.urgent ? "text-primary" : "text-neutral-500"} text-lg`}></i>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-neutral-800">{insight.title}</h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
                    <i className="ri-file-search-line text-4xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700">No insights found</h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    Continue tracking your cycle to receive personalized insights in this category.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cycle Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="pt-4">
                  {summary ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-700">Average Cycle Length</h3>
                        <p className="text-2xl font-bold text-neutral-800 mt-1">{summary.cycleLength} days</p>
                        <p className="text-xs text-neutral-500">Based on your tracking history</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-700">Average Period Length</h3>
                        <p className="text-2xl font-bold text-neutral-800 mt-1">{summary.periodLength} days</p>
                        <p className="text-xs text-neutral-500">Based on your tracking history</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-700">Current Cycle</h3>
                        <p className="text-2xl font-bold text-neutral-800 mt-1">Day {summary.currentCycleDay}</p>
                        <p className="text-xs text-neutral-500">of {summary.totalCycleDays} days</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                        <h3 className="text-sm font-medium text-neutral-700">Next Period</h3>
                        <p className="text-2xl font-bold text-neutral-800 mt-1">{summary.nextPeriod.date}</p>
                        <p className="text-xs text-neutral-500">{summary.nextPeriod.timeUntil}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-600">
                        Track at least one complete cycle to see your summary.
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="patterns" className="pt-4">
                  <div className="text-center py-8">
                    <p className="text-neutral-600">
                      Cycle pattern analytics will be available after tracking for at least 3 months.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="trends" className="pt-4">
                  <div className="text-center py-8">
                    <p className="text-neutral-600">
                      Long-term trend analysis will be available after more tracking data is gathered.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Current Phase */}
          <Card>
            <CardHeader>
              <CardTitle>Current Cycle Phase</CardTitle>
            </CardHeader>
            <CardContent>
              {summary ? (
                <div>
                  {/* Determine current phase */}
                  {(() => {
                    const currentDay = summary.currentCycleDay;
                    let currentPhase;
                    
                    if (currentDay <= 5) {
                      currentPhase = MENSTRUAL_PHASES[0]; // Menstrual
                    } else if (currentDay <= 13) {
                      currentPhase = MENSTRUAL_PHASES[1]; // Follicular
                    } else if (currentDay <= 15) {
                      currentPhase = MENSTRUAL_PHASES[2]; // Ovulatory
                    } else {
                      currentPhase = MENSTRUAL_PHASES[3]; // Luteal
                    }
                    
                    return (
                      <div className="rounded-lg border border-neutral-200 p-4">
                        <h3 className="font-medium text-neutral-800" style={{ color: currentPhase.color }}>
                          {currentPhase.name}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-2">
                          {currentPhase.description}
                        </p>
                        <div className="mt-3">
                          <h4 className="text-xs text-neutral-700 font-medium">Tips:</h4>
                          <ul className="text-xs text-neutral-600 list-disc pl-4 mt-1 space-y-1">
                            {currentPhase.tips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-neutral-600">
                    Start tracking your cycle to see your current phase.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Information */}
          <Alert className="bg-primary/5 border-primary/20 text-primary-foreground">
            <AlertIcon className="h-4 w-4 text-primary" />
            <AlertTitle>Disclaimer</AlertTitle>
            <AlertDescription className="text-sm text-neutral-600">
              This app provides general insights and is not a substitute for professional medical advice. 
              Always consult a healthcare provider for medical concerns.
            </AlertDescription>
          </Alert>

          {/* Health Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Health Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-neutral-200 p-4 hover:border-primary/30 hover:bg-neutral-50 cursor-pointer">
                <h3 className="text-sm font-medium text-neutral-800">Understanding Irregular Cycles</h3>
                <p className="text-xs text-neutral-500 mt-1">Common causes and when to seek help</p>
              </div>
              
              <div className="rounded-lg border border-neutral-200 p-4 hover:border-primary/30 hover:bg-neutral-50 cursor-pointer">
                <h3 className="text-sm font-medium text-neutral-800">PCOS Awareness</h3>
                <p className="text-xs text-neutral-500 mt-1">Symptoms, diagnosis, and management</p>
              </div>
              
              <div className="rounded-lg border border-neutral-200 p-4 hover:border-primary/30 hover:bg-neutral-50 cursor-pointer">
                <h3 className="text-sm font-medium text-neutral-800">Hormone Health 101</h3>
                <p className="text-xs text-neutral-500 mt-1">Understanding your hormonal balance</p>
              </div>
              
              <Button variant="outline" className="w-full text-primary border-primary/20">
                View All Health Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
