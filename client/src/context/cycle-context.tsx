import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CycleEntry, CyclePrediction, CycleSummary } from '@/types';
import { calculateCycleSummary } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface CycleContextType {
  entries: CycleEntry[];
  prediction: CyclePrediction | null;
  summary: CycleSummary | null;
  isLoading: boolean;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  refreshCycleData: () => void;
}

export const CycleContext = createContext<CycleContextType>({
  entries: [],
  prediction: null,
  summary: null,
  isLoading: true,
  selectedDate: new Date(),
  setSelectedDate: () => {},
  refreshCycleData: () => {},
});

interface CycleProviderProps {
  children: ReactNode;
}

export const CycleProvider: React.FC<CycleProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Fetch cycle entries
  const {
    data: entries = [],
    isLoading: isEntriesLoading,
    refetch: refetchEntries,
  } = useQuery({
    queryKey: ['/api/cycle-entries', { userId: user?.id }],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/cycle-entries?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch cycle entries');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch cycle prediction
  const {
    data: prediction = null,
    isLoading: isPredictionLoading,
    refetch: refetchPrediction,
  } = useQuery({
    queryKey: ['/api/cycle-predictions/current', { userId: user?.id }],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/cycle-predictions/current?userId=${user.id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch cycle prediction');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Calculate summary
  const summary = calculateCycleSummary(entries, prediction);

  // Refresh data function
  const refreshCycleData = () => {
    refetchEntries();
    refetchPrediction();
  };

  const isLoading = isEntriesLoading || isPredictionLoading;

  const value = {
    entries,
    prediction,
    summary,
    isLoading,
    selectedDate,
    setSelectedDate,
    refreshCycleData,
  };

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
};
