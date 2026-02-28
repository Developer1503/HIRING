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
  },
  // New data for enhanced visualizations
  weeklyActivity: [
    { week: 'Mon', dsa: 4, aptitude: 2, interview: 1 },
    { week: 'Tue', dsa: 3, aptitude: 3, interview: 0 },
    { week: 'Wed', dsa: 5, aptitude: 1, interview: 2 },
    { week: 'Thu', dsa: 2, aptitude: 4, interview: 1 },
    { week: 'Fri', dsa: 6, aptitude: 2, interview: 3 },
    { week: 'Sat', dsa: 8, aptitude: 5, interview: 2 },
    { week: 'Sun', dsa: 3, aptitude: 1, interview: 0 }
  ],
  scoreDistribution: [
    { range: '0-20', count: 2 },
    { range: '21-40', count: 5 },
    { range: '41-60', count: 12 },
    { range: '61-80', count: 18 },
    { range: '81-100', count: 8 }
  ],
  learningProgress: [
    { week: 'Week 1', dsa: 45, aptitude: 55, interview: 60, overall: 53 },
    { week: 'Week 2', dsa: 50, aptitude: 58, interview: 62, overall: 57 },
    { week: 'Week 3', dsa: 55, aptitude: 63, interview: 65, overall: 61 },
    { week: 'Week 4', dsa: 60, aptitude: 68, interview: 70, overall: 66 },
    { week: 'Week 5', dsa: 63, aptitude: 72, interview: 73, overall: 69 },
    { week: 'Week 6', dsa: 68, aptitude: 75, interview: 78, overall: 74 }
  ],
  skillGapAnalysis: [
    { skill: 'Arrays', current: 90, target: 95 },
    { skill: 'Strings', current: 85, target: 90 },
    { skill: 'DP', current: 40, target: 80 },
    { skill: 'Trees', current: 60, target: 85 },
    { skill: 'Graphs', current: 55, target: 80 },
    { skill: 'System Design', current: 45, target: 85 }
  ],
  timeSpentDistribution: [
    { category: 'DSA Practice', value: 42, color: '#3B82F6' },
    { category: 'Aptitude', value: 25, color: '#8B5CF6' },
    { category: 'Interview Prep', value: 18, color: '#10B981' },
    { category: 'Resume Building', value: 8, color: '#F59E0B' },
    { category: 'Review', value: 7, color: '#EF4444' }
  ],
  interviewPerformanceTrend: [
    { session: 'Session 1', communication: 65, confidence: 55, clarity: 60, overall: 60 },
    { session: 'Session 2', communication: 70, confidence: 62, clarity: 68, overall: 67 },
    { session: 'Session 3', communication: 75, confidence: 68, clarity: 72, overall: 72 },
    { session: 'Session 4', communication: 78, confidence: 72, clarity: 76, overall: 75 },
    { session: 'Session 5', communication: 82, confidence: 75, clarity: 80, overall: 79 },
    { session: 'Session 6', communication: 85, confidence: 78, clarity: 82, overall: 82 }
  ],
  attemptHistory: [
    { attempt: 'Attempt 1', score: 52, time: 120 },
    { attempt: 'Attempt 2', score: 58, time: 115 },
    { attempt: 'Attempt 3', score: 64, time: 105 },
    { attempt: 'Attempt 4', score: 68, time: 98 },
    { attempt: 'Attempt 5', score: 74, time: 90 }
  ]
});