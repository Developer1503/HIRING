export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experienceLevel: 'fresher' | '1-3' | '3+';
  preferredRole: string;
  avatar?: string;
}

export interface AssessmentAttempt {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completed: boolean;
}

export interface DSAQuestion {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  statement: string;
  examples: { input: string; output: string }[];
  constraints: string[];
  template: { [language: string]: string };
}

export interface AptitudeQuestion {
  id: string;
  category: 'quantitative' | 'logical' | 'verbal';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  marks: { correct: number; incorrect: number };
}

export interface InterviewQuestion {
  id: string;
  type: 'technical' | 'behavioral' | 'hr';
  question: string;
  expectedDuration: number;
  tips: string[];
}

export interface AssessmentProgress {
  dsa: {
    currentQuestion: number;
    totalQuestions: number;
    completedQuestions: string[];
    answers: { [questionId: string]: string };
    timeSpent: number;
    solvedCount?: number;
    successRate?: number;
    avgTimePerQuestion?: number;
    categoryStats?: { [category: string]: { total: number; solved: number; name: string } };
    difficultyStats?: { easy: { total: number; solved: number }; medium: { total: number; solved: number }; hard: { total: number; solved: number } };
    languageUsage?: { [language: string]: number };
    strongAreas?: string;
    weakAreas?: string;
  };
  aptitude: {
    currentQuestion: number;
    totalQuestions: number;
    answers: { [questionId: string]: number };
    markedForReview: string[];
    timeSpent: number;
  };
  interview: {
    currentQuestion: number;
    totalQuestions: number;
    recordings: { [questionId: string]: boolean };
    timeSpent: number;
  };
}

export interface AnalyticsData {
  overallScore: number;
  percentile: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  dsaAnalytics: {
    topicPerformance: { [topic: string]: number };
    difficultyAnalysis: { easy: number; medium: number; hard: number };
    timeEfficiency: number;
  };
  aptitudeAnalytics: {
    categoryScores: { quantitative: number; logical: number; verbal: number };
    timeManagement: number;
    accuracyTrend: number[];
  };
  interviewAnalytics: {
    communicationScore: number;
    responseLength: number;
    speakingPace: number;
    confidenceLevel: number;
  };
}

export interface ResumeAnalysis {
  id: string;
  fileName: string;
  analysis: {
    overallScore: number;
    sections: {
      contact: { score: number; feedback: string };
      summary: { score: number; feedback: string };
      experience: { score: number; feedback: string };
      education: { score: number; feedback: string };
      skills: { score: number; feedback: string };
      projects: { score: number; feedback: string };
    };
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    keywords: {
      technical: string[];
      soft: string[];
      missing: string[];
    };
    atsScore: number;
    readabilityScore: number;
  };
  createdAt: string;
}