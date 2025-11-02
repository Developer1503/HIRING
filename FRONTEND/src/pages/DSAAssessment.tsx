import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Play, RotateCcw, Send, ChevronLeft, ChevronRight, Code, CheckCircle, 
  Dot, XCircle, AlertCircle, Sparkles, Key, Loader2, Brain, Download
} from 'lucide-react';

function CodeEditor({ value, onChange }) {
  const textareaRef = useRef(null);
  const [lineNumbers, setLineNumbers] = useState([]);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="relative w-full h-full flex bg-gray-900">
      <div className="flex-shrink-0 w-12 bg-gray-800 text-gray-500 text-right pr-2 pt-4 font-mono text-sm select-none overflow-hidden">
        {lineNumbers.map((num) => (
          <div key={num} className="leading-6">{num}</div>
        ))}
      </div>
      <div className="relative flex-1 font-mono text-sm">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 p-4 bg-gray-900 text-gray-100 overflow-auto resize-none outline-none"
          style={{ whiteSpace: 'pre', wordWrap: 'normal' }}
          spellCheck="false"
          placeholder="// Write your code here..."
        />
      </div>
    </div>
  );
}

export default function AIDSAAssessment() {
  // Read API key from Vite env var to avoid committing secrets
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_KEY || '');
  const [showSetup, setShowSetup] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [showOutput, setShowOutput] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [aiValidation, setAiValidation] = useState(null);
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(3);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = answers[currentQuestion.id]?.[language];
      setCode(savedAnswer || currentQuestion.templates?.[language] || currentQuestion.template || '');
      setShowOutput(false);
      setTestResults([]);
      setAiValidation(null);
    }
  }, [currentQuestionIndex, currentQuestion, answers, language]);

  useEffect(() => {
    if (!showSetup) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showSetup]);

  const generateQuestionsWithAI = async () => {
    // API key is now hardcoded, no need to check
    setIsGenerating(true);

    const difficultyInstruction = difficulty === 'mixed' 
      ? 'Mix of easy and medium difficulty' 
      : `All ${difficulty} difficulty`;

    const prompt = `Generate ${questionCount} coding problems for a DSA assessment. Return ONLY valid JSON array:

[
  {
    "id": 1,
    "title": "Two Sum",
    "difficulty": "easy",
    "tags": ["Array", "Hash Table"],
    "statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "examples": [
      {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}
    ],
    "constraints": ["2 <= nums.length <= 10^4"],
    "templates": {
      "javascript": "function twoSum(nums, target) { /* code here */ }",
      "python": "def two_sum(nums, target): pass",
      "java": "class Solution { public int[] twoSum(int[] nums, int target) { } }",
      "cpp": "class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { } };"
    },
    "testCases": [
      {"input": {"nums": [2,7,11,15], "target": 9}, "expected": [0,1]}
    ]
  }
]

Requirements: ${difficultyInstruction}, 3 test cases per problem, include templates for all 4 languages`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Generate only valid JSON arrays.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 4000
        })
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '';
      
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || content.match(/(\[[\s\S]*\])/);
      if (jsonMatch) content = jsonMatch[1];
      
      const generatedQuestions = JSON.parse(content);
      setQuestions(generatedQuestions);
      setShowSetup(false);
      setCode(generatedQuestions[0].templates?.[language] || generatedQuestions[0].template || '');
    } catch (error) {
      alert(`Failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const validateSolutionWithAI = async (userCode, question) => {
    setIsValidating(true);

    const prompt = `Analyze this ${language} solution (return JSON only):

Problem: ${question.title}
Language: ${language}
Code: ${userCode}

Format:
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "strengths": ["Clear logic"],
  "improvements": ["Add edge cases"],
  "bugs": [],
  "score": 85,
  "feedback": "Good solution"
}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Return only valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) throw new Error('Validation failed');

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '';
      
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) content = jsonMatch[1];
      
      setAiValidation(JSON.parse(content));
    } catch (error) {
      setAiValidation({
        feedback: 'AI validation unavailable',
        score: testResults.every(r => r.passed) ? 100 : 0
      });
    } finally {
      setIsValidating(false);
    }
  };

  const executeCode = (code, testCase) => {
    try {
      if (language !== 'javascript') {
        return { 
          success: false, 
          error: `Code execution only supports JavaScript. ${language} requires a backend compiler.` 
        };
      }

      const functionMatch = code.match(/function\s+(\w+)/);
      const functionName = functionMatch ? functionMatch[1] : 'solution';
      const params = Object.keys(testCase.input);
      const args = Object.values(testCase.input);
      
      const func = new Function(...params, `
        ${code}
        return ${functionName}(${params.join(', ')});
      `);
      
      return { success: true, result: func(...args) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b || a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return sortedA.every((val, i) => val === sortedB[i]);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setShowOutput(true);
    setAiValidation(null);
    
    const results = (currentQuestion?.testCases || []).map((testCase, index) => {
      const execution = executeCode(code, testCase);

      if (!execution.success) {
        return {
          caseNumber: index + 1,
          passed: false,
          error: execution.error,
          input: testCase.input,
          expected: testCase.expected
        };
      }

      const passed = Array.isArray(testCase.expected) 
        ? arraysEqual(execution.result, testCase.expected)
        : JSON.stringify(execution.result) === JSON.stringify(testCase.expected);

      return {
        caseNumber: index + 1,
        passed,
        input: testCase.input,
        output: execution.result,
        expected: testCase.expected
      };
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    // For non-JavaScript languages, skip test execution and go directly to AI review
    if (language !== 'javascript') {
      setShowOutput(false);
      setIsValidating(true);
      
      setTimeout(async () => {
        if (!currentQuestion) return;
        
        // Save code for current language
        const questionAnswers = answers[currentQuestion.id] || {};
        setAnswers({ 
          ...answers, 
          [currentQuestion.id]: {
            ...questionAnswers,
            [language]: code
          }
        });
        
        await validateSolutionWithAI(code, currentQuestion);
      }, 100);
      return;
    }

    // For JavaScript, run tests first then validate
    handleRunCode();
    
    setTimeout(async () => {
      if (!currentQuestion) return;
      
      const allPassed = testResults.every(r => r.passed);
      if (allPassed && !completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      }
      
      // Save code for current language
      const questionAnswers = answers[currentQuestion.id] || {};
      setAnswers({ 
        ...answers, 
        [currentQuestion.id]: {
          ...questionAnswers,
          [language]: code
        }
      });
      
      await validateSolutionWithAI(code, currentQuestion);
    }, 500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI DSA Assessment</h1>
            <p className="text-gray-600">Generate coding questions with AI validation</p>
          </div>

          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateQuestionsWithAI}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Questions</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r.passed);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">AI DSA Assessment</h1>
            <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className={`font-mono text-lg font-semibold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="w-1/2 bg-white border-r overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{currentQuestion?.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion?.difficulty)}`}>
              {currentQuestion?.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {currentQuestion?.tags?.map((tag) => (
              <span key={tag} className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">{tag}</span>
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Problem</h3>
              <p className="text-gray-700 leading-relaxed">{currentQuestion?.statement}</p>
            </div>

            {currentQuestion?.examples?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Examples</h3>
                {currentQuestion.examples.map((ex, i) => (
                  <div key={i} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Example {i + 1}:</p>
                    <p className="text-sm font-mono"><strong>Input:</strong> {ex.input}</p>
                    <p className="text-sm font-mono"><strong>Output:</strong> {ex.output}</p>
                  </div>
                ))}
              </div>
            )}

            {aiValidation && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5">
                <div className="flex items-start mb-4">
                  <Brain className="w-6 h-6 text-purple-600 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-1">AI Review</h3>
                    <p className="text-sm text-purple-700">{aiValidation.feedback}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  {aiValidation.score !== undefined && (
                    <div className="bg-white rounded-lg p-3">
                      <span className="font-semibold">Score:</span>
                      <span className="ml-2 text-2xl font-bold text-purple-600">{aiValidation.score}/100</span>
                    </div>
                  )}
                  {aiValidation.timeComplexity && (
                    <div className="bg-white rounded-lg p-3">
                      <span className="font-semibold">Time:</span>
                      <span className="ml-2 font-mono text-purple-600">{aiValidation.timeComplexity}</span>
                    </div>
                  )}
                </div>

                {aiValidation.strengths?.length > 0 && (
                  <div className="mb-3">
                    <span className="font-semibold text-sm">Strengths:</span>
                    <ul className="ml-4 mt-1">
                      {aiValidation.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-green-700">✓ {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiValidation.improvements?.length > 0 && (
                  <div>
                    <span className="font-semibold text-sm">Improvements:</span>
                    <ul className="ml-4 mt-1">
                      {aiValidation.improvements.map((imp, i) => (
                        <li key={i} className="text-sm text-yellow-700">→ {imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Code className="w-5 h-5 text-gray-600" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                {language !== 'javascript' && (
                  <span className="text-xs text-yellow-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Code execution unavailable - AI review only
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || language !== 'javascript'}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={language !== 'javascript' ? 'Code execution only available for JavaScript' : ''}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Tests'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isValidating}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  title="Submit for AI review"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {language === 'javascript' ? 'Submit' : 'AI Review'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const template = currentQuestion?.templates?.[language] || currentQuestion?.template || '';
                    setCode(template);
                  }}
                  className="inline-flex items-center px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className={showOutput ? "h-3/5" : "h-full"}>
              <CodeEditor value={code} onChange={setCode} />
            </div>

            {showOutput && (
              <div className="h-2/5 border-t bg-gray-50 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Test Results</h4>
                  {allTestsPassed && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      All passed!
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {testResults.map((result, i) => (
                    <div key={i} className={`p-3 rounded-lg border-2 ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Test {result.caseNumber}</span>
                        {result.passed ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                      
                      {result.error ? (
                        <div className="text-sm text-red-700 font-mono">{result.error}</div>
                      ) : (
                        <div className="text-xs space-y-1">
                          <div><strong>Input:</strong> {JSON.stringify(result.input)}</div>
                          <div><strong>Output:</strong> {JSON.stringify(result.output)}</div>
                          <div><strong>Expected:</strong> {JSON.stringify(result.expected)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border-t p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex gap-2">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      completedQuestions.includes(questions[i]?.id) ? 'bg-green-100 text-green-800' :
                      i === currentQuestionIndex ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
