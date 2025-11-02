
import { useApp } from '../contexts/AppContext';
import { generateMockAnalytics } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import {
  TrendingUp,
  Target,
  BookOpen,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  FileText
} from 'lucide-react';

export default function Analytics() {
  const { state } = useApp();
  const analytics = state.analytics || generateMockAnalytics();

  // Prepare chart data
  const topicPerformanceData = Object.entries(analytics.dsaAnalytics.topicPerformance).map(([topic, score]) => ({
    topic,
    score,
    color: score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  }));

  const categoryScoreData = Object.entries(analytics.aptitudeAnalytics.categoryScores).map(([category, score]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    score,
    fullMark: 100
  }));

  const accuracyTrendData = analytics.aptitudeAnalytics.accuracyTrend.map((accuracy, index) => ({
    attempt: index + 1,
    accuracy
  }));

  const difficultyAnalysisData = [
    { difficulty: 'Easy', success: analytics.dsaAnalytics.difficultyAnalysis.easy, total: 100 },
    { difficulty: 'Medium', success: analytics.dsaAnalytics.difficultyAnalysis.medium, total: 100 },
    { difficulty: 'Hard', success: analytics.dsaAnalytics.difficultyAnalysis.hard, total: 100 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive analysis of your performance and improvement insights</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{analytics.overallScore}</p>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">Good</p>
              <p className="text-sm text-gray-600">Time Efficiency</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">+12%</p>
              <p className="text-sm text-gray-600">Since Last Attempt</p>
            </div>
          </div>
        </div>
      </div>

      {/* DSA Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">DSA Topic Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Difficulty Level Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={difficultyAnalysisData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="difficulty" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="success" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aptitude Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Aptitude Category Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={categoryScoreData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#06B6D4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interview Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Interview Performance Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analytics.interviewAnalytics.communicationScore}</div>
            <div className="text-sm text-gray-600">Communication Score</div>
          </div>

          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{analytics.interviewAnalytics.responseLength}s</div>
            <div className="text-sm text-gray-600">Avg Response Length</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{analytics.interviewAnalytics.speakingPace} WPM</div>
            <div className="text-sm text-gray-600">Speaking Pace</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{analytics.interviewAnalytics.confidenceLevel}%</div>
            <div className="text-sm text-gray-600">Confidence Level</div>
          </div>
        </div>
      </div>

      {/* Weakness Identification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Priority Areas</h3>
          </div>

          <div className="space-y-4">
            {analytics.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <span className="font-medium text-red-800">{weakness}</span>
                </div>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  High Impact
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Award className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Strength Areas</h3>
          </div>

          <div className="space-y-4">
            {analytics.strengths.map((strength, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-green-800">{strength}</span>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Maintain
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Personalized Improvement Plan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-3">Week 1-2: Foundation</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Review dynamic programming basics</li>
              <li>• Practice 5 DP problems daily</li>
              <li>• Study common DP patterns</li>
            </ul>
          </div>

          <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-100">
            <h4 className="font-semibold text-emerald-900 mb-3">Week 3-4: Practice</h4>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li>• Solve medium-level problems</li>
              <li>• Improve verbal reasoning skills</li>
              <li>• Take timed practice tests</li>
            </ul>
          </div>

          <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="font-semibold text-purple-900 mb-3">Week 5-6: Advanced</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li>• Tackle hard-level challenges</li>
              <li>• Focus on optimization</li>
              <li>• Mock interview sessions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resume Analysis Integration */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Resume Analysis with NLP</h3>
            <p className="text-gray-600 mb-4">
              Get AI-powered insights on your resume with detailed scoring, keyword analysis, and personalized recommendations
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                NLP-based Analysis
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                ATS Compatibility Score
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Weakness Detection
              </div>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/resume-analysis'}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Analyze Resume
            </button>
          </div>
        </div>
      </div>

      {/* Resource Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <BookOpen className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Recommended Resources</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Dynamic Programming</h4>
            <p className="text-sm text-gray-600 mb-3">Master DP patterns and optimization techniques</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View Resources →
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Verbal Reasoning</h4>
            <p className="text-sm text-gray-600 mb-3">Improve reading comprehension and analysis</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View Resources →
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">System Design</h4>
            <p className="text-sm text-gray-600 mb-3">Learn scalable system architecture</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View Resources →
            </button>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Improve?</h3>
          <p className="text-gray-600 mb-4">
            Based on your analytics, you have great potential to reach the 90th percentile with focused practice.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              <Target className="w-5 h-5 mr-2" />
              Start Practice Plan
            </button>
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              <Clock className="w-5 h-5 mr-2" />
              Schedule Next Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}