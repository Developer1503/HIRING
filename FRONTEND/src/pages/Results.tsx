import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ProgressRing from '../components/ProgressRing';
import { generateMockAnalytics } from '../data/mockData';
import { 
  Trophy, 
  TrendingUp, 
  Download, 
  Share2,
  Code,
  Brain,
  Mic,
  Clock,
  Target,
  Award,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function Results() {
  const { state, dispatch } = useApp();
  const mockAnalytics = generateMockAnalytics();

  // Calculate results based on progress
  const dsaScore = Math.round((state.assessmentProgress.dsa.completedQuestions.length / 10) * 100);
  const aptitudeScore = Math.round((Object.keys(state.assessmentProgress.aptitude.answers).length / 25) * 100);
  const interviewScore = Math.round((Object.keys(state.assessmentProgress.interview.recordings).length / 8) * 100);
  
  const overallScore = Math.round((dsaScore + aptitudeScore + interviewScore) / 3);
  const percentile = mockAnalytics.percentile;

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    return 'C';
  };

  const handleSaveAnalytics = () => {
    dispatch({ type: 'SET_ANALYTICS', payload: mockAnalytics });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <Trophy className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Assessment Results</h1>
        <p className="text-xl text-gray-600">
          Congratulations! You've completed your comprehensive assessment.
        </p>
      </div>

      {/* Overall Score Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between lg:justify-start lg:space-x-8">
                <span className="text-gray-600">Your Score:</span>
                <span className="text-3xl font-bold text-blue-600">{overallScore}%</span>
              </div>
              <div className="flex items-center justify-between lg:justify-start lg:space-x-8">
                <span className="text-gray-600">Grade:</span>
                <span className="text-2xl font-bold text-green-600">{getGrade(overallScore)}</span>
              </div>
              <div className="flex items-center justify-between lg:justify-start lg:space-x-8">
                <span className="text-gray-600">Percentile:</span>
                <span className="text-xl font-semibold text-purple-600">{percentile}th</span>
              </div>
            </div>
            <p className="text-gray-600 mt-6">
              You scored better than <span className="font-semibold text-blue-600">{percentile}%</span> of candidates who took this assessment.
            </p>
          </div>
          
          <div className="flex justify-center">
            <ProgressRing progress={overallScore} size={200}>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{overallScore}</div>
                <div className="text-lg text-gray-600">Score</div>
                <div className="text-sm text-blue-600 mt-1">{getGrade(overallScore)}</div>
              </div>
            </ProgressRing>
          </div>
        </div>
      </div>

      {/* Round-wise Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* DSA Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <span className="text-2xl font-bold text-blue-600">{dsaScore}%</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Questions Solved:</span>
              <span className="font-medium">7/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Efficiency:</span>
              <span className="font-medium">4.2 mins avg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strong Areas:</span>
              <span className="font-medium text-green-600">Arrays, Strings</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Improve:</span>
              <span className="font-medium text-red-600">DP, Trees</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${dsaScore}%` }}
            />
          </div>
        </div>

        {/* Aptitude Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <span className="text-2xl font-bold text-emerald-600">{aptitudeScore}%</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Score:</span>
              <span className="font-medium">19/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantitative:</span>
              <span className="font-medium">6/8 (75%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Logical:</span>
              <span className="font-medium">7/8 (87.5%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Verbal:</span>
              <span className="font-medium">6/9 (66.7%)</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${aptitudeScore}%` }}
            />
          </div>
        </div>

        {/* Interview Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <span className="text-2xl font-bold text-purple-600">{interviewScore}%</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Responses:</span>
              <span className="font-medium">8/8 (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Response Time:</span>
              <span className="font-medium">2.8 mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Speaking Pace:</span>
              <span className="font-medium">142 WPM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clarity Score:</span>
              <span className="font-medium">8.5/10</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${interviewScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Immediate Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Award className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Strengths Identified</h3>
          </div>
          
          <div className="space-y-3">
            {mockAnalytics.strengths.map((strength, index) => (
              <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-800 font-medium">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-orange-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Areas for Improvement</h3>
          </div>
          
          <div className="space-y-3">
            {mockAnalytics.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-center p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-orange-800 font-medium">{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/analytics"
          onClick={handleSaveAnalytics}
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          View Detailed Analytics
        </Link>
        
        <button className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
          <RefreshCw className="w-5 h-5 mr-2" />
          Retake Assessment
        </button>
        
        <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5 mr-2" />
          Download Report
        </button>
        
        <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          <Share2 className="w-5 h-5 mr-2" />
          Share Results
        </button>
      </div>

      {/* Time Analysis */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Time Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">45 mins</div>
            <div className="text-sm text-gray-600">Total Time Spent</div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-600">85%</div>
            <div className="text-sm text-gray-600">Time Efficiency</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">Good</div>
            <div className="text-sm text-gray-600">Time Management</div>
          </div>
        </div>
      </div>
    </div>
  );
}