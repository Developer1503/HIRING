import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AssessmentProgress, AnalyticsData, AssessmentAttempt } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  assessmentProgress: AssessmentProgress;
  analytics: AnalyticsData | null;
  assessmentHistory: AssessmentAttempt[];
}

type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<AssessmentProgress> }
  | { type: 'SET_ANALYTICS'; payload: AnalyticsData }
  | { type: 'ADD_ASSESSMENT_ATTEMPT'; payload: AssessmentAttempt }
  | { type: 'RESET_PROGRESS' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  assessmentProgress: {
    dsa: {
      currentQuestion: 0,
      totalQuestions: 10,
      completedQuestions: [],
      answers: {},
      timeSpent: 0,
    },
    aptitude: {
      currentQuestion: 0,
      totalQuestions: 25,
      answers: {},
      markedForReview: [],
      timeSpent: 0,
    },
    interview: {
      currentQuestion: 0,
      totalQuestions: 8,
      recordings: {},
      timeSpent: 0,
    },
  },
  analytics: null,
  assessmentHistory: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        assessmentProgress: { ...state.assessmentProgress, ...action.payload },
      };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    case 'ADD_ASSESSMENT_ATTEMPT':
      return {
        ...state,
        assessmentHistory: [...state.assessmentHistory, action.payload],
      };
    case 'RESET_PROGRESS':
      return { ...state, assessmentProgress: initialState.assessmentProgress };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load data from localStorage on app start
    const savedUser = localStorage.getItem('techHireUser');
    const savedProgress = localStorage.getItem('techHireProgress');
    const savedHistory = localStorage.getItem('techHireHistory');

    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }
    if (savedProgress) {
      dispatch({ type: 'UPDATE_PROGRESS', payload: JSON.parse(savedProgress) });
    }
    if (savedHistory) {
      // Load history from localStorage
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever state changes
    if (state.user) {
      localStorage.setItem('techHireUser', JSON.stringify(state.user));
    }
    localStorage.setItem('techHireProgress', JSON.stringify(state.assessmentProgress));
  }, [state.user, state.assessmentProgress]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}