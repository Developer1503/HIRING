import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, TrendingUp, Award, Clock, Activity, Target, BarChart3, PieChart } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Candidate {
  id: string;
  name: string;
  email: string;
  experience_level: string;
  preferred_role: string;
  registration_date: string;
}

interface AssessmentAttempt {
  id: string;
  candidate_id: string;
  assessment_type: string;
  score: number;
  total_questions: number;
  time_spent: number;
  completed: boolean;
  attempt_date: string;
}

interface PerformanceMetric {
  candidate_id: string;
  overall_score: number;
  percentile: number;
  dsa_score: number;
  aptitude_score: number;
  interview_score: number;
}

interface DashboardStats {
  totalCandidates: number;
  totalAssessments: number;
  averageScore: number;
  completionRate: number;
  avgTimeSpent: number;
}

interface CandidatePerformance extends Candidate {
  overall_score: number;
  percentile: number;
  total_attempts: number;
  last_assessment: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalAssessments: 0,
    averageScore: 0,
    completionRate: 0,
    avgTimeSpent: 0,
  });
  const [candidates, setCandidates] = useState<CandidatePerformance[]>([]);
  const [assessmentTypeData, setAssessmentTypeData] = useState<{ type: string; count: number; avgScore: number }[]>([]);
  const [experienceLevelData, setExperienceLevelData] = useState<{ level: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [candidatesData, attemptsData, metricsData] = await Promise.all([
        supabase.from('candidates').select('*'),
        supabase.from('assessment_attempts').select('*'),
        supabase.from('performance_metrics').select('*'),
      ]);

      if (candidatesData.data) {
        const totalCandidates = candidatesData.data.length;

        const experienceGroups = candidatesData.data.reduce((acc: any, c: Candidate) => {
          acc[c.experience_level] = (acc[c.experience_level] || 0) + 1;
          return acc;
        }, {});

        setExperienceLevelData(
          Object.entries(experienceGroups).map(([level, count]) => ({
            level,
            count: count as number,
          }))
        );

        const candidatePerformance: CandidatePerformance[] = candidatesData.data.map((candidate: Candidate) => {
          const metric = metricsData.data?.find((m: PerformanceMetric) => m.candidate_id === candidate.id);
          const attempts = attemptsData.data?.filter((a: AssessmentAttempt) => a.candidate_id === candidate.id) || [];
          const lastAttempt = attempts.sort((a: AssessmentAttempt, b: AssessmentAttempt) =>
            new Date(b.attempt_date).getTime() - new Date(a.attempt_date).getTime()
          )[0];

          return {
            ...candidate,
            overall_score: metric?.overall_score || 0,
            percentile: metric?.percentile || 0,
            total_attempts: attempts.length,
            last_assessment: lastAttempt?.attempt_date || 'N/A',
          };
        });

        setCandidates(candidatePerformance);

        if (attemptsData.data) {
          const totalAssessments = attemptsData.data.length;
          const completedAssessments = attemptsData.data.filter((a: AssessmentAttempt) => a.completed).length;
          const totalScore = attemptsData.data.reduce((sum: number, a: AssessmentAttempt) => sum + a.score, 0);
          const totalTime = attemptsData.data.reduce((sum: number, a: AssessmentAttempt) => sum + a.time_spent, 0);

          const assessmentGroups = attemptsData.data.reduce((acc: any, a: AssessmentAttempt) => {
            if (!acc[a.assessment_type]) {
              acc[a.assessment_type] = { count: 0, totalScore: 0 };
            }
            acc[a.assessment_type].count += 1;
            acc[a.assessment_type].totalScore += a.score;
            return acc;
          }, {});

          setAssessmentTypeData(
            Object.entries(assessmentGroups).map(([type, data]: [string, any]) => ({
              type,
              count: data.count,
              avgScore: data.totalScore / data.count,
            }))
          );

          setStats({
            totalCandidates,
            totalAssessments,
            averageScore: totalAssessments > 0 ? totalScore / totalAssessments : 0,
            completionRate: totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0,
            avgTimeSpent: totalAssessments > 0 ? totalTime / totalAssessments : 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor candidate performance and assessment analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssessments}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
              </div>
              <Award className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
              </div>
              <Target className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(stats.avgTimeSpent)}</p>
              </div>
              <Clock className="w-10 h-10 text-teal-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <PieChart className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Assessment Type Distribution</h2>
            </div>
            <div className="space-y-4">
              {assessmentTypeData.map((item) => (
                <div key={item.type} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800 capitalize">{item.type}</span>
                    <span className="text-sm text-gray-600">{item.count} attempts</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(item.count / stats.totalAssessments) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Avg Score: {item.avgScore.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Experience Level Distribution</h2>
            </div>
            <div className="space-y-4">
              {experienceLevelData.map((item) => (
                <div key={item.level} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800 capitalize">{item.level}</span>
                    <span className="text-sm text-gray-600">{item.count} candidates</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${(item.count / stats.totalCandidates) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {((item.count / stats.totalCandidates) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Candidates Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Assessment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.preferred_role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {candidate.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {candidate.experience_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.overall_score.toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {candidate.percentile.toFixed(0)}th
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {candidate.total_attempts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(candidate.last_assessment)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
