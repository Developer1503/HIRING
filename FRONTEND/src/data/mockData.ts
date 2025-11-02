import { DSAQuestion, AptitudeQuestion, InterviewQuestion } from '../types';

export const dsaQuestions: DSAQuestion[] = [
  {
    id: 'dsa-1',
    title: 'Two Sum',
    difficulty: 'easy',
    tags: ['Array', 'Hash Table'],
    statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      'Only one valid answer exists'
    ],
    template: {
      javascript: `function twoSum(nums, target) {
    // Your solution here
}`
    }
  },
  {
    id: 'dsa-2',
    title: 'Valid Palindrome',
    difficulty: 'easy',
    tags: ['String', 'Two Pointers'],
    statement: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' }
    ],
    constraints: [
      '1 ≤ s.length ≤ 2 × 10⁵',
      's consists only of printable ASCII characters'
    ],
    template: {
      javascript: `function isPalindrome(s) {
    // Your solution here
}`
    }
  },
  // Add more DSA questions...
];

export const aptitudeQuestions: AptitudeQuestion[] = [
  {
    id: 'apt-1',
    category: 'quantitative',
    question: 'If 3x + 5 = 20, what is the value of x?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    explanation: '3x + 5 = 20, so 3x = 15, therefore x = 5',
    marks: { correct: 4, incorrect: -1 }
  },
  {
    id: 'apt-2',
    category: 'logical',
    question: 'Complete the series: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    correctAnswer: 1,
    explanation: 'The differences are 4, 6, 8, 10, so next difference is 12. 30 + 12 = 42',
    marks: { correct: 4, incorrect: -1 }
  },
  // Add more aptitude questions...
];

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: 'int-1',
    type: 'technical',
    question: 'Explain the concept of closures in JavaScript and provide a practical example.',
    expectedDuration: 180,
    tips: [
      'Start with a clear definition',
      'Provide a code example',
      'Explain the practical benefits'
    ]
  },
  {
    id: 'int-2',
    type: 'behavioral',
    question: 'Tell me about a challenging project you worked on and how you overcame the difficulties.',
    expectedDuration: 200,
    tips: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Be specific about your role',
      'Focus on the learning outcomes'
    ]
  },
  // Add more interview questions...
];

export const generateMockAnalytics = () => ({
  overallScore: 74,
  percentile: 73,
  strengths: ['Logical Reasoning', 'Problem Solving', 'Communication'],
  weaknesses: ['Dynamic Programming', 'Verbal Reasoning', 'System Design'],
  recommendations: [
    'Focus on dynamic programming patterns',
    'Practice verbal reasoning daily',
    'Study system design fundamentals'
  ],
  dsaAnalytics: {
    topicPerformance: {
      'Arrays': 90,
      'Strings': 85,
      'Hash Tables': 75,
      'Trees': 60,
      'Dynamic Programming': 40,
      'Graphs': 55
    },
    difficultyAnalysis: { easy: 90, medium: 62, hard: 25 },
    timeEfficiency: 78
  },
  aptitudeAnalytics: {
    categoryScores: { quantitative: 75, logical: 87, verbal: 67 },
    timeManagement: 85,
    accuracyTrend: [60, 65, 70, 73, 76, 78, 82, 85]
  },
  interviewAnalytics: {
    communicationScore: 85,
    responseLength: 145,
    speakingPace: 142,
    confidenceLevel: 78
  }
});