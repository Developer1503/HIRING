import React, { useState } from 'react';
import { Sparkles, Loader2, Play, ChevronRight, Briefcase, GraduationCap, Code, AlertCircle, Key, Download, RefreshCw, Zap } from 'lucide-react';

export default function AIInterviewGenerator() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState('setup');
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const [formData, setFormData] = useState({
    jobRole: '',
    experienceLevel: 'intermediate',
    skills: '',
    questionCount: 5,
    questionTypes: {
      technical: true,
      behavioral: true,
      hr: false
    }
  });

  const generateWithGroq = async () => {
    const selectedTypes = Object.entries(formData.questionTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type)
      .join(', ');

    const systemPrompt = `You are an expert interview question generator. Generate ONLY the questions in this exact format:
1. Question text? (Type: technical)
2. Question text? (Type: behavioral)
3. Question text? (Type: hr)`;

    const userPrompt = `Generate exactly ${formData.questionCount} professional interview questions for a ${formData.jobRole} position at ${formData.experienceLevel} level.

Skills: ${formData.skills || 'general skills'}
Types: ${selectedTypes}

Generate ${formData.questionCount} questions now in the exact format shown.`;

    const models = [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile', 
      'gemma2-9b-it'
    ];

    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
            top_p: 0.9
          }),
          signal: AbortSignal.timeout(30000)
        });

        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Groq API key.');
        }

        if (response.status === 429) {
          throw new Error('Rate limit reached. Please wait a moment and try again.');
        }

        if (response.ok) {
          const data = await response.json();
          return data.choices[0]?.message?.content || '';
        }

        lastError = `Model ${model} returned status ${response.status}`;
      } catch (err) {
        if (err.message.includes('Invalid API key') || err.message.includes('Rate limit')) {
          throw err;
        }
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        lastError = err.message;
        console.log(`Model ${model} failed, trying next...`);
      }
    }

    throw new Error(lastError || 'All models failed. Please try again.');
  };

  const parseQuestions = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsedQuestions = [];
    
    lines.forEach((line) => {
      const match = line.match(/^(\d+)\.\s*(.+?)(?:\s*\(Type:\s*(\w+)\))?\.?\s*$/i);
      
      if (match && match[2].length > 15) {
        const questionText = match[2].trim().replace(/\s+/g, ' ');
        const type = match[3]?.toLowerCase() || 'behavioral';
        
        const formattedQuestion = questionText.endsWith('?') || questionText.endsWith('.') 
          ? questionText 
          : questionText + '?';
        
        parsedQuestions.push({
          id: `q-${Date.now()}-${parsedQuestions.length}`,
          question: formattedQuestion,
          type: ['technical', 'behavioral', 'hr'].includes(type) ? type : 'behavioral',
          expectedDuration: type === 'technical' ? 240 : 180,
          category: 'AI Generated',
          difficulty: formData.experienceLevel
        });
      }
    });

    return parsedQuestions.slice(0, formData.questionCount);
  };

  const getFallbackQuestions = () => {
    const fallbackPool = [
      {
        question: `Tell me about your experience as a ${formData.jobRole}. What are your key accomplishments?`,
        type: 'behavioral',
        expectedDuration: 180,
        category: 'Experience'
      },
      {
        question: `What technical skills and tools are you proficient in for the ${formData.jobRole} role?`,
        type: 'technical',
        expectedDuration: 240,
        category: 'Technical Skills'
      },
      {
        question: 'Describe a challenging project where you had to overcome significant obstacles. What was your approach?',
        type: 'behavioral',
        expectedDuration: 180,
        category: 'Problem Solving'
      },
      {
        question: 'How do you stay updated with the latest trends and technologies in your field?',
        type: 'behavioral',
        expectedDuration: 120,
        category: 'Learning'
      },
      {
        question: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?',
        type: 'behavioral',
        expectedDuration: 180,
        category: 'Teamwork'
      },
      {
        question: `What interests you most about this ${formData.jobRole} position and our company?`,
        type: 'hr',
        expectedDuration: 120,
        category: 'Motivation'
      },
      {
        question: 'Describe your ideal work environment and team structure.',
        type: 'hr',
        expectedDuration: 120,
        category: 'Culture Fit'
      },
      {
        question: `Walk me through a complex technical problem you solved in your ${formData.jobRole} work.`,
        type: 'technical',
        expectedDuration: 300,
        category: 'Technical Depth'
      },
      {
        question: 'How do you prioritize tasks when working on multiple projects with tight deadlines?',
        type: 'behavioral',
        expectedDuration: 150,
        category: 'Time Management'
      },
      {
        question: 'Tell me about a time you failed. What did you learn from it?',
        type: 'behavioral',
        expectedDuration: 180,
        category: 'Growth Mindset'
      }
    ];

    const enabledTypes = Object.entries(formData.questionTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type);

    const filtered = fallbackPool.filter(q => enabledTypes.includes(q.type));
    const selected = filtered.slice(0, formData.questionCount);

    return selected.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`,
      difficulty: formData.experienceLevel
    }));
  };

  const generateQuestions = async () => {
    if (!formData.jobRole.trim()) {
      setError('Please enter a job role');
      return;
    }

    const hasQuestionType = Object.values(formData.questionTypes).some(enabled => enabled);
    if (!hasQuestionType) {
      setError('Please select at least one question type');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your Groq API key');
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    setStep('generating');
    setError('');

    try {
      const generatedText = await generateWithGroq();
      const parsedQuestions = parseQuestions(generatedText);
      
      if (parsedQuestions.length === 0) {
        setError('AI generated invalid format. Using fallback questions.');
        setQuestions(getFallbackQuestions());
      } else {
        setQuestions(parsedQuestions);
      }
      
      setStep('ready');
    } catch (err) {
      setError(err.message || 'Failed to generate questions. Using fallback questions.');
      setQuestions(getFallbackQuestions());
      setStep('ready');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    console.log('Starting interview with questions:', questions);
    alert('Interview would start here! These questions would be passed to your InterviewAssessment component.');
  };

  const exportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-questions-${formData.jobRole.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'behavioral': return 'bg-green-100 text-green-800 border-green-200';
      case 'hr': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'entry': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'senior': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI Interview Question Generator
          </h1>
          <p className="text-lg text-gray-600 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Powered by Groq AI (Lightning Fast & Free)
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-900 flex-1">
                <p className="font-semibold mb-2">Quick Setup (30 seconds):</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 mb-3">
                  <li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">console.groq.com/keys</a></li>
                  <li>Sign up with Google/GitHub (completely free)</li>
                  <li>Click "Create API Key" and copy it</li>
                  <li>Paste it below</li>
                </ol>
                <div className="bg-blue-100 px-3 py-2 rounded mb-3">
                  <p className="text-xs font-medium">Why Groq?</p>
                  <ul className="text-xs mt-1 space-y-1">
                    <li>Lightning fast responses (2-5 seconds)</li>
                    <li>Free tier with generous limits</li>
                    <li>No waiting for models to load</li>
                    <li>Secure and reliable</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <label className="flex items-center text-sm font-medium text-blue-900 mb-2">
                    <Key className="w-4 h-4 mr-2" />
                    Groq API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type={showApiKeyInput ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="gsk_..."
                      className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    {apiKey && (
                      <button
                        onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                        className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 text-sm font-medium"
                      >
                        {showApiKeyInput ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-blue-800">
                    Your key is stored in memory only and sent directly to Groq. Never shared.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {step === 'setup' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Customize Your Interview
              </h2>

              {error && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Job Role / Position *
                  </label>
                  <input
                    type="text"
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    placeholder="e.g., Frontend Developer, Product Manager, Data Scientist"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['entry', 'intermediate', 'senior'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setFormData({ ...formData, experienceLevel: level })}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          formData.experienceLevel === level
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Code className="w-4 h-4 mr-2" />
                    Key Skills (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., React, Python, Machine Learning, AWS"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated skills to focus on</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Number of Questions
                  </label>
                  <select
                    value={formData.questionCount}
                    onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[3, 5, 7, 10].map(num => (
                      <option key={num} value={num}>{num} Questions</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Question Types *
                  </label>
                  <div className="space-y-2">
                    {Object.entries(formData.questionTypes).map(([type, enabled]) => (
                      <label key={type} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            questionTypes: { ...formData.questionTypes, [type]: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700 capitalize font-medium">{type}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {type === 'technical' && 'Skills & problem-solving'}
                          {type === 'behavioral' && 'Past experiences & scenarios'}
                          {type === 'hr' && 'Culture fit & motivation'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateQuestions}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Interview Questions</span>
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Generating Your Questions
              </h3>
              <p className="text-gray-600 mb-2">
                AI is creating personalized interview questions...
              </p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                Lightning fast with Groq - usually takes 2-5 seconds
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {step === 'ready' && questions.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Interview Questions
                  </h2>
                  <p className="text-gray-600">
                    {questions.length} questions for {formData.jobRole} ({formData.experienceLevel} level)
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={exportQuestions}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => {
                      setStep('setup');
                      setError('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                {questions.map((q, idx) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-500">
                        Question {idx + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getTypeColor(q.type)}`}>
                          {q.type}
                        </span>
                        <span className={`text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg text-gray-900 leading-relaxed mb-3">
                      {q.question}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Expected duration: {Math.floor(q.expectedDuration / 60)} minutes</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{q.category}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5" />
                <span>Start Interview</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}