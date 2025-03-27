import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, differenceInDays, format, isSameDay, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, endOfMonth, endOfWeek, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { CalendarDay, CycleEntry, CyclePrediction, CycleSummary } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatStr: string = "MMM dd, yyyy"): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, formatStr);
}

export function getTimeUntil(date: Date | string): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  const today = new Date();
  const days = differenceInDays(parsedDate, today);
  
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

export function buildCalendarDays(
  month: Date,
  entries: CycleEntry[],
  prediction?: CyclePrediction
): CalendarDay[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const today = new Date();
  
  // Helper to check if a date has a period entry
  const hasPeriodEntry = (date: Date): CycleEntry | undefined => {
    return entries.find(entry => 
      isSameDay(parseISO(entry.date.toString()), date) && 
      entry.periodFlow && 
      entry.periodFlow !== 'none'
    );
  };

  // Create calendar days
  const days: CalendarDay[] = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
    const entry = entries.find(e => isSameDay(parseISO(e.date.toString()), date));
    
    // Determine if this day is in a predicted period
    const isPredictedPeriod = prediction && 
      date >= parseISO(prediction.periodStartDate.toString()) && 
      date <= parseISO(prediction.periodEndDate.toString());
    
    // Determine if this day is ovulation
    const isOvulationDay = prediction && 
      isSameDay(parseISO(prediction.ovulationDate.toString()), date);
    
    // Determine if this day is in fertile window
    const isInFertileWindow = prediction && 
      date >= parseISO(prediction.fertileStartDate.toString()) && 
      date <= parseISO(prediction.fertileEndDate.toString());
    
    // Check if period start or end
    const isPeriodStart = entries.some(e => 
      isSameDay(parseISO(e.date.toString()), date) && 
      e.periodFlow && 
      e.periodFlow !== 'none' && 
      !hasPeriodEntry(addDays(date, -1))
    );
    
    const isPeriodEnd = entries.some(e => 
      isSameDay(parseISO(e.date.toString()), date) && 
      e.periodFlow && 
      e.periodFlow !== 'none' && 
      !hasPeriodEntry(addDays(date, 1))
    );
    
    return {
      date,
      isPeriod: !!entry?.periodFlow && entry.periodFlow !== 'none',
      isPeriodStart,
      isPeriodEnd,
      isOvulation: isOvulationDay,
      isFertile: isInFertileWindow,
      isPrediction: isPredictedPeriod && !entry?.periodFlow,
      isToday: isToday(date),
      isCurrentMonth: isSameMonth(date, month),
      entry
    };
  });
  
  return days;
}

export function generateMonthOptions(): { value: string, label: string }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2023, i, 1);
    return {
      value: i.toString(),
      label: format(date, 'MMMM')
    };
  });
}

export function generateYearOptions(startYear = 2020, endYear = 2030): { value: string, label: string }[] {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const year = startYear + i;
    return {
      value: year.toString(),
      label: year.toString()
    };
  });
}

