import React, { useState } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { CalendarDay } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarProps {
  days: CalendarDay[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: CalendarDay) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  days,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onSelectDay
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPrevMonth}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-500"
          >
            <i className="ri-arrow-left-s-line"></i>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-500"
          >
            <i className="ri-arrow-right-s-line"></i>
          </Button>
        </div>
      </div>
      
      {/* Calendar Legend */}
      <div className="flex items-center text-xs text-neutral-600 space-x-4 mb-3">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-primary/70 mr-1"></span>
          <span>Period</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-secondary/20 mr-1"></span>
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full border border-dashed border-primary mr-1"></span>
          <span>Predicted</span>
        </div>
      </div>
      
      {/* Days of Week */}
      <div className="grid grid-cols-7 text-center text-xs uppercase text-neutral-500 mb-1">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div 
            key={index}
            onClick={() => onSelectDay(day)}
            className={cn(
              "calendar-day cursor-pointer flex items-center justify-center w-[38px] h-[38px] text-sm",
              {
                "text-neutral-300": !day.isCurrentMonth,
                "text-neutral-700": day.isCurrentMonth && !day.isPeriod && !day.isOvulation,
                "bg-primary/20": day.isPeriod,
                "bg-primary/70 text-white": day.isPeriod && day.isPeriodStart,
                "bg-secondary/15": day.isFertile && !day.isPeriod,
                "border border-dashed border-primary": day.isPrediction,
                "bg-white border border-secondary/30 text-secondary font-medium": day.isOvulation,
                "ring-2 ring-offset-2 ring-primary": day.isToday
              }
            )}
          >
            <span>{format(day.date, 'd')}</span>
            {day.isOvulation && (
              <span className="absolute bottom-[2px] w-[6px] h-[6px] bg-secondary rounded-full"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
