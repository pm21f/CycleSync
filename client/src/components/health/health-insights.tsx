import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CycleInsight } from "@/types";

interface HealthInsightsProps {
  insights: CycleInsight[];
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Continue logging your cycle to receive personalized health insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
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
      </CardContent>
      <CardFooter>
        <a href="#" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
          View all insights
          <i className="ri-arrow-right-line ml-1"></i>
        </a>
      </CardFooter>
    </Card>
  );
};

export default HealthInsights;
