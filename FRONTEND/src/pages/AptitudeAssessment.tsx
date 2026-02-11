import React, { useState, useEffect } from "react";
import { useApp } from '../contexts/AppContext';
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Puzzle,
  BarChart3,
  BookOpen,
  Code,
  Eye,
  Users,
  TrendingUp,
  Database,
  FileText,
  Zap,
  Settings,
  X
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function AptitudeAssessment() {
  const { state, dispatch } = useApp();
  const [selectedCategories, setSelectedCategories] = useState({
    quantitative: true,
    logical: true,
    dataInterpretation: false,
    verbal: true,
    technical: false,
    abstractReasoning: false,
    situationalJudgment: false
  });
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(25);
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testMode, setTestMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const { width, height } = useWindowSize();

  // Comprehensive category definitions with detailed subcategories
  const categoryInfo = {
    quantitative: {
      name: "🧮 Quantitative Aptitude",
      icon: Calculator,
      description: "Mathematical and numerical problem-solving skills",
      subcategories: {
        arithmetic: "Arithmetic (Percentages, Ratios, Averages, Profit & Loss)",
        interest: "Simple & Compound Interest",
        timeSpeedDistance: "Time, Speed, and Distance",
        timeWork: "Time and Work",
        numberSeries: "Number Series",
        probability: "Probability & Permutations/Combinations",
        simplifications: "Simplifications and Approximations"
      }
    },
    logical: {
      name: "🧠 Logical Reasoning",
      icon: Puzzle,
      description: "Analyze patterns, relationships, and logical sequences",
      subcategories: {
        codingDecoding: "Coding-Decoding",
        bloodRelations: "Blood Relations",
        syllogisms: "Syllogisms",
        directionSense: "Direction Sense Test",
        puzzles: "Puzzles (Seating Arrangements, Floor Puzzles)",
        logicalSequences: "Logical Sequences",
        statements: "Statements & Conclusions / Assumptions",
        causeEffect: "Cause and Effect / Course of Action"
      }
    },
    dataInterpretation: {
      name: "📊 Data Interpretation",
      icon: BarChart3,
      description: "Interpret, compare, and analyze data",
      subcategories: {
        barGraphs: "Bar Graphs",
        pieCharts: "Pie Charts",
        lineGraphs: "Line Graphs",
        tables: "Tables and Caselets",
        mixedData: "Mixed Data Interpretation"
      }
    },
    verbal: {
      name: "🔤 Verbal Ability",
      icon: BookOpen,
      description: "Reading comprehension, grammar, and vocabulary",
      subcategories: {
        readingComprehension: "Reading Comprehension Passages",
        sentenceCorrection: "Sentence Correction / Error Spotting",
        synonymsAntonyms: "Synonyms & Antonyms",
        fillBlanks: "Fill in the Blanks",
        paraJumbles: "Para Jumbles",
        clozeTest: "Cloze Test",
        vocabulary: "Vocabulary-based Questions"
      }
    },
    technical: {
      name: "💻 Technical Aptitude",
      icon: Code,
      description: "Programming logic and computer science concepts",
      subcategories: {
        programmingLogic: "Programming Logic (loops, conditions, algorithms)",
        dataStructures: "Data Structures & OOPs Concepts",
        sqlQueries: "Basic SQL Queries",
        networks: "Computer Networks / Operating Systems",
        pseudoCode: "Pseudo Code and Debugging"
      }
    },
    abstractReasoning: {
      name: "🧩 Abstract Reasoning",
      icon: Eye,
      description: "Pattern recognition and spatial visualization",
      subcategories: {
        figuresSeries: "Series of Figures",
        mirrorImages: "Mirror and Water Images",
        patternCompletion: "Pattern Completion",
        paperFolding: "Paper Folding & Cutting",
        oddOneOut: "Odd-One-Out (Visual Patterns)"
      }
    },
    situationalJudgment: {
      name: "⚙️ Situational Judgment",
      icon: Users,
      description: "Decision-making, work behavior, and personality fit",
      subcategories: {
        workScenarios: "Work Scenarios & Reactions",
        ethicalJudgment: "Ethical Judgment",
        teamwork: "Teamwork & Leadership Preference",
        personalityTraits: "Personality Trait Indicators"
      }
    }
  };

  // Comprehensive question bank organized by categories and subcategories
  const questionBank = {
    quantitative: {
      arithmetic: [
        {
          id: 1,
          category: "quantitative",
          subcategory: "arithmetic",
          question: "If 25% of a number is 75, what is 40% of the same number?",
          options: ["100", "120", "150", "180"],
          correct: 1,
          explanation: "If 25% = 75, then 100% = 300. So 40% of 300 = 120",
          difficulty: "medium"
        },
        {
          id: 2,
          category: "quantitative",
          subcategory: "arithmetic",
          question: "The ratio of boys to girls in a class is 3:2. If there are 15 boys, how many girls are there?",
          options: ["8", "10", "12", "15"],
          correct: 1,
          explanation: "Ratio 3:2 means for every 3 boys, there are 2 girls. If 15 boys = 3×5, then girls = 2×5 = 10",
          difficulty: "easy"
        },
        {
          id: 3,
          category: "quantitative",
          subcategory: "arithmetic",
          question: "A shopkeeper sells an item for ₹450 and makes a profit of 25%. What was the cost price?",
          options: ["₹350", "₹360", "₹375", "₹400"],
          correct: 1,
          explanation: "SP = CP + 25% of CP = 1.25 × CP. So 450 = 1.25 × CP, therefore CP = 360",
          difficulty: "medium"
        }
      ],
      interest: [
        {
          id: 4,
          category: "quantitative",
          subcategory: "interest",
          question: "What is the simple interest on ₹5000 at 8% per annum for 3 years?",
          options: ["₹1000", "₹1200", "₹1500", "₹1800"],
          correct: 1,
          explanation: "SI = (P × R × T) / 100 = (5000 × 8 × 3) / 100 = ₹1200",
          difficulty: "easy"
        },
        {
          id: 5,
          category: "quantitative",
          subcategory: "interest",
          question: "The compound interest on ₹10,000 at 10% per annum for 2 years is:",
          options: ["₹2000", "₹2100", "₹2200", "₹2500"],
          correct: 1,
          explanation: "CI = P(1+R/100)^T - P = 10000(1.1)^2 - 10000 = 12100 - 10000 = ₹2100",
          difficulty: "medium"
        }
      ],
      timeSpeedDistance: [
        {
          id: 6,
          category: "quantitative",
          subcategory: "timeSpeedDistance",
          question: "A car travels 240 km in 4 hours. What is its speed in km/h?",
          options: ["50", "60", "70", "80"],
          correct: 1,
          explanation: "Speed = Distance / Time = 240 / 4 = 60 km/h",
          difficulty: "easy"
        },
        {
          id: 7,
          category: "quantitative",
          subcategory: "timeSpeedDistance",
          question: "Two trains are moving towards each other at speeds of 60 km/h and 40 km/h. They meet after 2 hours. What was the initial distance between them?",
          options: ["180 km", "200 km", "220 km", "240 km"],
          correct: 1,
          explanation: "Relative speed = 60 + 40 = 100 km/h. Distance = Speed × Time = 100 × 2 = 200 km",
          difficulty: "medium"
        }
      ]
    },
    logical: {
      codingDecoding: [
        {
          id: 8,
          category: "logical",
          subcategory: "codingDecoding",
          question: "If BOOK is coded as CPPL, how is WORD coded?",
          options: ["XPSE", "XQSE", "YPSE", "YQSE"],
          correct: 0,
          explanation: "Each letter is shifted by +1: B→C, O→P, O→P, K→L. So W→X, O→P, R→S, D→E = XPSE",
          difficulty: "medium"
        },
        {
          id: 9,
          category: "logical",
          subcategory: "codingDecoding",
          question: "In a certain code, CHAIR is written as FKDLU. How is TABLE written?",
          options: ["WDEOH", "WDCOH", "WDEOI", "WDCOI"],
          correct: 0,
          explanation: "Each letter is shifted by +3: C→F, H→K, A→D, I→L, R→U. So T→W, A→D, B→E, L→O, E→H = WDEOH",
          difficulty: "hard"
        }
      ],
      bloodRelations: [
        {
          id: 10,
          category: "logical",
          subcategory: "bloodRelations",
          question: "Pointing to a man, a woman said 'His mother is the only daughter of my mother'. How is the woman related to the man?",
          options: ["Mother", "Sister", "Aunt", "Grandmother"],
          correct: 0,
          explanation: "The only daughter of my mother = myself. So his mother is the woman herself, making her his mother",
          difficulty: "medium"
        }
      ],
      syllogisms: [
        {
          id: 11,
          category: "logical",
          subcategory: "syllogisms",
          question: "All roses are flowers. Some flowers are red. Therefore:",
          options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
          correct: 3,
          explanation: "We cannot determine the color of roses from the given information",
          difficulty: "medium"
        }
      ]
    },
    dataInterpretation: [
      {
        id: 12,
        category: "dataInterpretation",
        subcategory: "barGraphs",
        question: "A bar graph shows sales: Q1: 100, Q2: 150, Q3: 120, Q4: 180. What is the percentage increase from Q1 to Q4?",
        options: ["60%", "70%", "80%", "90%"],
        correct: 2,
        explanation: "Percentage increase = ((180-100)/100) × 100 = 80%",
        difficulty: "medium"
      },
      {
        id: 13,
        category: "dataInterpretation",
        subcategory: "pieCharts",
        question: "In a pie chart, if Product A represents 120° out of 360°, what percentage does it represent?",
        options: ["25%", "30%", "33.33%", "40%"],
        correct: 2,
        explanation: "Percentage = (120/360) × 100 = 33.33%",
        difficulty: "easy"
      }
    ],
    verbal: {
      readingComprehension: [
        {
          id: 14,
          category: "verbal",
          subcategory: "readingComprehension",
          question: "Choose the word most similar in meaning to 'ABUNDANT':",
          options: ["Scarce", "Plentiful", "Limited", "Rare"],
          correct: 1,
          explanation: "Abundant means plentiful or existing in large quantities",
          difficulty: "easy"
        }
      ],
      synonymsAntonyms: [
        {
          id: 15,
          category: "verbal",
          subcategory: "synonymsAntonyms",
          question: "What is the antonym of 'EXPAND'?",
          options: ["Grow", "Contract", "Increase", "Enlarge"],
          correct: 1,
          explanation: "Contract means to become smaller, opposite of expand",
          difficulty: "easy"
        }
      ]
    },
    technical: {
      programmingLogic: [
        {
          id: 16,
          category: "technical",
          subcategory: "programmingLogic",
          question: "What is the output of this pseudocode? \nfor i = 1 to 3 \n  print i * 2 \nend for",
          options: ["1 2 3", "2 4 6", "3 6 9", "1 4 9"],
          correct: 1,
          explanation: "The loop prints i*2 for i=1,2,3, which gives 2,4,6",
          difficulty: "easy"
        }
      ],
      dataStructures: [
        {
          id: 17,
          category: "technical",
          subcategory: "dataStructures",
          question: "Which data structure uses LIFO (Last In, First Out) principle?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correct: 1,
          explanation: "Stack follows LIFO principle where the last element added is the first to be removed",
          difficulty: "easy"
        }
      ]
    },
    abstractReasoning: [
      {
        id: 18,
        category: "abstractReasoning",
        subcategory: "figuresSeries",
        question: "In a sequence of shapes: Circle, Square, Triangle, Circle, Square, ?, what comes next?",
        options: ["Circle", "Square", "Triangle", "Pentagon"],
        correct: 2,
        explanation: "The pattern repeats every 3 shapes: Circle, Square, Triangle",
        difficulty: "easy"
      }
    ],
    situationalJudgment: [
      {
        id: 19,
        category: "situationalJudgment",
        subcategory: "workScenarios",
        question: "Your team member consistently misses deadlines. What's the best approach?",
        options: ["Report to manager immediately", "Have a private conversation first", "Ignore the issue", "Do their work yourself"],
        correct: 1,
        explanation: "A private conversation allows understanding the issue and offering help before escalating",
        difficulty: "medium"
      }
    ]
  };

  // Timer effect
  useEffect(() => {
    if (testMode && timeLeft > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testMode, timeLeft, submitted]);

  const generateQuestions = () => {
    const enabledCategories = Object.entries(selectedCategories)
      .filter(([_, enabled]) => enabled)
      .map(([category, _]) => category);

    if (enabledCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    let selectedQuestions = [];

    // Collect questions from enabled categories
    enabledCategories.forEach(category => {
      if (category === 'quantitative' || category === 'logical' || category === 'verbal' || category === 'technical') {
        // Categories with subcategories
        const categoryQuestions = questionBank[category];
        Object.values(categoryQuestions).forEach(subcategoryQuestions => {
          if (Array.isArray(subcategoryQuestions)) {
            selectedQuestions = [...selectedQuestions, ...subcategoryQuestions];
          }
        });
      } else {
        // Categories without subcategories
        const categoryQuestions = questionBank[category] || [];
        selectedQuestions = [...selectedQuestions, ...categoryQuestions];
      }
    });

    // Filter by difficulty if needed
    if (difficulty !== 'all') {
      selectedQuestions = selectedQuestions.filter(q => q.difficulty === difficulty);
    }

    // Shuffle and limit questions
    selectedQuestions = selectedQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(numQuestions, selectedQuestions.length));

    setQuestions(selectedQuestions);
    setTestMode(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimeLeft(timeLimit * 60);

    // Update app context
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: {
        aptitude: {
          ...state.assessmentProgress.aptitude,
          totalQuestions: selectedQuestions.length,
          currentQuestion: 0,
          answers: {},
          markedForReview: []
        }
      }
    });
  };

  const handleSelect = (optionIndex) => {
    if (!submitted) {
      const newAnswers = { ...userAnswers, [currentQuestionIndex]: optionIndex };
      setUserAnswers(newAnswers);

      // Update app context
      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          aptitude: {
            ...state.assessmentProgress.aptitude,
            answers: newAnswers,
            currentQuestion: currentQuestionIndex
          }
        }
      });
    }
  };

  const toggleMarkForReview = () => {
    const newMarked = markedForReview.includes(currentQuestionIndex)
      ? markedForReview.filter(i => i !== currentQuestionIndex)
      : [...markedForReview, currentQuestionIndex];

    setMarkedForReview(newMarked);

    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: {
        aptitude: {
          ...state.assessmentProgress.aptitude,
          markedForReview: newMarked
        }
      }
    });
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correctCount++;
    });
    setScore(correctCount);
    setSubmitted(true);

    // Calculate category-wise performance
    const categoryPerformance = {};
    questions.forEach((q, i) => {
      if (!categoryPerformance[q.category]) {
        categoryPerformance[q.category] = { correct: 0, total: 0 };
      }
      categoryPerformance[q.category].total++;
      if (userAnswers[i] === q.correct) {
        categoryPerformance[q.category].correct++;
      }
    });

    // Update final results in context
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: {
        aptitude: {
          ...state.assessmentProgress.aptitude,
          answers: userAnswers,
          timeSpent: (timeLimit * 60) - timeLeft,
          categoryPerformance
        }
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      quantitative: 'bg-blue-100 text-blue-800',
      logical: 'bg-green-100 text-green-800',
      dataInterpretation: 'bg-orange-100 text-orange-800',
      verbal: 'bg-purple-100 text-purple-800',
      technical: 'bg-indigo-100 text-indigo-800',
      abstractReasoning: 'bg-pink-100 text-pink-800',
      situationalJudgment: 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Calculator functions
  const handleCalculatorClick = (value: string) => {
    if (value === 'C') {
      setCalculatorDisplay('0');
    } else if (value === '=') {
      try {
        // Safe evaluation - only allows numbers and basic operators
        const result = Function('"use strict"; return (' + calculatorDisplay + ')')();
        setCalculatorDisplay(String(result));
      } catch (error) {
        setCalculatorDisplay('Error');
        setTimeout(() => setCalculatorDisplay('0'), 1000);
      }
    } else if (value === '←') {
      setCalculatorDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setCalculatorDisplay(prev => {
        if (prev === '0' && value !== '.') return value;
        if (prev === 'Error') return value;
        return prev + value;
      });
    }
  };

  // Results screen
  if (submitted) {
    const percentage = Math.round((score / questions.length) * 100);
    const categoryPerformance = {};
    questions.forEach((q, i) => {
      if (!categoryPerformance[q.category]) {
        categoryPerformance[q.category] = { correct: 0, total: 0 };
      }
      categoryPerformance[q.category].total++;
      if (userAnswers[i] === q.correct) {
        categoryPerformance[q.category].correct++;
      }
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          {percentage >= 80 && (
            <Confetti width={width} height={height} numberOfPieces={300} />
          )}

          <div className="bg-white rounded-2xl shadow-lg border p-8 mb-6">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${percentage >= 80 ? 'bg-green-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                <CheckCircle className={`w-8 h-8 ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
              <p className="text-gray-600 mb-4">
                You scored {score} out of {questions.length} questions correctly
              </p>
              <div className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</div>
              <div className={`text-lg font-medium ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </div>
            </div>

            {/* Category-wise Performance */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category-wise Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(categoryPerformance).map(([category, perf]) => {
                  const info = categoryInfo[category];
                  const IconComponent = info?.icon || Brain;
                  const categoryPercentage = Math.round((perf.correct / perf.total) * 100);

                  return (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <IconComponent className="w-5 h-5 mr-2 text-blue-600" />
                          <span className="font-medium text-gray-900">{info?.name || category}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {perf.correct}/{perf.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full ${categoryPercentage >= 80 ? 'bg-green-500' :
                            categoryPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${categoryPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">{categoryPercentage}% correct</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.href = '/results'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Detailed Results
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setTestMode(false);
                  setQuestions([]);
                  setUserAnswers({});
                  setScore(0);
                  setCurrentQuestionIndex(0);
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Take Another Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!testMode ? (
        // Setup Screen
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
          <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg border p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Comprehensive Aptitude Assessment</h1>
              <p className="text-gray-600">Test your skills across multiple domains with detailed subcategory selection</p>
            </div>

            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Assessment Categories *
                  </label>
                  <button
                    onClick={() => setShowSubcategories(!showSubcategories)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {showSubcategories ? 'Hide' : 'Show'} Subcategories
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(categoryInfo).map(([key, info]) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={key} className="border border-gray-200 rounded-lg">
                        <label
                          className={`flex items-start p-4 cursor-pointer transition-all ${selectedCategories[key]
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories[key]}
                            onChange={(e) =>
                              setSelectedCategories({
                                ...selectedCategories,
                                [key]: e.target.checked,
                              })
                            }
                            className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <IconComponent className="w-5 h-5 mr-2 text-blue-600" />
                              <span className="font-medium text-gray-900">{info.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{info.description}</p>

                            {showSubcategories && info.subcategories && (
                              <div className="mt-3 space-y-1">
                                <p className="text-xs font-medium text-gray-700 mb-2">Subcategories:</p>
                                {Object.entries(info.subcategories).map(([subKey, subName]) => (
                                  <div key={subKey} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mb-1">
                                    • {subName}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Test Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={25}>25 Questions</option>
                    <option value={30}>30 Questions</option>
                    <option value={50}>50 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit
                  </label>
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Assessment Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Select at least one category to proceed with the assessment</li>
                  <li>• Questions will be randomly selected from your chosen categories</li>
                  <li>• Each question includes detailed explanations after submission</li>
                  <li>• You can mark questions for review and navigate between them</li>
                  <li>• The test will auto-submit when time expires</li>
                  <li>• Detailed performance analysis will be provided at the end</li>
                </ul>
              </div>

              <button
                onClick={generateQuestions}
                disabled={Object.values(selectedCategories).every(v => !v)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-5 h-5" />
                <span>Start Comprehensive Assessment</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Test Screen
        <div>
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Aptitude Assessment</h1>
                <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className={`font-mono text-lg font-semibold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center space-x-1 transition-colors"
                  title="Calculator"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculator</span>
                </button>
                <button
                  onClick={toggleMarkForReview}
                  className={`px-3 py-1 rounded text-sm font-medium ${markedForReview.includes(currentQuestionIndex)
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {markedForReview.includes(currentQuestionIndex) ? 'Marked' : 'Mark for Review'}
                </button>
              </div>
            </div>
          </div>

          {/* Calculator Popup */}
          {showCalculator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end pt-20 pr-6 z-50" onClick={() => setShowCalculator(false)}>
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                    Calculator
                  </h3>
                  <button
                    onClick={() => setShowCalculator(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Display */}
                <div className="bg-gray-100 rounded-lg p-4 mb-4 border-2 border-gray-200">
                  <div className="text-right text-2xl font-mono font-semibold text-gray-900 break-all">
                    {calculatorDisplay}
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[['C', '←', '/', '*'], ['7', '8', '9', '-'], ['4', '5', '6', '+'], ['1', '2', '3', '='], ['0', '.', '00', '=']].map((row, i) => (
                    <React.Fragment key={i}>
                      {row.map((btn) => (
                        <button
                          key={btn + i}
                          onClick={() => handleCalculatorClick(btn)}
                          className={`
                            p-3 rounded-lg font-semibold text-lg transition-all active:scale-95
                            ${btn === '=' ? 'bg-blue-600 text-white hover:bg-blue-700 col-span-1' :
                              btn === 'C' ? 'bg-red-500 text-white hover:bg-red-600' :
                                ['/', '*', '-', '+'].includes(btn) ? 'bg-orange-500 text-white hover:bg-orange-600' :
                                  btn === '←' ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                                    'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            }
                          `}
                        >
                          {btn}
                        </button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Question */}
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const question = questions[currentQuestionIndex];
                    const category = question?.category;
                    const info = categoryInfo[category];
                    const IconComponent = info?.icon || Brain;

                    return (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getCategoryColor(category)}`}>
                        <IconComponent className="w-4 h-4 mr-1" />
                        {info?.name || category}
                        {question?.subcategory && (
                          <span className="ml-2 text-xs opacity-75">
                            • {question.subcategory}
                          </span>
                        )}
                      </span>
                    );
                  })()}
                </div>
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {questions[currentQuestionIndex]?.question}
              </h2>

              <div className="space-y-3">
                {questions[currentQuestionIndex]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    className={`w-full text-left p-4 border-2 rounded-lg transition-all ${userAnswers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <span className="font-medium text-gray-700 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex gap-2 max-w-md overflow-x-auto">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`w-8 h-8 rounded text-sm font-medium flex-shrink-0 ${userAnswers[i] !== undefined ? 'bg-green-100 text-green-800' :
                      markedForReview.includes(i) ? 'bg-yellow-100 text-yellow-800' :
                        i === currentQuestionIndex ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
