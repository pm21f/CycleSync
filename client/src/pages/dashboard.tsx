import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { buildCalendarDays, calculateCycleSummary } from "@/lib/utils";
import { CycleEntry, CyclePrediction, CycleInsight, CalendarDay } from "@/types";
import Calendar from "@/components/calendar/calendar";
import CycleInsightsCard from "@/components/cycle-insights/insights-card";
import LoggingForm from "@/components/cycle-logging/logging-form";
import HealthInsights from "@/components/health/health-insights";
import ResourceCard from "@/components/resources/resource-card";
import CommunityCard from "@/components/community/community-card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDayEntry, setSelectedDayEntry] = useState<CycleEntry | undefined>(undefined);

  // Fetch cycle entries
  const { data: cycleEntries = [], isLoading: isLoadingEntries } = useQuery({
    queryKey: ["/api/cycle-entries", { userId: user?.id }],
    queryFn: async () => {
      const res = await fetch(`/api/cycle-entries?userId=${user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch cycle entries');
      return res.json();
    },
    enabled: !!user?.id
  });

  // Fetch cycle prediction
  const { data: cyclePrediction, isLoading: isLoadingPrediction } = useQuery({
    queryKey: ["/api/cycle-predictions/current", { userId: user?.id }],
    queryFn: async () => {
      const res = await fetch(`/api/cycle-predictions/current?userId=${user?.id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch cycle prediction');
      return res.json();
    },
    enabled: !!user?.id
  });

  // Fetch resources
  const { data: resources = [], isLoading: isLoadingResources } = useQuery({
    queryKey: ["/api/resources"],
    queryFn: async () => {
      const res = await fetch("/api/resources");
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json();
    }
  });

  // Fetch community posts
  const { data: communityPosts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["/api/community-posts"],
    queryFn: async () => {
      const res = await fetch("/api/community-posts");
      if (!res.ok) throw new Error('Failed to fetch community posts');
      return res.json();
    }
  });

  // Calculate cycle summary
  const cycleSummary = calculateCycleSummary(cycleEntries, cyclePrediction);

  // Generate insights based on data
  const insights: CycleInsight[] = [];
  
  if (cycleSummary) {
    if (cycleSummary.cycleLength < 21 || cycleSummary.cycleLength > 35) {
      insights.push({
        title: "Cycle Length Variation",
        description: "Your cycle length is outside the typical 21-35 day range. This could be normal for you, but consider tracking consistently.",
        icon: "ri-information-line",
        urgent: true
      });
    }
    
    if (cycleSummary.currentCycleDay === cycleSummary.totalCycleDays) {
      insights.push({
        title: "Period Due Soon",
        description: "Your period is expected to start soon based on your cycle history. Prepare with supplies and self-care.",
        icon: "ri-calendar-event-line",
        urgent: false
      });
    }
  }

  // Update calendar days when month, entries, or prediction changes
  useEffect(() => {
    if (cycleEntries) {
      setCalendarDays(buildCalendarDays(currentMonth, cycleEntries, cyclePrediction));
    }
  }, [currentMonth, cycleEntries, cyclePrediction]);

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Handle day selection
  const handleSelectDay = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedDayEntry(day.entry);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-800 mb-2">Your Cycle Dashboard</h1>
        <p className="text-neutral-500">Track, predict, and understand your menstrual health</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cycle Insights Card */}
          <CycleInsightsCard 
            cycleSummary={cycleSummary}
            insights={insights}
          />

          {/* Calendar Section */}
          <Card className="p-6">
            <Calendar
              days={calendarDays}
              currentMonth={currentMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelectDay={handleSelectDay}
            />
          </Card>

          {/* Logging Form */}
          <LoggingForm
            selectedDate={selectedDate}
            existingEntry={selectedDayEntry}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Health Insights */}
          <HealthInsights insights={insights} />
          
          {/* Recommended Resources */}
          <ResourceCard resources={resources} />
          
          {/* Community Card */}
          <CommunityCard posts={communityPosts} />
          
          {/* Consultation Card */}
          <div className="bg-gradient-to-r from-secondary/90 to-primary/90 rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Need Expert Advice?</h2>
            <p className="text-white/90 text-sm mb-4">
              Connect with gynecologists and healthcare professionals for personalized guidance.
            </p>
            
            <button className="w-full bg-white text-primary font-medium py-2 rounded-lg text-sm hover:bg-neutral-100 transition-colors">
              Book a Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
