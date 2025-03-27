import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertIcon } from "@/components/icons";
import { CycleSummary, CycleInsight } from "@/types";

interface CycleInsightsCardProps {
  cycleSummary: CycleSummary | null;
  insights: CycleInsight[];
}

const CycleInsightsCard: React.FC<CycleInsightsCardProps> = ({ 
  cycleSummary,
  insights 
}) => {
  if (!cycleSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cycle Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Start logging your cycle to see insights here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { 
    currentCycleDay, 
    totalCycleDays, 
    nextPeriod, 
    fertility, 
    ovulation, 
    cycleLength, 
    periodLength 
  } = cycleSummary;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cycle Insights</CardTitle>
          <div className="text-neutral-500 text-sm">
            Day {currentCycleDay} of {totalCycleDays}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto pb-4 space-x-3 mb-4">
          <div className="flex-shrink-0 w-28 h-20 rounded-lg bg-primary/10 flex flex-col items-center justify-center p-2 text-center">
            <div className="text-primary text-sm font-medium">Next Period</div>
            <div className="text-neutral-700 font-semibold mt-1">{nextPeriod.date}</div>
            <div className="text-xs text-neutral-500">{nextPeriod.timeUntil}</div>
          </div>
          
          <div className="flex-shrink-0 w-28 h-20 rounded-lg bg-secondary/10 flex flex-col items-center justify-center p-2 text-center">
            <div className="text-secondary text-sm font-medium">Fertility</div>
            <div className="text-neutral-700 font-semibold mt-1">
              {fertility.daysCount === 0 ? "Today" : fertility.daysCount > 0 ? "Coming" : "Passed"}
            </div>
            <div className="text-xs text-neutral-500">{fertility.date}</div>
          </div>
          
          <div className="flex-shrink-0 w-28 h-20 rounded-lg bg-accent/10 flex flex-col items-center justify-center p-2 text-center">
            <div className="text-accent text-sm font-medium">Ovulation</div>
            <div className="text-neutral-700 font-semibold mt-1">
              {ovulation.daysCount === 0 ? "Today!" : ovulation.daysCount > 0 ? "Coming" : "Passed"}
            </div>
            <div className="text-xs text-neutral-500">{ovulation.date}</div>
          </div>
          
          <div className="flex-shrink-0 w-28 h-20 rounded-lg bg-neutral-100 flex flex-col items-center justify-center p-2 text-center">
            <div className="text-neutral-600 text-sm font-medium">Cycle Length</div>
            <div className="text-neutral-700 font-semibold mt-1">{cycleLength} days</div>
            <div className="text-xs text-neutral-500">Average</div>
          </div>
          
          <div className="flex-shrink-0 w-28 h-20 rounded-lg bg-neutral-100 flex flex-col items-center justify-center p-2 text-center">
            <div className="text-neutral-600 text-sm font-medium">Period Length</div>
            <div className="text-neutral-700 font-semibold mt-1">{periodLength} days</div>
            <div className="text-xs text-neutral-500">Average</div>
          </div>
        </div>
        
        {insights.length > 0 && (
          <div className="relative rounded-lg p-4 border border-amber-200 bg-amber-50 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertIcon className="text-amber-500 h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">{insights[0].title}</h3>
                <div className="mt-1 text-sm text-amber-700">
                  {insights[0].description}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CycleInsightsCard;