export function calculateCycleSummary(
  entries: CycleEntry[],
  prediction?: CyclePrediction
): CycleSummary | null {
  if (!entries.length) return null;
  
  // Filter to just period entries
  const periodEntries = entries.filter(entry => entry.periodFlow && entry.periodFlow !== 'none');
  if (!periodEntries.length) return null;
  
  // Sort entries by date
  periodEntries.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate average cycle length
  let totalCycleLength = 0;
  let cycleCount = 0;
  
  for (let i = 1; i < periodEntries.length; i++) {
    const prevDate = new Date(periodEntries[i-1].date);
    const currDate = new Date(periodEntries[i].date);
    
    // Check if these are starting dates of periods (not consecutive days)
    if (differenceInDays(currDate, prevDate) > 3) {
      totalCycleLength += differenceInDays(currDate, prevDate);
      cycleCount++;
    }
  }
  
  // Default to 28 if not enough data
  const avgCycleLength = cycleCount > 0 ? Math.round(totalCycleLength / cycleCount) : 28;
  
  // Calculate average period length
  let totalPeriodLength = 0;
  let periodCount = 0;
  let currentPeriod: Date[] = [];
  
  for (let i = 0; i < periodEntries.length; i++) {
    const currDate = new Date(periodEntries[i].date);
    
    if (currentPeriod.length === 0) {
      currentPeriod.push(currDate);
    } else {
      const lastDate = currentPeriod[currentPeriod.length - 1];
      const dayDiff = differenceInDays(currDate, lastDate);
      
      if (dayDiff <= 3) {
        // Still the same period
        currentPeriod.push(currDate);
      } else {
        // New period
        totalPeriodLength += currentPeriod.length;
        periodCount++;
        currentPeriod = [currDate];
      }
    }
  }
  
  // Add the last period if there is one in progress
  if (currentPeriod.length > 0) {
    totalPeriodLength += currentPeriod.length;
    periodCount++;
  }
  
  const avgPeriodLength = periodCount > 0 ? Math.round(totalPeriodLength / periodCount) : 5;
  
  // Current cycle day
  const today = new Date();
  let currentCycleDay = 1;
  let totalCycleDays = avgCycleLength;
  
  // Find the last period start date
  let lastPeriodStartDate: Date | null = null;
  
  // Group period entries by cycle
  const cycles: Date[][] = [];
  let currentCycle: Date[] = [];
  
  for (let i = 0; i < periodEntries.length; i++) {
    const currDate = new Date(periodEntries[i].date);
    
    if (currentCycle.length === 0) {
      currentCycle.push(currDate);
    } else {
      const lastDate = currentCycle[currentCycle.length - 1];
      const dayDiff = differenceInDays(currDate, lastDate);
      
      if (dayDiff <= 3) {
        // Still the same period
        currentCycle.push(currDate);
      } else if (dayDiff <= avgCycleLength) {
        // Still the same cycle but not period
        currentCycle.push(currDate);
      } else {
        // New cycle
        cycles.push([...currentCycle]);
        currentCycle = [currDate];
      }
    }
  }
  
  if (currentCycle.length > 0) {
    cycles.push(currentCycle);
  }
  
  if (cycles.length > 0) {
    const lastCycle = cycles[cycles.length - 1];
    lastPeriodStartDate = lastCycle[0];
    
    currentCycleDay = differenceInDays(today, lastPeriodStartDate) + 1;
    if (currentCycleDay > avgCycleLength) {
      currentCycleDay = currentCycleDay % avgCycleLength;
      if (currentCycleDay === 0) currentCycleDay = avgCycleLength;
    }
  }
  
  // If we have a prediction, use it for next phases
  let nextPeriod = {
    name: "Next Period",
    date: "Unknown",
    timeUntil: "Unknown",
    daysCount: 0
  };
  
  let fertility = {
    name: "Fertility",
    date: "Unknown",
    timeUntil: "Unknown",
    daysCount: 0
  };
  
  let ovulation = {
    name: "Ovulation",
    date: "Unknown",
    timeUntil: "Unknown",
    daysCount: 0
  };
  
  if (prediction) {
    const periodStartDate = new Date(prediction.periodStartDate);
    const fertileStartDate = new Date(prediction.fertileStartDate);
    const ovulationDate = new Date(prediction.ovulationDate);
    
    nextPeriod = {
      name: "Next Period",
      date: format(periodStartDate, "MMM d"),
      timeUntil: getTimeUntil(periodStartDate),
      daysCount: differenceInDays(periodStartDate, today)
    };
    
    fertility = {
      name: "Fertility",
      date: format(fertileStartDate, "MMM d") + "-" + format(new Date(prediction.fertileEndDate), "MMM d"),
      timeUntil: getTimeUntil(fertileStartDate),
      daysCount: differenceInDays(fertileStartDate, today)
    };
    
    ovulation = {
      name: "Ovulation",
      date: format(ovulationDate, "MMM d"),
      timeUntil: getTimeUntil(ovulationDate),
      daysCount: differenceInDays(ovulationDate, today)
    };
  }
  
  return {
    cycleLength: avgCycleLength,
    periodLength: avgPeriodLength,
    currentCycleDay,
    totalCycleDays: avgCycleLength,
    nextPeriod,
    fertility,
    ovulation
  };
}
