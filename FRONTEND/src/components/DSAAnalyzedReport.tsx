import React from 'react';
import {
    CheckCircle, BarChart3, Target, Code, Brain, Zap, FileText,
    RotateCcw, ChevronLeft
} from 'lucide-react';

interface DSAAnalyzedReportProps {
    questions: any[];
    completedQuestions: string[];
    answers: any;
    timeLeft: number;
    dsaCategories: any;
    onRetake: () => void;
}

export default function DSAAnalyzedReport({
    questions,
    completedQuestions,
    answers,
    timeLeft,
    dsaCategories,
    onRetake
}: DSAAnalyzedReportProps) {
    // ... full implementation from previous attempt
}
