import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Brain, 
  Mic, 
  Play, 
  Clock, 
  Target,
  Trophy,
  Zap,
  BookOpen,
  Star,
  ChevronRight,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Award
} from 'lucide-react';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'dsa' | 'aptitude' | 'interview';
  estimatedTime: string;
  points: number;
  completed: boolean;
  date: string;
  problem?: string;
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
}

export default function Practice() {
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<DailyChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load daily challenges on mount
  useEffect(() => {
    loadDailyChallenges();
  }, []);

  const loadDailyChallenges = () => {
    const today = new Date().toISOString().split('T')[0];
    const storedChallenges = localStorage.getItem(`dailyChallenges_${today}`);
    
    if (storedChallenges) {
      try {
        const parsed = JSON.parse(storedChallenges);
        console.log('Loaded challenges from localStorage:', parsed);
        
        // Validate that all challenges have options
        const allHaveOptions = parsed.every((c: DailyChallenge) => 
          c.options && Array.isArray(c.options) && c.options.length > 0
        );
        
        if (allHaveOptions) {
          setDailyChallenges(parsed);
        } else {
          console.warn('Some challenges missing options, regenerating...');
          generateDailyChallenges();
        }
      } catch (error) {
        console.error('Error parsing stored challenges:', error);
        generateDailyChallenges();
      }
    } else {
      generateDailyChallenges();
    }
  };

  const generateDailyChallenges = async () => {
    setIsGenerating(true);
    try {
      // Clear old challenges first
      const today = new Date().toISOString().split('T')[0];
      localStorage.removeItem(`dailyChallenges_${today}`);
      
      // Try to generate with AI first
      const aiChallenges = await generateChallengesWithAI();
      if (aiChallenges && aiChallenges.length > 0) {
        saveChallenges(aiChallenges);
      } else {
        // Fallback to predefined challenges
        const fallbackChallenges = getPredefinedChallenges();
        saveChallenges(fallbackChallenges);
      }
    } catch (error) {
      console.error('Error generating challenges:', error);
      const fallbackChallenges = getPredefinedChallenges();
      saveChallenges(fallbackChallenges);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateChallengesWithAI = async () => {
    try {
      const response = await fetch('/api/groq/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert problem setter. Generate daily coding and aptitude challenges in valid JSON format only.'
            },
            {
              role: 'user',
              content: `Generate 3 daily challenges (one easy DSA, one medium aptitude, one hard interview question) in this exact JSON format:
[
  {
    "id": "challenge-1",
    "title": "Challenge Title",
    "description": "Brief description",
    "difficulty": "easy|medium|hard",
    "category": "dsa|aptitude|interview",
    "estimatedTime": "15-20 mins",
    "points": 10,
    "problem": "Detailed problem statement",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct"
  }
]

Make them practical, interview-relevant, and engaging. Return ONLY valid JSON array.`
            }
          ],
          temperature: 0.8,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']');
      if (jsonStart === -1 || jsonEnd === -1) return null;
      
      const jsonText = content.slice(jsonStart, jsonEnd + 1);
      const challenges = JSON.parse(jsonText);
      
      return challenges.map((c: any, idx: number) => ({
        ...c,
        id: `challenge-${Date.now()}-${idx}`,
        completed: false,
        date: new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      return null;
    }
  };

  const getPredefinedChallenges = (): DailyChallenge[] => {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: `challenge-${today}-1`,
        title: 'Array Rotation',
        description: 'Rotate an array to the right by k steps efficiently.',
        difficulty: 'easy',
        category: 'dsa',
        estimatedTime: '15-20 mins',
        points: 10,
        completed: false,
        date: today,
        problem: 'Given an array nums and an integer k, rotate the array to the right by k steps. For example, if nums = [1,2,3,4,5] and k = 2, the result should be [4,5,1,2,3].',
        options: [
          'Use a temporary array to store rotated elements',
          'Reverse the entire array, then reverse first k and last n-k elements',
          'Use nested loops to shift elements one by one',
          'Create a new array and copy elements in rotated order'
        ],
        correctAnswer: 1,
        explanation: 'The most efficient approach is to reverse the array three times: reverse entire array, then reverse first k elements, then reverse remaining elements. This gives O(n) time and O(1) space complexity.'
      },
      {
        id: `challenge-${today}-2`,
        title: 'Logic Puzzle',
        description: 'Solve a complex logical reasoning problem.',
        difficulty: 'medium',
        category: 'aptitude',
        estimatedTime: '10-15 mins',
        points: 15,
        completed: false,
        date: today,
        problem: 'If all Bloops are Razzies and all Razzies are Lazzies, which statement must be true?',
        options: [
          'All Lazzies are Bloops',
          'All Bloops are Lazzies',
          'Some Lazzies are not Bloops',
          'No Bloops are Lazzies'
        ],
        correctAnswer: 1,
        explanation: 'Since all Bloops are Razzies, and all Razzies are Lazzies, by transitive property, all Bloops must be Lazzies. This is a classic syllogism problem.'
      },
      {
        id: `challenge-${today}-3`,
        title: 'System Design Question',
        description: 'Design a scalable chat application architecture.',
        difficulty: 'hard',
        category: 'interview',
        estimatedTime: '30-45 mins',
        points: 25,
        completed: false,
        date: today,
        problem: 'You need to design a real-time chat application that can handle millions of concurrent users. What is the most critical component for ensuring message delivery and real-time updates?',
        options: [
          'A load balancer to distribute traffic',
          'WebSocket connections with a message queue system',
          'A NoSQL database for storing messages',
          'A CDN for serving static assets'
        ],
        correctAnswer: 1,
        explanation: 'WebSocket connections enable real-time bidirectional communication, and a message queue (like Kafka or RabbitMQ) ensures reliable message delivery, ordering, and can handle high throughput. This combination is essential for real-time chat at scale.'
      }
    ];
  };

  const saveChallenges = (challenges: DailyChallenge[]) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`dailyChallenges_${today}`, JSON.stringify(challenges));
    setDailyChallenges(challenges);
  };

  const handleSolveChallenge = (challenge: DailyChallenge) => {
    console.log('Selected challenge:', challenge);
    console.log('Challenge options:', challenge.options);
    setSelectedChallenge(challenge);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  };

  const handleSubmitAnswer = () => {
    if (!selectedChallenge || userAnswer === '') return;

    const correct = parseInt(userAnswer) === selectedChallenge.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Mark challenge as completed
      const updatedChallenges = dailyChallenges.map(c =>
        c.id === selectedChallenge.id ? { ...c, completed: true } : c
      );
      saveChallenges(updatedChallenges);
    }
  };

  const handleCloseChallenge = () => {
    setSelectedChallenge(null);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      dsa: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-600' },
      aptitude: { bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-600' },
      interview: { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-600' }
    };
    return colors[category as keyof typeof colors] || colors.dsa;
  };

  const practiceCategories = [
    {
      id: 'dsa',
      title: 'DSA Practice',
      description: 'Practice data structures and algorithms problems',
      icon: Code,
      color: 'blue',
      stats: { total: 150, completed: 45, streak: 7 },
      topics: ['Arrays', 'Strings', 'Trees', 'Dynamic Programming', 'Graphs']
    },
    {
      id: 'aptitude',
      title: 'Aptitude Practice',
      description: 'Improve quantitative, logical, and verbal reasoning',
      icon: Brain,
      color: 'emerald',
      stats: { total: 200, completed: 67, streak: 12 },
      topics: ['Quantitative', 'Logical Reasoning', 'Verbal Ability']
    },
    {
      id: 'interview',
      title: 'Mock Interviews',
      description: 'Practice with simulated interview questions',
      icon: Mic,
      color: 'purple',
      stats: { total: 50, completed: 18, streak: 3 },
      topics: ['Technical', 'Behavioral', 'HR Questions']
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'text-blue-600 bg-blue-100',
      emerald: 'text-emerald-600 bg-emerald-100',
      purple: 'text-purple-600 bg-purple-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Practice Mode</h1>
        <p className="text-gray-600 mt-2">Unlimited practice with immediate feedback and progress tracking</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">15</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">130</p>
              <p className="text-sm text-gray-600">Problems Solved</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">85%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">28h</p>
              <p className="text-sm text-gray-600">Practice Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search topics, problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Modes</option>
                <option value="dsa">DSA Only</option>
                <option value="aptitude">Aptitude Only</option>
                <option value="interview">Interview Only</option>
              </select>
            </div>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Practice Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {practiceCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor(category.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{category.stats.completed}/{category.stats.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        category.color === 'blue' ? 'bg-blue-600' :
                        category.color === 'emerald' ? 'bg-emerald-600' :
                        'bg-purple-600'
                      }`}
                      style={{ width: `${(category.stats.completed / category.stats.total) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-gray-600">{category.stats.streak} day streak</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {Math.round((category.stats.completed / category.stats.total) * 100)}% Complete
                    </span>
                  </div>
                </div>

                {/* Topics */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Practice Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className={`text-xs px-2 py-1 rounded-full border ${getColorClasses(category.color)}`}
                      >
                        {topic}
                      </span>
                    ))}
                    {category.topics.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        +{category.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    to={`/practice/${category.id}`}
                    className={`w-full inline-flex items-center justify-center px-4 py-3 font-medium rounded-lg transition-colors ${
                      category.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                      category.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                      'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continue Practice
                  </Link>
                  
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View All Topics
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Challenges Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Daily Challenges</h3>
            <p className="text-sm text-gray-600 mt-1">Complete today's challenges to earn points and maintain your streak</p>
          </div>
          <button
            onClick={generateDailyChallenges}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>New Challenges</span>
              </>
            )}
          </button>
        </div>
        
        {dailyChallenges.length === 0 && !isGenerating ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No challenges available yet</p>
            <button
              onClick={generateDailyChallenges}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Today's Challenges
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailyChallenges.map((challenge) => {
              const colors = getCategoryColor(challenge.category);
              return (
                <div key={challenge.id} className={`p-6 bg-gradient-to-br ${colors.bg} rounded-xl border ${colors.border} relative`}>
                  {challenge.completed && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${colors.text} pr-8`}>{challenge.title}</h4>
                    <span className={`text-xs ${colors.badge} text-white px-2 py-1 rounded-full capitalize`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className={`text-sm ${colors.text} opacity-80 mb-4`}>
                    {challenge.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center text-sm ${colors.text} opacity-75`}>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{challenge.estimatedTime}</span>
                      </div>
                      <div className={`flex items-center text-sm ${colors.text} opacity-75`}>
                        <Award className="w-4 h-4 mr-1" />
                        <span>{challenge.points} pts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSolveChallenge(challenge)}
                      disabled={challenge.completed}
                      className={`${colors.badge} text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {challenge.completed ? 'Completed' : 'Solve Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Challenge Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedChallenge.title}</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(selectedChallenge.category).badge} text-white capitalize`}>
                      {selectedChallenge.difficulty}
                    </span>
                    <span className="text-sm text-gray-600">{selectedChallenge.category.toUpperCase()}</span>
                    <span className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedChallenge.estimatedTime}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseChallenge}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h3>
                <p className="text-gray-700 leading-relaxed">{selectedChallenge.problem}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Answer</h3>
                {!selectedChallenge.options || selectedChallenge.options.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">No options available for this challenge.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedChallenge.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          userAnswer === index.toString()
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${
                          showResult
                            ? index === selectedChallenge.correctAnswer
                              ? 'border-green-500 bg-green-50'
                              : userAnswer === index.toString()
                              ? 'border-red-500 bg-red-50'
                              : 'opacity-50'
                            : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={index}
                          checked={userAnswer === index.toString()}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          disabled={showResult}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <span className="text-gray-900">{option}</span>
                          {showResult && index === selectedChallenge.correctAnswer && (
                            <CheckCircle className="inline w-5 h-5 text-green-600 ml-2" />
                          )}
                          {showResult && userAnswer === index.toString() && index !== selectedChallenge.correctAnswer && (
                            <XCircle className="inline w-5 h-5 text-red-600 ml-2" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {showResult && (
                <div className={`p-6 rounded-lg mb-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                  <div className="flex items-center mb-3">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                        <h4 className="text-lg font-semibold text-green-900">Correct! Well done! 🎉</h4>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-600 mr-2" />
                        <h4 className="text-lg font-semibold text-red-900">Not quite right. Try again!</h4>
                      </>
                    )}
                  </div>
                  <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'} mb-2`}>
                    <strong>Explanation:</strong>
                  </p>
                  <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedChallenge.explanation}
                  </p>
                  {isCorrect && (
                    <div className="mt-4 flex items-center text-green-700">
                      <Award className="w-5 h-5 mr-2" />
                      <span className="font-semibold">+{selectedChallenge.points} points earned!</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-4">
                {!showResult ? (
                  <>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={userAnswer === ''}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                    <button
                      onClick={handleCloseChallenge}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCloseChallenge}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    {isCorrect ? 'Continue' : 'Close'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-semibold text-gray-900">Achievement Unlocked!</h3>
              <p className="text-gray-600">You've maintained a 15-day practice streak. Keep it up!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">🔥</div>
            <div className="text-sm text-orange-700">Streak Master</div>
          </div>
        </div>
      </div>
    </div>
  );
}