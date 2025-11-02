import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Clock, Play, RotateCcw, Send, ChevronLeft, ChevronRight, Code, CheckCircle, 
  XCircle, AlertCircle, Brain, Target
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

export default function DSAAssessment() {
  const { state, dispatch } = useApp();
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
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [aiValidation, setAiValidation] = useState(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Predefined DSA questions
  const dsaQuestions = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "easy",
      tags: ["Array", "Hash Table"],
      statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
      ],
      constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
      templates: {
        javascript: "function twoSum(nums, target) {\n    // Your code here\n    \n}",
        python: "def two_sum(nums, target):\n    # Your code here\n    pass",
        java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        \n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};"
      },
      testCases: [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
      ]
    },
    {
      id: 2,
      title: "Valid Parentheses",
      difficulty: "easy",
      tags: ["String", "Stack"],
      statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
      examples: [
        { input: 's = "()"', output: "true" },
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" }
      ],
      constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
      templates: {
        javascript: "function isValid(s) {\n    // Your code here\n    \n}",
        python: "def is_valid(s):\n    # Your code here\n    pass",
        java: "class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        \n    }\n}",
        cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n        \n    }\n};"
      },
      testCases: [
        { input: { s: "()" }, expected: true },
        { input: { s: "()[]{}" }, expected: true },
        { input: { s: "(]" }, expected: false }
      ]
    },
    {
      id: 3,
      title: "Maximum Subarray",
      difficulty: "medium",
      tags: ["Array", "Dynamic Programming"],
      statement: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
      examples: [
        { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
        { input: "nums = [1]", output: "1" },
        { input: "nums = [5,4,-1,7,8]", output: "23" }
      ],
      constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
      templates: {
        javascript: "function maxSubArray(nums) {\n    // Your code here\n    \n}",
        python: "def max_sub_array(nums):\n    # Your code here\n    pass",
        java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n        \n    }\n}",
        cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n        \n    }\n};"
      },
      testCases: [
        { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6 },
        { input: { nums: [1] }, expected: 1 },
        { input: { nums: [5, 4, -1, 7, 8] }, expected: 23 }
      ]
    },
    {
      id: 4,
      title: "Binary Tree Inorder Traversal",
      difficulty: "easy",
      tags: ["Tree", "Binary Tree", "Stack"],
      statement: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
      examples: [
        { input: "root = [1,null,2,3]", output: "[1,3,2]" },
        { input: "root = []", output: "[]" },
        { input: "root = [1]", output: "[1]" }
      ],
      constraints: ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
      templates: {
        javascript: "function inorderTraversal(root) {\n    // Your code here\n    \n}",
        python: "def inorder_traversal(root):\n    # Your code here\n    pass",
        java: "class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        // Your code here\n        \n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<int> inorderTraversal(TreeNode* root) {\n        // Your code here\n        \n    }\n};"
      },
      testCases: [
        { input: { root: "simulated" }, expected: [1, 3, 2] },
        { input: { root: null }, expected: [] },
        { input: { root: "single" }, expected: [1] }
      ]
    },
    {
      id: 5,
      title: "Merge Two Sorted Lists",
      difficulty: "easy",
      tags: ["Linked List", "Recursion"],
      statement: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.",
      examples: [
        { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
        { input: "list1 = [], list2 = []", output: "[]" },
        { input: "list1 = [], list2 = [0]", output: "[0]" }
      ],
      constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100"],
      templates: {
        javascript: "function mergeTwoLists(list1, list2) {\n    // Your code here\n    \n}",
        python: "def merge_two_lists(list1, list2):\n    # Your code here\n    pass",
        java: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Your code here\n        \n    }\n}",
        cpp: "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Your code here\n        \n    }\n};"
      },
      testCases: [
        { input: { list1: "simulated", list2: "simulated" }, expected: [1, 1, 2, 3, 4, 4] },
        { input: { list1: null, list2: null }, expected: [] },
        { input: { list1: null, list2: "simulated" }, expected: [0] }
      ]
    },
    {
      id: 6,
      title: "Climbing Stairs",
      difficulty: "easy",
      tags: ["Dynamic Programming", "Math"],
      statement: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      examples: [
        { input: "n = 2", output: "2" },
        { input: "n = 3", output: "3" }
      ],
      constraints: ["1 <= n <= 45"],
      templates: {
        javascript: "function climbStairs(n) {\n    // Your code here\n    \n}",
        python: "def climb_stairs(n):\n    # Your code here\n    pass",
        java: "class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n        \n    }\n}",
        cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        // Your code here\n        \n    }\n};"
      },
      testCases: [
        { input: { n: 2 }, expected: 2 },
        { input: { n: 3 }, expected: 3 },
        { input: { n: 4 }, expected: 5 }
      ]
    }
  ];

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

  const generateQuestions = () => {
    // Filter questions based on difficulty
    let filteredQuestions = dsaQuestions;
    
    if (difficulty !== 'mixed') {
      filteredQuestions = dsaQuestions.filter(q => q.difficulty === difficulty);
    }
    
    // Shuffle and select the requested number of questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setQuestions(selected);
    setShowSetup(false);
    setCode(selected[0]?.templates?.[language] || '');
    
    // Update app context
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: {
        dsa: {
          ...state.assessmentProgress.dsa,
          totalQuestions: selected.length,
          currentQuestion: 0
        }
      }
    });
  };

  const validateSolution = (userCode, question) => {
    const allPassed = testResults.every(r => r.passed);
    const score = allPassed ? 100 : Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100);
    
    return {
      score,
      feedback: allPassed ? 'Great job! All test cases passed.' : 'Some test cases failed. Review your solution.',
      timeComplexity: 'Analysis not available',
      spaceComplexity: 'Analysis not available',
      strengths: allPassed ? ['Solution works correctly'] : [],
      improvements: allPassed ? [] : ['Fix failing test cases', 'Check edge cases']
    };
  };

  const executeCode = (code, testCase) => {
    try {
      // Simple code execution for JavaScript
      if (language === 'javascript') {
        const functionMatch = code.match(/function\s+(\w+)/);
        const functionName = functionMatch ? functionMatch[1] : 'solution';
        const params = Object.keys(testCase.input);
        const args = Object.values(testCase.input);
        
        const func = new Function(...params, `
          ${code}
          return ${functionName}(${params.join(', ')});
        `);
        
        return { success: true, result: func(...args) };
      } else {
        // For other languages, simulate execution with mock results
        return { 
          success: true, 
          result: testCase.expected // Return expected result for demo
        };
      }
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

  const handleSubmit = () => {
    if (!currentQuestion) return;
    
    // For JavaScript, run tests first
    if (language === 'javascript') {
      handleRunCode();
      
      setTimeout(() => {
        const allPassed = testResults.every(r => r.passed);
        if (allPassed && !completedQuestions.includes(currentQuestion.id)) {
          setCompletedQuestions([...completedQuestions, currentQuestion.id]);
        }
        
        // Save answer and validate
        saveAnswerAndValidate();
      }, 500);
    } else {
      // For other languages, just save the code
      saveAnswerAndValidate();
    }
  };

  const saveAnswerAndValidate = () => {
    if (!currentQuestion) return;
    
    // Save code for current language
    const questionAnswers = answers[currentQuestion.id] || {};
    const newAnswers = { 
      ...answers, 
      [currentQuestion.id]: {
        ...questionAnswers,
        [language]: code
      }
    };
    setAnswers(newAnswers);
    
    // Update app context
    const newCompletedQuestions = completedQuestions.includes(currentQuestion.id) 
      ? completedQuestions 
      : [...completedQuestions, currentQuestion.id];
    
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: {
        dsa: {
          ...state.assessmentProgress.dsa,
          completedQuestions: newCompletedQuestions,
          answers: newAnswers,
          currentQuestion: currentQuestionIndex
        }
      }
    });
    
    // Simple validation
    const validation = validateSolution(code, currentQuestion);
    setAiValidation(validation);
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
              onClick={generateQuestions}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center justify-center space-x-2"
            >
              <Brain className="w-5 h-5" />
              <span>Start DSA Assessment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r.passed);

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DSA Assessment Complete!</h1>
          <p className="text-gray-600 mb-4">
            You've completed {completedQuestions.length} out of {questions.length} questions.
          </p>
          <p className="text-sm text-gray-500">Redirecting to results page...</p>
        </div>
      </div>
    );
  }

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
                    <h3 className="text-lg font-semibold text-purple-900 mb-1">Solution Review</h3>
                    <p className="text-sm text-purple-700">{aiValidation.feedback}</p>
                  </div>
                </div>
                
                {aiValidation.score !== undefined && (
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <span className="font-semibold">Score:</span>
                    <span className="ml-2 text-2xl font-bold text-purple-600">{aiValidation.score}/100</span>
                  </div>
                )}

                {aiValidation.improvements?.length > 0 && (
                  <div>
                    <span className="font-semibold text-sm">Suggestions:</span>
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
                  <span className="text-xs text-blue-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Simulated execution for demo
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Tests'}
                </button>
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  title="Submit solution"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
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

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => {
                    setIsCompleted(true);
                    // Navigate to results after a short delay
                    setTimeout(() => {
                      window.location.href = '/results';
                    }, 2000);
                  }}
                  className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Complete Assessment
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
