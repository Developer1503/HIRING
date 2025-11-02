import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ProgressRing from '../components/ProgressRing';
import { 
  Code, 
  Brain, 
  Mic, 
  Play, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Target,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  BookOpen
} from 'lucide-react';

export default function Dashboard() {
  const { state } = useApp();
  const progress = state.assessmentProgress;

  const dsaProgress = Math.round((progress.dsa.completedQuestions.length / progress.dsa.totalQuestions) * 100);
  const aptitudeProgress = Math.round((Object.keys(progress.aptitude.answers).length / progress.aptitude.totalQuestions) * 100);
  const interviewProgress = Math.round((Object.keys(progress.interview.recordings).length / progress.interview.totalQuestions) * 100);

  const overallProgress = Math.round((dsaProgress + aptitudeProgress + interviewProgress) / 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {state.user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-blue-600 font-medium mt-1">
          Keep pushing forward! You're {overallProgress}% through your assessment journey.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
              <p className="text-sm text-gray-600">Overall Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">74</p>
              <p className="text-sm text-gray-600">Best Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">#247</p>
              <p className="text-sm text-gray-600">Global Rank</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">12h 30m</p>
              <p className="text-sm text-gray-600">Time Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* DSA Assessment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">DSA Round</h3>
                  <p className="text-sm text-gray-600">Data Structures & Algorithms</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Hard
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center mb-4">
              <ProgressRing progress={dsaProgress} size={100}>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{progress.dsa.completedQuestions.length}</div>
                  <div className="text-xs text-gray-600">of {progress.dsa.totalQuestions}</div>
                </div>
              </ProgressRing>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Score</span>
                <span className="font-medium text-gray-900">7/10 (70%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time Spent</span>
                <span className="font-medium text-gray-900">2h 45m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Time/Problem</span>
                <span className="font-medium text-gray-900">4.2 mins</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Arrays
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Strings
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                DP
              </span>
            </div>

            <Link
              to="/assessment/dsa"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              {dsaProgress > 0 ? 'Continue' : 'Start'} Assessment
            </Link>
          </div>
        </div>

        {/* Aptitude Assessment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Aptitude Test</h3>
                  <p className="text-sm text-gray-600">Quantitative, Logical & Verbal</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Medium
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{Object.keys(progress.aptitude.answers).length}/{progress.aptitude.totalQuestions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${aptitudeProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">6/8</div>
                <div className="text-xs text-gray-600">Quant</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">7/8</div>
                <div className="text-xs text-gray-600">Logical</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">6/9</div>
                <div className="text-xs text-gray-600">Verbal</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Score</span>
                <span className="font-medium text-gray-900">19/25 (76%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-medium text-gray-900">82%</span>
              </div>
            </div>

            <Link
              to="/assessment/aptitude"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              {aptitudeProgress > 0 ? 'Continue' : 'Start'} Test
            </Link>
          </div>
        </div>

        {/* Interview Assessment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Interview Round</h3>
                  <p className="text-sm text-gray-600">Voice Recording Assessment</p>
                </div>
              </div>
              <div className="flex items-center">
                {Object.keys(progress.interview.recordings).length > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Questions Answered</span>
                <span className="font-medium">{Object.keys(progress.interview.recordings).length}/{progress.interview.totalQuestions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${interviewProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">4</div>
                <div className="text-xs text-gray-600">Technical</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">2</div>
                <div className="text-xs text-gray-600">Behavioral</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">2</div>
                <div className="text-xs text-gray-600">HR</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Response Time</span>
                <span className="font-medium text-gray-900">2.8 mins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Speaking Pace</span>
                <span className="font-medium text-gray-900">142 WPM</span>
              </div>
            </div>

            <Link
              to="/assessment/interview"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              {interviewProgress > 0 ? 'Continue' : 'Start'} Interview
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Analytics & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Snapshot</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Logical Reasoning
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Problem Solving
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Communication
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Areas for Improvement</h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                  Dynamic Programming
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                  Verbal Reasoning
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Completed DSA Question 7 - 2 hours ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Started Aptitude Test - Yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <Link
              to="/assessment/full"
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              <Target className="w-5 h-5 mr-2" />
              Take Full Assessment
            </Link>

            <Link
              to="/practice"
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Practice Mode
            </Link>

            <Link
              to="/analytics"
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Detailed Analytics
            </Link>

            <Link
              to="/results"
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}