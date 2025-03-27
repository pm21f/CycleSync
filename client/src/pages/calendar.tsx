import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { buildCalendarDays } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Calendar from "@/components/calendar/calendar";
import LoggingForm from "@/components/cycle-logging/logging-form";
import { CalendarDay } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { generateMonthOptions, generateYearOptions } from "@/lib/utils";
import { MENSTRUAL_PHASES } from "@/lib/constants";

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDayEntry, setSelectedDayEntry] = useState<any | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  
  const monthOptions = generateMonthOptions();
  const yearOptions = generateYearOptions(2020, new Date().getFullYear() + 1);

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

  // Update calendar days when month, entries, or prediction changes
  useEffect(() => {
    if (cycleEntries) {
      setCalendarDays(buildCalendarDays(currentMonth, cycleEntries, cyclePrediction));
    }
  }, [currentMonth, cycleEntries, cyclePrediction]);

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Handle day selection
  const handleSelectDay = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedDayEntry(day.entry);
  };

  // Handle month and year selection
  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(parseInt(value));
    setCurrentMonth(newDate);
  };

  const handleYearChange = (value: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(value));
    setCurrentMonth(newDate);
  };

  // Get current month and year
  const currentMonthIndex = currentMonth.getMonth().toString();
  const currentYear = currentMonth.getFullYear().toString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-800 mb-2">Cycle Calendar</h1>
        <p className="text-neutral-500">View and manage your menstrual cycle data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Calendar View</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={currentMonthIndex} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={currentYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="month" className="mb-6">
                <TabsList className="grid w-[240px] grid-cols-2">
                  <TabsTrigger value="month" onClick={() => setViewMode('month')}>Month View</TabsTrigger>
                  <TabsTrigger value="year" onClick={() => setViewMode('year')}>Year View</TabsTrigger>
                </TabsList>
                <TabsContent value="month" className="pt-4">
                  <Calendar
                    days={calendarDays}
                    currentMonth={currentMonth}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onSelectDay={handleSelectDay}
                  />
                </TabsContent>
                <TabsContent value="year" className="pt-4">
                  <div className="text-center text-neutral-600">
                    Year view shows a compact representation of all months.
                    <p className="text-sm text-neutral-500 mt-2">
                      This feature is under development. Please use month view for now.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Logging Form */}
          <LoggingForm
            selectedDate={selectedDate}
            existingEntry={selectedDayEntry}
          />
        </div>

        {/* Right Column - Information */}
        <div className="space-y-6">
          {/* Selected Day Information */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Day: {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">
                {selectedDayEntry ? (
                  <>This day has logged data. Edit your entry in the form below.</>
                ) : (
                  <>No data recorded for this day. Log your symptoms and mood using the form below.</>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Menstrual Cycle Phases */}
          <Card>
            <CardHeader>
              <CardTitle>Menstrual Cycle Phases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MENSTRUAL_PHASES.map((phase) => (
                  <div key={phase.id} className="rounded-lg border border-neutral-200 p-4">
                    <h3 className="font-medium text-neutral-800" style={{ color: phase.color }}>
                      {phase.name} <span className="text-xs text-neutral-500 font-normal">({phase.days})</span>
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {phase.description}
                    </p>
                    <div className="mt-2">
                      <h4 className="text-xs text-neutral-700 font-medium">Tips:</h4>
                      <ul className="text-xs text-neutral-600 list-disc pl-4 mt-1 space-y-1">
                        {phase.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
