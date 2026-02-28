
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { generateMockAnalytics } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ComposedChart, Legend
} from 'recharts';
import {
  TrendingUp, Target, BookOpen, Clock, Award, AlertTriangle,
  CheckCircle, BarChart3, Activity, FileText, Zap, Users,
  Brain, Flame, ChevronUp, ChevronDown, Minus
} from 'lucide-react';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

// Animated circular gauge component
function CircularGauge({ value, max = 100, size = 120, label, color }: { value: number; max?: number; size?: number; label: string; color: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth="8" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      </div>
      <span className="text-xs text-gray-500 mt-1 font-medium">{label}</span>
    </div>
  );
}

// Mini stat card with trend indicator
function MiniStat({ icon: Icon, label, value, trend, color }: { icon: any; label: string; value: string; trend: 'up' | 'down' | 'neutral'; color: string }) {
  const TrendIcon = trend === 'up' ? ChevronUp : trend === 'down' ? ChevronDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: color + '20' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendIcon className={`w-5 h-5 ${trendColor}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function Analytics() {
  const { state } = useApp();
  const analytics: any = state.analytics || generateMockAnalytics();
  const [activeTab, setActiveTab] = useState<'overview' | 'dsa' | 'aptitude' | 'interview'>('overview');

  // Chart data
  const topicPerformanceData = Object.entries(analytics.dsaAnalytics.topicPerformance).map(([topic, score]) => ({
    topic, score, fill: (score as number) >= 70 ? '#10B981' : (score as number) >= 50 ? '#F59E0B' : '#EF4444'
  }));

  const categoryScoreData = Object.entries(analytics.aptitudeAnalytics.categoryScores).map(([category, score]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1), score, fullMark: 100
  }));

  const accuracyTrendData = analytics.aptitudeAnalytics.accuracyTrend.map((accuracy: number, index: number) => ({
    attempt: `#${index + 1}`, accuracy
  }));

  const difficultyData = [
    { difficulty: 'Easy', success: analytics.dsaAnalytics.difficultyAnalysis.easy },
    { difficulty: 'Medium', success: analytics.dsaAnalytics.difficultyAnalysis.medium },
    { difficulty: 'Hard', success: analytics.dsaAnalytics.difficultyAnalysis.hard }
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'dsa', label: 'DSA', icon: Brain },
    { key: 'aptitude', label: 'Aptitude', icon: Zap },
    { key: 'interview', label: 'Interview', icon: Users }
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Comprehensive performance insights and progress tracking</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8 max-w-lg">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${activeTab === tab.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* =============== OVERVIEW TAB =============== */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MiniStat icon={BarChart3} label="Overall Score" value={`${analytics.overallScore}%`} trend="up" color="#3B82F6" />
            <MiniStat icon={CheckCircle} label="Completion Rate" value="98%" trend="up" color="#10B981" />
            <MiniStat icon={Activity} label="Time Efficiency" value="Good" trend="neutral" color="#8B5CF6" />
            <MiniStat icon={TrendingUp} label="Improvement" value="+12%" trend="up" color="#F59E0B" />
          </div>

          {/* Learning Progress + Time Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Learning Progress Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.learningProgress}>
                  <defs>
                    <linearGradient id="gradDsa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradApt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradInt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="dsa" stroke="#3B82F6" fill="url(#gradDsa)" strokeWidth={2} name="DSA" />
                  <Area type="monotone" dataKey="aptitude" stroke="#8B5CF6" fill="url(#gradApt)" strokeWidth={2} name="Aptitude" />
                  <Area type="monotone" dataKey="interview" stroke="#10B981" fill="url(#gradInt)" strokeWidth={2} name="Interview" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⏱️ Time Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={analytics.timeSpentDistribution} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} strokeWidth={0}>
                    {analytics.timeSpentDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {analytics.timeSpentDistribution.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-gray-600">{item.category}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Activity Heatmap + Score Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.weeklyActivity} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="dsa" stackId="a" fill="#3B82F6" name="DSA" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="aptitude" stackId="a" fill="#8B5CF6" name="Aptitude" />
                  <Bar dataKey="interview" stackId="a" fill="#10B981" name="Interview" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Score Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="range" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} name="Candidates" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-gray-400 mt-2">Your score falls in the 61-80 range (highlighted)</p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-emerald-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
              </div>
              <div className="space-y-3">
                {analytics.strengths.map((s: string, i: number) => (
                  <div key={i} className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                    <span className="font-medium text-emerald-800">{s}</span>
                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Strong</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Priority Areas</h3>
              </div>
              <div className="space-y-3">
                {analytics.weaknesses.map((w: string, i: number) => (
                  <div key={i} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                    <span className="font-medium text-red-800">{w}</span>
                    <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Focus</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =============== DSA TAB =============== */}
      {activeTab === 'dsa' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🧩 Topic Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" domain={[0, 100]} fontSize={12} />
                  <YAxis type="category" dataKey="topic" fontSize={12} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {topicPerformanceData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Skill Gap Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={analytics.skillGapAnalysis}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="skill" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                  <Radar name="Current" dataKey="current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Target" dataKey="target" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                  <Legend />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Difficulty Breakdown</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="difficulty" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Bar dataKey="success" radius={[8, 8, 0, 0]} name="Success %">
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⏲️ Score vs Time Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={analytics.attemptHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="attempt" fontSize={11} />
                  <YAxis yAxisId="left" domain={[0, 100]} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 150]} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="score" fill="#6366F1" radius={[6, 6, 0, 0]} name="Score" />
                  <Line yAxisId="right" type="monotone" dataKey="time" stroke="#F59E0B" strokeWidth={2} name="Time (min)" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* =============== APTITUDE TAB =============== */}
      {activeTab === 'aptitude' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 Category Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={categoryScoreData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📉 Accuracy Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={accuracyTrendData}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="attempt" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Area type="monotone" dataKey="accuracy" stroke="#06B6D4" fill="url(#accGrad)" strokeWidth={2} dot={{ r: 4, fill: '#06B6D4' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(analytics.aptitudeAnalytics.categoryScores).map(([cat, score], i) => {
              const colors = ['#3B82F6', '#8B5CF6', '#10B981'];
              return (
                <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <CircularGauge value={score as number} label={cat.charAt(0).toUpperCase() + cat.slice(1)} color={colors[i]} />
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: colors[i] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* =============== INTERVIEW TAB =============== */}
      {activeTab === 'interview' && (
        <>
          {/* Interview Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MiniStat icon={Activity} label="Communication" value={`${analytics.interviewAnalytics.communicationScore}`} trend="up" color="#3B82F6" />
            <MiniStat icon={Clock} label="Avg Response" value={`${analytics.interviewAnalytics.responseLength}s`} trend="neutral" color="#10B981" />
            <MiniStat icon={Zap} label="Speaking Pace" value={`${analytics.interviewAnalytics.speakingPace} WPM`} trend="up" color="#8B5CF6" />
            <MiniStat icon={Flame} label="Confidence" value={`${analytics.interviewAnalytics.confidenceLevel}%`} trend="up" color="#F59E0B" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎤 Performance Over Sessions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.interviewPerformanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="session" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="communication" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Communication" />
                  <Line type="monotone" dataKey="confidence" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Confidence" />
                  <Line type="monotone" dataKey="clarity" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Clarity" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Overall Interview Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.interviewPerformanceTrend}>
                  <defs>
                    <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="session" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Area type="monotone" dataKey="overall" stroke="#6366F1" fill="url(#overallGrad)" strokeWidth={2.5} dot={{ r: 5, fill: '#6366F1' }} name="Overall Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Improvement Plan (always visible at bottom) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-5">
          <Target className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Personalized Improvement Plan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
            <h4 className="font-semibold text-blue-900 mb-3">🏗️ Week 1-2: Foundation</h4>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li>• Review dynamic programming basics</li>
              <li>• Practice 5 DP problems daily</li>
              <li>• Study common DP patterns</li>
            </ul>
          </div>
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50">
            <h4 className="font-semibold text-emerald-900 mb-3">🏋️ Week 3-4: Practice</h4>
            <ul className="space-y-1.5 text-sm text-emerald-800">
              <li>• Solve medium-level problems</li>
              <li>• Improve verbal reasoning</li>
              <li>• Take timed practice tests</li>
            </ul>
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
            <h4 className="font-semibold text-purple-900 mb-3">🚀 Week 5-6: Advanced</h4>
            <ul className="space-y-1.5 text-sm text-purple-800">
              <li>• Tackle hard-level challenges</li>
              <li>• Focus on optimization</li>
              <li>• Mock interview sessions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resume Analysis CTA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Resume Analysis with NLP</h3>
            <p className="text-gray-600 text-sm">Get AI-powered insights on your resume with detailed scoring & recommendations</p>
          </div>
          <button onClick={() => window.location.href = '/resume-analysis'}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg text-sm">
            <FileText className="w-4 h-4 mr-2" />
            Analyze Resume
          </button>
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Improve?</h3>
        <p className="text-gray-600 mb-4 text-sm">Based on your analytics, you can reach the 90th percentile with focused practice.</p>
        <div className="flex items-center justify-center space-x-3">
          <button className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <Target className="w-4 h-4 mr-2" />Start Practice Plan
          </button>
          <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Clock className="w-4 h-4 mr-2" />Schedule Assessment
          </button>
        </div>
      </div>
    </div>
  );
}