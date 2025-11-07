import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  Brain,
  Code,
  Mic,
  CheckCircle,
  Clock,
  Target,
  Play,
  ChevronRight,
  AlertCircle,
  Trophy,
  Zap,
  TrendingUp
} from 'lucide-react';

interface AssessmentRound {
  id: string;
  name: string;
  icon: any;
  description: string;
  duration: number;
  questions: number;
  status: 'pending' | 'in-progress' | 'completed';
  score?: number;
  route: string;
}

export default function FullAssessment() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [currentRound, setCurrentRound] = useState(0);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const assessmentRounds: AssessmentRound[] = [
    {
      id: 'aptitude',
      name: 'Aptitude Test',
      icon: Brain,
      description: 'Quantitative, Logical, and Verbal Reasoning',
      duration: 30,
      questions: 25,
      status: 'pending',
      route: '/assessment/aptitude'
    },
    {
      id: 'dsa',
      name: 'DSA Coding Round',
      icon: Code,
      description: 'Data Structures and Algorithms Problems',
      duration: 45,
      questions: 3,
      status: 'pending',
      route: '/assessment/dsa'
    },
    {
      id: 'interview',
      name: 'Interview Round',
      icon: Mic,
      description: 'Voice-based Technical and Behavioral Questions',
      duration: 20,
      questions: 5,
      status: 'pending',
      route: '/assessment/interview'
    }
  ];

  useEffect(() => {
    // Calculate total assessment time
    const total = assessmentRounds.reduce((sum, round) => sum + round.duration, 0);
    setTotalTime(total);
  }, []);

  const handleStartAssessment = () => {
    setShowInstructions(false);
    setAssessmentStarted(true);
    
    // Initialize assessment in context
    dispatch({
      type: 'START_FULL_ASSESSMENT',
      payload: {
        startTime: new Date().toISOString(),
        rounds: assessmentRounds
      }
    });
  };

  const handleStartRound = (round: AssessmentRound) => {
    // Navigate to the specific assessment
    navigate(round.route);
  };

  const getRoundStatus = (roundId: string) => {
    const progress = state.assessmentProgress;
    
    switch (roundId) {
      case 'aptitude':
        return Object.keys(progress.aptitude.answers).length > 0 ? 'in-progress' : 'pending';
      case 'dsa':
        return progress.dsa.completedQuestions.length > 0 ? 'in-progress' : 'pending';
      case 'interview':
        return Object.keys(progress.interview.recordings).length > 0 ? 'in-progress' : 'pending';
      default:
        return 'pending';
    }
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Full Assessment
            </h1>
            <p className="text-lg text-gray-600">
              Complete all three rounds to get your comprehensive evaluation
            </p>
          </div>

          {/* Assessment Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Assessment Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assessmentRounds.map((round, index) => {
                const Icon = round.icon;
                return (
                  <div key={round.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Round {index + 1}</div>
                        <div className="text-xs text-gray-600">{round.name}</div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{round.duration} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        <span>{round.questions} questions</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Total Duration
              </h4>
              <p className="text-3xl font-bold text-blue-600">{totalTime} minutes</p>
              <p className="text-sm text-blue-700 mt-1">Approximately {Math.round(totalTime / 60 * 10) / 10} hours</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Total Questions
              </h4>
              <p className="text-3xl font-bold text-purple-600">
                {assessmentRounds.reduce((sum, r) => sum + r.questions, 0)}
              </p>
              <p className="text-sm text-purple-700 mt-1">Across all three rounds</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Important Instructions
            </h4>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Complete all three rounds in sequence for the best evaluation</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Each round has a time limit - manage your time wisely</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can take breaks between rounds, but not during a round</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your progress is automatically saved after each round</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Ensure stable internet connection and quiet environment</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>For interview round, microphone access is required</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleStartAssessment}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <Play className="w-5 h-5" />
              <span>Start Full Assessment</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Full Assessment Progress</h1>
              <p className="text-gray-600">Complete all rounds to receive your comprehensive evaluation</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Progress</div>
              <div className="text-3xl font-bold text-blue-600">
                {Math.round((assessmentRounds.filter(r => getRoundStatus(r.id) === 'in-progress').length / assessmentRounds.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(assessmentRounds.filter(r => getRoundStatus(r.id) === 'in-progress').length / assessmentRounds.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Assessment Rounds */}
        <div className="space-y-6">
          {assessmentRounds.map((round, index) => {
            const Icon = round.icon;
            const status = getRoundStatus(round.id);
            const isCompleted = status === 'in-progress';
            const isActive = index === currentRound;

            return (
              <div
                key={round.id}
                className={`bg-white rounded-2xl shadow-lg border-2 p-8 transition-all ${
                  isActive ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mr-4 ${
                      isCompleted ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <Icon className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold text-gray-900">Round {index + 1}: {round.name}</h2>
                        {isCompleted && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{round.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{round.duration} min</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Target className="w-4 h-4 mr-2" />
                      <span className="text-sm">Questions</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{round.questions}</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="text-sm">Status</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900 capitalize">{status.replace('-', ' ')}</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Trophy className="w-4 h-4 mr-2" />
                      <span className="text-sm">Score</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {round.score ? `${round.score}%` : '-'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartRound(round)}
                  disabled={isCompleted}
                  className={`w-full py-4 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all ${
                    isCompleted
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Round Completed</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start {round.name}</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Assessment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalTime}</div>
              <div className="text-sm text-blue-800">Total Minutes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {assessmentRounds.reduce((sum, r) => sum + r.questions, 0)}
              </div>
              <div className="text-sm text-purple-800">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {assessmentRounds.filter(r => getRoundStatus(r.id) === 'in-progress').length}
              </div>
              <div className="text-sm text-green-800">Rounds Completed</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/results')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>View Results</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
