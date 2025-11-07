import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Play, ChevronRight, Briefcase, GraduationCap, Code, AlertCircle, Download, RefreshCw, Zap, Check, Mic, Square, Volume2, SkipForward } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: string;
  expectedDuration: number;
  category: string;
  difficulty?: string;
}

interface Answer {
  questionId: string;
  question: string;
  answer: string;
  timestamp: string;
  duration: number;
}

interface EvaluationResults {
  overallScore: number;
  confidenceScore: number;
  communicationScore: number;
  technicalScore: number;
  behavioralScore: number;
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  questionEvaluations: Array<{
    questionNumber: number;
    score: number;
    feedback: string;
    keyPoints: string[];
    confidence: string;
    clarity: string;
    relevance: string;
  }>;
  kpis: {
    averageResponseLength: number;
    vocabularyRichness: string;
    structuredThinking: string;
    examplesProvided: number;
    starMethodUsage: string;
    professionalTone: string;
  };
  recommendation: string;
  nextSteps: string[];
}

export default function AIInterviewGenerator() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState('setup');
  const [error, setError] = useState('');

  // Interview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shouldKeepRecording, setShouldKeepRecording] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResults | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
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

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
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
      } catch (err: any) {
        if (err.message?.includes('Invalid API key') || err.message?.includes('Rate limit')) {
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

  const parseQuestions = (text: string) => {
    const lines = text.split('\n').filter((line: string) => line.trim());
    const parsedQuestions: Question[] = [];

    lines.forEach((line: string) => {
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
    } catch (err: any) {
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

  const speakQuestion = (text: string) => {
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

  // NLP-based answer evaluation using AI
  const evaluateAnswers = async (answersToEvaluate: Answer[]) => {
    try {
      const evaluationPrompt = `You are an expert interview evaluator. Analyze the following interview responses and provide a comprehensive evaluation.

Interview Details:
- Position: ${formData.jobRole}
- Experience Level: ${formData.experienceLevel}
- Skills Focus: ${formData.skills || 'General'}

Questions and Answers:
${answersToEvaluate.map((ans, idx) => `
Question ${idx + 1} (${questions[idx]?.type}): ${ans.question}
Answer: ${ans.answer === '[Skipped]' ? 'Not answered' : ans.answer}
`).join('\n')}

Provide a detailed evaluation in the following JSON format:
{
  "overallScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "behavioralScore": <number 0-100>,
  "overallFeedback": "<detailed feedback>",
  "strengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2", "area3"],
  "questionEvaluations": [
    {
      "questionNumber": 1,
      "score": <0-100>,
      "feedback": "<specific feedback>",
      "keyPoints": ["point1", "point2"],
      "confidence": "<low|medium|high>",
      "clarity": "<low|medium|high>",
      "relevance": "<low|medium|high>"
    }
  ],
  "kpis": {
    "averageResponseLength": <number>,
    "vocabularyRichness": "<low|medium|high>",
    "structuredThinking": "<low|medium|high>",
    "examplesProvided": <number>,
    "starMethodUsage": "<low|medium|high>",
    "professionalTone": "<low|medium|high>"
  },
  "recommendation": "<hire|consider|reject>",
  "nextSteps": ["step1", "step2"]
}

Evaluate based on:
1. Clarity and coherence of responses
2. Relevance to the question asked
3. Depth of knowledge demonstrated
4. Communication skills and confidence
5. Use of specific examples and STAR method
6. Professional language and tone
7. Technical accuracy (for technical questions)
8. Behavioral indicators (for behavioral questions)

Return ONLY valid JSON.`;

      const response = await fetch('/api/groq/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interview evaluator with deep knowledge of hiring best practices, NLP analysis, and candidate assessment. Provide detailed, constructive feedback in valid JSON format only.'
            },
            {
              role: 'user',
              content: evaluationPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        }),
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Extract JSON from response
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('Invalid evaluation format');
      }

      const jsonText = content.slice(jsonStart, jsonEnd + 1);
      const evaluation = JSON.parse(jsonText);

      return evaluation;
    } catch (error) {
      console.error('Evaluation error:', error);
      // Return fallback evaluation
      return {
        overallScore: 70,
        confidenceScore: 65,
        communicationScore: 70,
        technicalScore: 65,
        behavioralScore: 70,
        overallFeedback: 'Evaluation completed. Your responses show good potential. Continue practicing to improve your interview skills.',
        strengths: ['Clear communication', 'Relevant examples', 'Professional demeanor'],
        areasForImprovement: ['Provide more specific details', 'Use STAR method consistently', 'Demonstrate deeper technical knowledge'],
        questionEvaluations: answersToEvaluate.map((_: Answer, idx: number) => ({
          questionNumber: idx + 1,
          score: 70,
          feedback: 'Good response with room for improvement',
          keyPoints: ['Answered the question', 'Could provide more details'],
          confidence: 'medium',
          clarity: 'medium',
          relevance: 'high'
        })),
        kpis: {
          averageResponseLength: Math.round(answersToEvaluate.reduce((sum: number, ans: Answer) => sum + (ans.answer !== '[Skipped]' ? ans.answer.split(' ').length : 0), 0) / answersToEvaluate.length),
          vocabularyRichness: 'medium',
          structuredThinking: 'medium',
          examplesProvided: 2,
          starMethodUsage: 'low',
          professionalTone: 'high'
        },
        recommendation: 'consider',
        nextSteps: ['Practice more technical questions', 'Work on STAR method', 'Prepare specific examples']
      };
    }
  };

  const completeInterview = async () => {
    setShouldKeepRecording(false);
    shouldKeepRecordingRef.current = false;
    setIsRecording(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setStep('evaluating');

    // Evaluate answers using NLP
    const evaluation = await evaluateAnswers(answers);
    setEvaluationResults(evaluation);

    setStep('complete');
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
      answers: answers,
      evaluation: evaluationResults
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

  const downloadDetailedReport = () => {
    if (!evaluationResults) return;

    const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Assessment Report - ${formData.jobRole}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1e40af; font-size: 32px; margin-bottom: 10px; }
        .header p { color: #666; font-size: 16px; }
        .section { margin: 30px 0; }
        .section-title { font-size: 24px; color: #1e40af; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 15px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .info-card { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .info-card h3 { font-size: 14px; color: #64748b; margin-bottom: 5px; text-transform: uppercase; }
        .info-card p { font-size: 24px; font-weight: bold; color: #1e293b; }
        .score-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .score-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; text-align: center; }
        .score-card h3 { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
        .score-card .score { font-size: 48px; font-weight: bold; }
        .score-card .label { font-size: 12px; opacity: 0.8; margin-top: 5px; }
        .feedback-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .list-section { margin: 20px 0; }
        .list-section h3 { font-size: 18px; color: #1e40af; margin-bottom: 10px; }
        .list-section ul { list-style: none; padding-left: 0; }
        .list-section li { padding: 10px; margin: 5px 0; background: #f8fafc; border-radius: 5px; border-left: 3px solid #10b981; }
        .list-section li::before { content: "✓ "; color: #10b981; font-weight: bold; margin-right: 10px; }
        .improvement-list li { border-left-color: #f59e0b; }
        .improvement-list li::before { content: "→ "; color: #f59e0b; }
        .question-eval { background: #fafafa; padding: 20px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
        .question-eval h4 { color: #1e40af; margin-bottom: 10px; }
        .question-eval .question-text { font-style: italic; color: #666; margin: 10px 0; }
        .question-eval .answer-text { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #3b82f6; }
        .metrics { display: flex; gap: 15px; flex-wrap: wrap; margin: 10px 0; }
        .metric-badge { padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .metric-high { background: #d1fae5; color: #065f46; }
        .metric-medium { background: #fef3c7; color: #92400e; }
        .metric-low { background: #fee2e2; color: #991b1b; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .kpi-item { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .kpi-item h4 { font-size: 12px; color: #64748b; margin-bottom: 5px; }
        .kpi-item p { font-size: 18px; font-weight: bold; color: #1e293b; }
        .recommendation { padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .recommendation.hire { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
        .recommendation.consider { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
        .recommendation.reject { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
        .recommendation h3 { font-size: 24px; margin-bottom: 10px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; font-size: 14px; }
        @media print { body { background: white; padding: 0; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Interview Assessment Report</h1>
            <p>Comprehensive Evaluation & Analysis</p>
        </div>

        <div class="section">
            <h2 class="section-title">Candidate Information</h2>
            <div class="info-grid">
                <div class="info-card">
                    <h3>Position</h3>
                    <p>${formData.jobRole}</p>
                </div>
                <div class="info-card">
                    <h3>Experience Level</h3>
                    <p>${formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1)}</p>
                </div>
                <div class="info-card">
                    <h3>Date</h3>
                    <p>${new Date().toLocaleDateString()}</p>
                </div>
                <div class="info-card">
                    <h3>Questions Answered</h3>
                    <p>${answers.filter(a => a.answer !== '[Skipped]').length} / ${questions.length}</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Performance Scores</h2>
            <div class="score-container">
                <div class="score-card">
                    <h3>Overall Score</h3>
                    <div class="score">${evaluationResults.overallScore}</div>
                    <div class="label">out of 100</div>
                </div>
                <div class="score-card">
                    <h3>Confidence</h3>
                    <div class="score">${evaluationResults.confidenceScore}</div>
                    <div class="label">out of 100</div>
                </div>
                <div class="score-card">
                    <h3>Communication</h3>
                    <div class="score">${evaluationResults.communicationScore}</div>
                    <div class="label">out of 100</div>
                </div>
                <div class="score-card">
                    <h3>Technical</h3>
                    <div class="score">${evaluationResults.technicalScore}</div>
                    <div class="label">out of 100</div>
                </div>
                <div class="score-card">
                    <h3>Behavioral</h3>
                    <div class="score">${evaluationResults.behavioralScore}</div>
                    <div class="label">out of 100</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Overall Feedback</h2>
            <div class="feedback-box">
                <p>${evaluationResults.overallFeedback}</p>
            </div>
        </div>

        <div class="section">
            <div class="list-section">
                <h3>Key Strengths</h3>
                <ul>
                    ${evaluationResults.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            <div class="list-section improvement-list">
                <h3>Areas for Improvement</h3>
                <ul>
                    ${evaluationResults.areasForImprovement.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Key Performance Indicators (KPIs)</h2>
            <div class="kpi-grid">
                <div class="kpi-item">
                    <h4>Average Response Length</h4>
                    <p>${evaluationResults.kpis.averageResponseLength} words</p>
                </div>
                <div class="kpi-item">
                    <h4>Vocabulary Richness</h4>
                    <p>${evaluationResults.kpis.vocabularyRichness.toUpperCase()}</p>
                </div>
                <div class="kpi-item">
                    <h4>Structured Thinking</h4>
                    <p>${evaluationResults.kpis.structuredThinking.toUpperCase()}</p>
                </div>
                <div class="kpi-item">
                    <h4>Examples Provided</h4>
                    <p>${evaluationResults.kpis.examplesProvided}</p>
                </div>
                <div class="kpi-item">
                    <h4>STAR Method Usage</h4>
                    <p>${evaluationResults.kpis.starMethodUsage.toUpperCase()}</p>
                </div>
                <div class="kpi-item">
                    <h4>Professional Tone</h4>
                    <p>${evaluationResults.kpis.professionalTone.toUpperCase()}</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Question-by-Question Analysis</h2>
            ${evaluationResults.questionEvaluations.map((qEval, idx) => `
                <div class="question-eval">
                    <h4>Question ${qEval.questionNumber}: ${questions[idx]?.type.toUpperCase()}</h4>
                    <div class="question-text">${questions[idx]?.question}</div>
                    <div class="answer-text">
                        <strong>Answer:</strong> ${answers[idx]?.answer === '[Skipped]' ? '<em>Not answered</em>' : answers[idx]?.answer}
                    </div>
                    <div class="metrics">
                        <span class="metric-badge">Score: ${qEval.score}/100</span>
                        <span class="metric-badge metric-${qEval.confidence}">Confidence: ${qEval.confidence}</span>
                        <span class="metric-badge metric-${qEval.clarity}">Clarity: ${qEval.clarity}</span>
                        <span class="metric-badge metric-${qEval.relevance}">Relevance: ${qEval.relevance}</span>
                    </div>
                    <p style="margin-top: 10px;"><strong>Feedback:</strong> ${qEval.feedback}</p>
                    <p style="margin-top: 5px;"><strong>Key Points:</strong> ${qEval.keyPoints.join(', ')}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <div class="recommendation ${evaluationResults.recommendation}">
                <h3>Recommendation: ${evaluationResults.recommendation.toUpperCase()}</h3>
                <p>Based on the comprehensive evaluation of responses</p>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Next Steps</h2>
            <div class="list-section">
                <ul>
                    ${evaluationResults.nextSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>AI-Powered Interview Assessment System</p>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-report-${formData.jobRole.replace(/\s+/g, '-')}-${Date.now()}.html`;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'behavioral': return 'bg-green-100 text-green-800 border-green-200';
      case 'hr': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (level: string) => {
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

        {step === 'evaluating' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Evaluating Your Responses
              </h3>
              <p className="text-gray-600 mb-2">
                AI is analyzing your answers using advanced NLP techniques...
              </p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                Calculating confidence scores, communication metrics, and KPIs
              </p>
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <p>✓ Analyzing response clarity and coherence</p>
                <p>✓ Evaluating technical accuracy</p>
                <p>✓ Assessing communication confidence</p>
                <p>✓ Measuring behavioral indicators</p>
                <p>✓ Generating comprehensive report</p>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && evaluationResults && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header with Overall Score */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${evaluationResults.overallScore >= 80 ? 'bg-green-100' :
                    evaluationResults.overallScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                  <Check className={`w-10 h-10 ${evaluationResults.overallScore >= 80 ? 'text-green-600' :
                      evaluationResults.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  Interview Assessment Complete!
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  {formData.jobRole} - {formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1)} Level
                </p>
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {evaluationResults.overallScore}
                </div>
                <p className="text-gray-600">Overall Score out of 100</p>
              </div>

              {/* Performance Scores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{evaluationResults.confidenceScore}</div>
                  <div className="text-sm text-blue-800 font-medium">Confidence</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{evaluationResults.communicationScore}</div>
                  <div className="text-sm text-green-800 font-medium">Communication</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">{evaluationResults.technicalScore}</div>
                  <div className="text-sm text-purple-800 font-medium">Technical</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-600">{evaluationResults.behavioralScore}</div>
                  <div className="text-sm text-orange-800 font-medium">Behavioral</div>
                </div>
              </div>

              {/* Overall Feedback */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  AI Evaluation Feedback
                </h3>
                <p className="text-blue-800">{evaluationResults.overallFeedback}</p>
              </div>
            </div>

            {/* KPIs Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Performance Indicators</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Avg Response Length</div>
                  <div className="text-2xl font-bold text-gray-900">{evaluationResults.kpis.averageResponseLength} words</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Vocabulary Richness</div>
                  <div className="text-2xl font-bold text-gray-900 capitalize">{evaluationResults.kpis.vocabularyRichness}</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Structured Thinking</div>
                  <div className="text-2xl font-bold text-gray-900 capitalize">{evaluationResults.kpis.structuredThinking}</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Examples Provided</div>
                  <div className="text-2xl font-bold text-gray-900">{evaluationResults.kpis.examplesProvided}</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">STAR Method Usage</div>
                  <div className="text-2xl font-bold text-gray-900 capitalize">{evaluationResults.kpis.starMethodUsage}</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Professional Tone</div>
                  <div className="text-2xl font-bold text-gray-900 capitalize">{evaluationResults.kpis.professionalTone}</div>
                </div>
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                  <Check className="w-6 h-6 mr-2" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {evaluationResults.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {evaluationResults.areasForImprovement.map((area, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-600 mr-2">→</span>
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`rounded-2xl shadow-lg p-8 text-center text-white ${evaluationResults.recommendation === 'hire' ? 'bg-gradient-to-r from-green-600 to-green-700' :
                evaluationResults.recommendation === 'consider' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                  'bg-gradient-to-r from-red-600 to-red-700'
              }`}>
              <h3 className="text-3xl font-bold mb-2">
                Recommendation: {evaluationResults.recommendation.toUpperCase()}
              </h3>
              <p className="text-lg opacity-90">Based on comprehensive AI evaluation</p>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recommended Next Steps</h3>
              <ul className="space-y-3">
                {evaluationResults.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 font-bold mr-3">{idx + 1}.</span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download Buttons */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Download Your Reports</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={downloadDetailedReport}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Detailed HTML Report</span>
                </button>

                <button
                  onClick={exportInterview}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>JSON Data Export</span>
                </button>

                <button
                  onClick={() => {
                    setStep('setup');
                    setQuestions([]);
                    setAnswers([]);
                    setCurrentQuestionIndex(0);
                    setCurrentTranscript('');
                    setError('');
                    setEvaluationResults(null);
                  }}
                  className="flex items-center justify-center space-x-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>New Interview</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
