import { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { ResumeAnalysis } from '../types';
import { resumeApi } from '../services/resumeApi';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Eye,
  Download,
  Trash2,
  Star,
  Award,
  Brain,
  Zap
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function ResumeAnalysisPage() {
  const { state } = useApp();
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const data = await resumeApi.getAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error('Error loading analyses:', error);
      // Set empty array on error
      setAnalyses([]);
      setShowDemo(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoData = () => {
    const demoAnalysis: ResumeAnalysis = {
      id: 'demo-1',
      fileName: 'john_doe_resume.pdf',
      analysis: {
        overallScore: 78,
        sections: {
          contact: { score: 85, feedback: 'Good contact information with email and phone' },
          summary: { score: 72, feedback: 'Summary could be more concise and impactful' },
          experience: { score: 80, feedback: 'Strong experience section with quantified achievements' },
          education: { score: 90, feedback: 'Excellent educational background' },
          skills: { score: 75, feedback: 'Good technical skills, consider adding more soft skills' },
          projects: { score: 68, feedback: 'Include more project details and GitHub links' }
        },
        strengths: [
          'Strong technical background',
          'Quantified achievements in experience',
          'Clear educational qualifications',
          'Professional contact information'
        ],
        weaknesses: [
          'Summary section needs improvement',
          'Missing some trending technical skills',
          'Project section lacks detail',
          'Limited soft skills mentioned'
        ],
        recommendations: [
          'Rewrite summary to be more concise (30-50 words)',
          'Add trending skills like Docker, Kubernetes, or cloud platforms',
          'Include GitHub links and live demo URLs for projects',
          'Add soft skills like leadership and communication',
          'Quantify more achievements with specific numbers and percentages'
        ],
        keywords: {
          technical: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
          soft: ['Problem-solving', 'Teamwork'],
          missing: ['Docker', 'AWS', 'Kubernetes', 'TypeScript', 'GraphQL']
        },
        atsScore: 82,
        readabilityScore: 76
      },
      createdAt: new Date().toISOString()
    };
    
    setAnalyses([demoAnalysis]);
    setSelectedAnalysis(demoAnalysis);
    setShowDemo(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      setUploadError('Please upload a PDF or TXT file');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const newAnalysis = await resumeApi.analyzeResume(file);
      setAnalyses(prev => [newAnalysis, ...prev]);
      setSelectedAnalysis(newAnalysis);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      await resumeApi.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  // Prepare chart data
  const sectionData = selectedAnalysis ? Object.entries(selectedAnalysis.analysis.sections).map(([section, data]) => ({
    section: section.charAt(0).toUpperCase() + section.slice(1),
    score: data.score,
    fullMark: 100
  })) : [];

  const scoreMetrics = selectedAnalysis ? [
    { name: 'Overall Score', value: selectedAnalysis.analysis.overallScore, color: '#3B82F6' },
    { name: 'ATS Score', value: selectedAnalysis.analysis.atsScore, color: '#10B981' },
    { name: 'Readability', value: selectedAnalysis.analysis.readabilityScore, color: '#8B5CF6' }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
        <p className="text-gray-600 mt-2">AI-powered resume analysis with NLP insights and improvement recommendations</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Resume</h3>
          <p className="text-gray-600 mb-6">Get detailed AI analysis with scoring and personalized recommendations</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Resume (PDF/TXT)
                </>
              )}
            </button>
            
            {showDemo && (
              <button
                onClick={loadDemoData}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Demo Analysis
              </button>
            )}
          </div>
          
          {uploadError && (
            <p className="text-red-600 text-sm mt-2">{uploadError}</p>
          )}
          
          {showDemo && (
            <p className="text-amber-600 text-sm mt-2">
              Backend server not available. Click "View Demo Analysis" to see a sample analysis.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis History</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading analyses...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No analyses yet</p>
                <p className="text-sm text-gray-400">Upload a resume to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAnalysis?.id === analysis.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{analysis.fileName}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnalysis(analysis.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(analysis.analysis.overallScore)}`}>
                        {analysis.analysis.overallScore}/100
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2">
          {selectedAnalysis ? (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(selectedAnalysis.analysis.overallScore)}`}>
                    {getScoreLabel(selectedAnalysis.analysis.overallScore)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  {scoreMetrics.map((metric) => (
                    <div key={metric.name} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 relative">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={metric.color}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(metric.value / 100) * 175.93} 175.93`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-900">{metric.value}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                    </div>
                  ))}
                </div>

                {/* Section Scores Radar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={sectionData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="section" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Section Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(selectedAnalysis.analysis.sections).map(([section, data]) => (
                    <div key={section} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">{section}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(data.score)}`}>
                          {data.score}/100
                        </span>
                      </div>
                      {data.feedback && (
                        <p className="text-sm text-gray-600">{data.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Keywords Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-green-800 mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Technical Skills Found
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.analysis.keywords.technical.map((keyword) => (
                        <span key={keyword} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Soft Skills Found
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.analysis.keywords.soft.map((keyword) => (
                        <span key={keyword} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Trending Skills Missing
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.analysis.keywords.missing.map((keyword) => (
                        <span key={keyword} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <Award className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedAnalysis.analysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-green-800">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedAnalysis.analysis.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0" />
                        <span className="text-orange-800">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {selectedAnalysis.analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Zap className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-800">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Selected</h3>
              <p className="text-gray-600">Upload a resume or select an existing analysis to view detailed insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}