import React, { useState } from 'react';
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
  Search
} from 'lucide-react';

export default function Practice() {
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
          <h3 className="text-xl font-semibold text-gray-900">Daily Challenges</h3>
          <Link to="/practice/challenges" className="text-blue-600 hover:text-blue-700 font-medium">
            View All <ChevronRight className="inline w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-blue-900">Array Rotation</h4>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Easy</span>
            </div>
            <p className="text-sm text-blue-800 mb-4">
              Rotate an array to the right by k steps efficiently.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-blue-700">
                <Clock className="w-4 h-4 mr-1" />
                <span>15-20 mins</span>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Solve Now
              </button>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-emerald-900">Logic Puzzle</h4>
              <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">Medium</span>
            </div>
            <p className="text-sm text-emerald-800 mb-4">
              Solve a complex logical reasoning problem.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-emerald-700">
                <Clock className="w-4 h-4 mr-1" />
                <span>10-15 mins</span>
              </div>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                Solve Now
              </button>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-purple-900">System Design</h4>
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Hard</span>
            </div>
            <p className="text-sm text-purple-800 mb-4">
              Design a scalable chat application architecture.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-purple-700">
                <Clock className="w-4 h-4 mr-1" />
                <span>30-45 mins</span>
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                Solve Now
              </button>
            </div>
          </div>
        </div>
      </div>

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