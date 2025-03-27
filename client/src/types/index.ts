export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  dateOfBirth?: Date;
  createdAt: Date;
}

export interface CycleEntry {
  id: number;
  userId: number;
  date: Date;
  periodFlow?: string; // 'none', 'light', 'medium', 'heavy', 'spotting'
  symptoms?: string[];
  moods?: string[];
  notes?: string;
  createdAt: Date;
}

export interface CyclePrediction {
  id: number;
  userId: number;
  periodStartDate: Date;
  periodEndDate: Date;
  ovulationDate: Date;
  fertileStartDate: Date;
  fertileEndDate: Date;
  createdAt: Date;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
}

export interface CommunityPost {
  id: number;
  userId: number;
  title: string;
  content: string;
  tags: string[];
  responseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodFlowOption {
  value: string;
  label: string;
}

export interface SymptomOption {
  id: string;
  label: string;
  icon: string;
}

export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
}

export interface CalendarDay {
  date: Date;
  isPeriod: boolean;
  isPeriodStart: boolean;
  isPeriodEnd: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  isPrediction: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  entry?: CycleEntry;
}

export interface CycleStage {
  name: string;
  description: string;
  tips: string[];
  start: Date;
  end: Date;
  color: string;
}

export interface CyclePhase {
  name: string;
  date: string;
  timeUntil: string;
  daysCount: number;
}

export interface CycleInsight {
  title: string;
  description: string;
  icon: string;
  urgent: boolean;
}

export interface CycleSummary {
  cycleLength: number;
  periodLength: number;
  currentCycleDay: number;
  totalCycleDays: number;
  nextPeriod: CyclePhase;
  fertility: CyclePhase;
  ovulation: CyclePhase;
}
