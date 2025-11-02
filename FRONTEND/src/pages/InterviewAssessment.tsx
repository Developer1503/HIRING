import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Play, ChevronRight, Briefcase, GraduationCap, Code, AlertCircle, Key, Download, RefreshCw, Zap, Eye, EyeOff, Check, X, Mic, Square, Volume2, SkipForward } from 'lucide-react';

export default function AIInterviewGenerator() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState('setup');
  const [error, setError] = useState('');
  // Read API key from Vite env var to avoid committing secrets
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_KEY || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(true);

  // Interview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shouldKeepRecording, setShouldKeepRecording] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const shouldKeepRecordingRef = useRef(false);

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

  // Initialize Speech Recognition once
  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      // Add debugging
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setRecognitionActive(true);
      };

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        // Only stop recording on certain errors, not all
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsRecording(false);
          setShouldKeepRecording(false);
        }
      };
    }

    // Initialize Speech Synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      setShouldKeepRecording(false);
      shouldKeepRecordingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Set up the onend handler that uses ref for current state
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended. shouldKeepRecording:', shouldKeepRecordingRef.current);
        setRecognitionActive(false);

        // Only restart if we should keep recording (user hasn't clicked stop)
        if (shouldKeepRecordingRef.current) {
          console.log('Attempting to restart in 500ms...');
          setTimeout(() => {
            if (shouldKeepRecordingRef.current && recognitionRef.current) {
              try {
                console.log('Restarting speech recognition...');
                recognitionRef.current.start();
              } catch (error) {
                console.log('Recognition restart failed:', error);
                setIsRecording(false);
                setShouldKeepRecording(false);
                shouldKeepRecordingRef.current = false;
              }
            }
          }, 500); // Increased delay
        } else {
          console.log('Stopping recording as shouldKeepRecording is false');
          setIsRecording(false);
        }
      };
    }
  }, []); // Only run once since we're using ref

  // Save API key to session storage when it changes
  // useEffect(() => {
  //   if (apiKey && apiKeyValid) {
  //     sessionStorage.setItem('groq_api_key', apiKey);
  //   }
  // }, [apiKey, apiKeyValid]);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyValid(false);
      return false;
    }

    try {
      // Validate via backend proxy so API key is kept server-side
      const response = await fetch('/api/groq/models');

      const isValid = response.ok;
      setApiKeyValid(isValid);
      return isValid;
    } catch (err) {
      setApiKeyValid(false);
      return false;
    }
  };

  const generateWithGroq = async () => {
    const selectedTypes = Object.entries(formData.questionTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type)
      .join(', ');

    const systemPrompt = `You are an expert interview question generator. Generate professional interview questions in this exact format:
1. Question text here? (Type: technical)
2. Question text here? (Type: behavioral)
3. Question text here? (Type: hr)

Rules:
- Each question must be clear, professional, and relevant
- Questions should be 10-30 words long
- Always end with a question mark
- Match the question type exactly to one of: technical, behavioral, or hr`;

    const userPrompt = `Generate exactly ${formData.questionCount} professional interview questions for a ${formData.jobRole} position at ${formData.experienceLevel} level.

Skills to focus on: ${formData.skills || 'general skills for this role'}
Question types needed: ${selectedTypes}

Generate ${formData.questionCount} unique questions now in the exact numbered format with type labels.`;

    const models = [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'gemma2-9b-it',
      'mixtral-8x7b-32768'
    ];

    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch('/api/groq/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 2000,
            top_p: 0.95
          }),
          signal: AbortSignal.timeout(30000)
        });

        if (response.status === 401) {
          setApiKeyValid(false);
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
        if (err.name === 'AbortError' || err.name === 'TimeoutError') {
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
      // Match numbered questions with optional type labels
      const match = line.match(/^(\d+)\.\s*(.+?)(?:\s*\(Type:\s*(\w+)\))?\.?\s*$/i);

      if (match && match[2].length > 15) {
        const questionText = match[2].trim().replace(/\s+/g, ' ');
        const type = match[3]?.toLowerCase() || 'behavioral';

        const formattedQuestion = questionText.endsWith('?') || questionText.endsWith('.')
          ? questionText
          : questionText + '?';

        // Validate type
        const validType = ['technical', 'behavioral', 'hr'].includes(type) ? type : 'behavioral';

        parsedQuestions.push({
          id: `q-${Date.now()}-${parsedQuestions.length}`,
          question: formattedQuestion,
          type: validType,
          expectedDuration: validType === 'technical' ? 240 : 180,
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
      },
      {
        question: `What strategies do you use to debug complex issues in ${formData.jobRole} work?`,
        type: 'technical',
        expectedDuration: 240,
        category: 'Problem Solving'
      },
      {
        question: 'Describe a situation where you had to adapt to significant change. How did you handle it?',
        type: 'behavioral',
        expectedDuration: 180,
        category: 'Adaptability'
      },
      {
        question: 'What are your career goals for the next 3-5 years?',
        type: 'hr',
        expectedDuration: 120,
        category: 'Career Goals'
      }
    ];

    const enabledTypes = Object.entries(formData.questionTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type);

    const filtered = fallbackPool.filter(q => enabledTypes.includes(q.type));

    // Shuffle and select
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, formData.questionCount);

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

    // API key validation removed - using hardcoded key

    setLoading(true);
    setStep('generating');
    setError('');

    try {
      const generatedText = await generateWithGroq();
      const parsedQuestions = parseQuestions(generatedText);

      if (parsedQuestions.length === 0) {
        setError('AI generated invalid format. Using fallback questions.');
        setQuestions(getFallbackQuestions());
      } else if (parsedQuestions.length < formData.questionCount) {
        setError(`AI generated ${parsedQuestions.length} questions instead of ${formData.questionCount}. Adding fallback questions.`);
        const fallback = getFallbackQuestions();
        const combined = [...parsedQuestions, ...fallback].slice(0, formData.questionCount);
        setQuestions(combined);
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
    if (questions.length === 0) return;
    setStep('interview');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentTranscript('');

    // Speak the first question
    setTimeout(() => speakQuestion(questions[0].question), 500);
  };

  const speakQuestion = (text) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      // Stop recording
      console.log('User clicked stop recording');
      setShouldKeepRecording(false);
      shouldKeepRecordingRef.current = false;
      setIsRecording(false);
      recognitionRef.current.stop();
    } else {
      // Start recording
      console.log('User clicked start recording');
      setCurrentTranscript('');
      setIsRecording(true);
      setShouldKeepRecording(true);
      shouldKeepRecordingRef.current = true;
      try {
        recognitionRef.current.start();
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.log('Recognition start failed:', error);
        setIsRecording(false);
        setShouldKeepRecording(false);
        shouldKeepRecordingRef.current = false;
      }
    }
  };

  const saveAnswer = () => {
    if (!currentTranscript.trim()) {
      setError('Please record an answer before proceeding');
      return;
    }

    const newAnswer = {
      questionId: questions[currentQuestionIndex].id,
      question: questions[currentQuestionIndex].question,
      answer: currentTranscript,
      timestamp: new Date().toISOString(),
      duration: 0 // Could track actual duration if needed
    };

    setAnswers([...answers, newAnswer]);
    setCurrentTranscript('');
    setError('');

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => speakQuestion(questions[nextIndex].question), 500);
    } else {
      completeInterview();
    }
  };

  const skipQuestion = () => {
    const newAnswer = {
      questionId: questions[currentQuestionIndex].id,
      question: questions[currentQuestionIndex].question,
      answer: '[Skipped]',
      timestamp: new Date().toISOString(),
      duration: 0
    };

    setAnswers([...answers, newAnswer]);
    setCurrentTranscript('');
    setError('');

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => speakQuestion(questions[nextIndex].question), 500);
    } else {
      completeInterview();
    }
  };

  const completeInterview = () => {
    setStep('complete');
    setShouldKeepRecording(false);
    shouldKeepRecordingRef.current = false;
    setIsRecording(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const exportInterview = () => {
    const exportData = {
      metadata: {
        jobRole: formData.jobRole,
        experienceLevel: formData.experienceLevel,
        skills: formData.skills,
        completedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        answeredQuestions: answers.filter(a => a.answer !== '[Skipped]').length
      },
      questions: questions,
      answers: answers
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-${formData.jobRole.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportQuestions = () => {
    const exportData = {
      metadata: {
        jobRole: formData.jobRole,
        experienceLevel: formData.experienceLevel,
        skills: formData.skills,
        generatedAt: new Date().toISOString(),
        questionCount: questions.length
      },
      questions: questions
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-questions-${formData.jobRole.replace(/\s+/g, '-')}-${Date.now()}.json`;
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
          <p className="text-lg text-gray-600">
            Create personalized interview questions with AI
          </p>
        </div>

        {/* API Key setup section removed - key is now hardcoded */}

        {step === 'setup' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Customize Your Interview
              </h2>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
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
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${formData.experienceLevel === level
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
                    {[3, 5, 7, 10, 15].map(num => (
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
                      <label key={type} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
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

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Interview Tips:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Review each question and prepare talking points</li>
                      <li>• Use the STAR method for behavioral questions (Situation, Task, Action, Result)</li>
                      <li>• Practice your responses out loud before the actual interview</li>
                      <li>• Prepare specific examples from your experience</li>
                    </ul>
                  </div>
                </div>
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

        {step === 'interview' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Interview in Progress
                    </h2>
                    <p className="text-gray-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(((currentQuestionIndex) / questions.length) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getTypeColor(questions[currentQuestionIndex].type)}`}>
                    {questions[currentQuestionIndex].type}
                  </span>
                  <button
                    onClick={() => speakQuestion(questions[currentQuestionIndex].question)}
                    disabled={isSpeaking}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isSpeaking ? 'Speaking...' : 'Repeat Question'}</span>
                  </button>
                </div>

                <p className="text-xl text-gray-900 font-medium leading-relaxed">
                  {questions[currentQuestionIndex].question}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Your Answer</h3>
                  <span className="text-sm text-gray-500">
                    {currentTranscript.split(' ').filter(w => w).length} words
                  </span>
                </div>

                <div className="border-2 border-gray-300 rounded-lg p-4 min-h-32 bg-white">
                  {currentTranscript ? (
                    <p className="text-gray-900 whitespace-pre-wrap">{currentTranscript}</p>
                  ) : (
                    <p className="text-gray-400 italic">Click the microphone button to start recording your answer...</p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center space-x-4">
                  <button
                    onClick={toggleRecording}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all shadow-lg ${isRecording
                      ? 'bg-gray-800 text-white hover:bg-gray-900 animate-pulse'
                      : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-5 h-5" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </button>

                  {isRecording && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Recording...</span>
                    </div>
                  )}

                  {/* Debug status */}
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Status: {isRecording ? 'Recording' : 'Stopped'} |
                    Recognition: {recognitionActive ? 'Active' : 'Inactive'} |
                    Keep: {shouldKeepRecording ? 'Yes' : 'No'}
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
                    ? 'Speech recognition not supported. Please use Chrome or Edge browser.'
                    : 'Speak clearly into your microphone. Your speech will be converted to text automatically.'
                  }
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={skipQuestion}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                >
                  <SkipForward className="w-5 h-5" />
                  <span>Skip Question</span>
                </button>

                <button
                  onClick={saveAnswer}
                  disabled={!currentTranscript.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Interview Complete!
                </h2>
                <p className="text-gray-600">
                  You've answered {answers.filter(a => a.answer !== '[Skipped]').length} out of {questions.length} questions
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Interview Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Position</div>
                    <div className="font-medium text-gray-900">{formData.jobRole}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Level</div>
                    <div className="font-medium text-gray-900 capitalize">{formData.experienceLevel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                    <div className="font-medium text-gray-900">
                      {answers.filter(a => a.answer !== '[Skipped]').length} / {questions.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                    <div className="font-medium text-gray-900">
                      {Math.round((answers.filter(a => a.answer !== '[Skipped]').length / questions.length) * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Your Answers</h3>
                {answers.map((answer, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-500">Question {idx + 1}</span>
                      {answer.answer === '[Skipped]' && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Skipped</span>
                      )}
                    </div>
                    <p className="text-gray-900 font-medium mb-2">{answer.question}</p>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {answer.answer === '[Skipped]' ? (
                        <span className="italic text-gray-500">Question was skipped</span>
                      ) : (
                        answer.answer
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={exportInterview}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Interview</span>
                </button>

                <button
                  onClick={() => {
                    setStep('setup');
                    setQuestions([]);
                    setAnswers([]);
                    setCurrentQuestionIndex(0);
                    setCurrentTranscript('');
                    setError('');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Start New Interview</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
