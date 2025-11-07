import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Clock, Trophy, Filter, Search, Play } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  completed: boolean;
  timeEstimate: string;
  points: number;
}

export default function DSAPractice() {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const topics = ['Arrays', 'Strings', 'Trees', 'Dynamic Programming', 'Graphs', 'Linked Lists', 'Stacks & Queues', 'Sorting & Searching'];

  const problems: Problem[] = [
    { id: '1', title: 'Two Sum', difficulty: 'easy', topic: 'Arrays', completed: true, timeEstimate: '15 mins', points: 10 },
    { id: '2', title: 'Reverse Linked List', difficulty: 'easy', topic: 'Linked Lists', completed: true, timeEstimate: '20 mins', points: 10 },
    { id: '3', title: 'Valid Parentheses', difficulty: 'easy', topic: 'Stacks & Queues', completed: false, timeEstimate: '15 mins', points: 10 },
    { id: '4', title: 'Binary Tree Inorder Traversal', difficulty: 'medium', topic: 'Trees', completed: true, timeEstimate: '25 mins', points: 15 },
    { id: '5', title: 'Longest Substring Without Repeating', difficulty: 'medium', topic: 'Strings', completed: false, timeEstimate: '30 mins', points: 15 },
    { id: '6', title: 'Merge Intervals', difficulty: 'medium', topic: 'Arrays', completed: false, timeEstimate: '30 mins', points: 15 },
    { id: '7', title: 'Word Break', difficulty: 'hard', topic: 'Dynamic Programming', completed: false, timeEstimate: '45 mins', points: 25 },
    { id: '8', title: 'Serialize and Deserialize Binary Tree', difficulty: 'hard', topic: 'Trees', completed: false, timeEstimate: '50 mins', points: 25 },
  ];

  const filteredProblems = problems.filter(problem => {
    const matchesTopic = selectedTopic === 'all' || problem.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTopic && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/practice" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Practice
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DSA Practice</h1>
            <p className="text-gray-600 mt-2">Master data structures and algorithms</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">45</p>
              <p className="text-sm text-gray-600">Solved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">150</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Problem</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Points</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProblems.map((problem) => (
                <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {problem.completed ? (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Code className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{problem.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{problem.topic}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {problem.timeEstimate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                      {problem.points}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      <Play className="w-4 h-4 mr-1" />
                      {problem.completed ? 'Retry' : 'Solve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
