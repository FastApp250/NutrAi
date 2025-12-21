import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, UserProfile, MealLog, DraftMeal } from './types';

interface AppContextType extends AppState {
  setUser: (user: UserProfile) => void;
  addLog: (log: MealLog) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearSession: () => void;
  setDraftMeal: (draft: DraftMeal | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [draftMeal, setDraftMeal] = useState<DraftMeal | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('nutrai_user');
    const storedLogs = localStorage.getItem('nutrai_logs');
    
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
    setLoading(false);
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('nutrai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nutrai_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nutrai_logs', JSON.stringify(logs));
  }, [logs]);

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      setUserState({ ...user, ...updates });
    }
  };

  const addLog = (log: MealLog) => {
    setLogs((prev) => [log, ...prev]);
  };

  const clearSession = () => {
    setUserState(null);
    setLogs([]);
    setDraftMeal(null);
    localStorage.clear();
  };

  return (
    <AppContext.Provider value={{ user, logs, plans: [], loading, draftMeal, setUser, addLog, updateUser, clearSession, setDraftMeal }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};