import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  Clock, Play, RotateCcw, Send, ChevronLeft, ChevronRight, Code, CheckCircle,
  XCircle, AlertCircle, Brain, Target, Shuffle, Settings, Database, TreePine,
  GitBranch, Layers, Zap, Hash, Search, BarChart3, Network, Cpu, FileText
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
  const [selectedCategories, setSelectedCategories] = useState({
    arrays: true,
    strings: true,
    linkedLists: false,
    stacks: false,
    queues: false,
    trees: false,
    graphs: false,
    dynamicProgramming: false,
    sorting: false,
    searching: false,
    hashing: false,
    greedy: false,
    backtracking: false,
    mathematics: false
  });
  const [useRandomGenerator, setUseRandomGenerator] = useState(false);
  const [generatingRandom, setGeneratingRandom] = useState(false);

  // DSA Category definitions with comprehensive subtypes
  const dsaCategories = {
    arrays: {
      name: "Arrays & Matrix",
      icon: Database,
      description: "Array manipulation, matrix operations, and 2D array problems",
      topics: ["Two Pointers", "Sliding Window", "Prefix Sum", "Matrix Traversal", "Subarray Problems"]
    },
    strings: {
      name: "Strings & Pattern Matching",
      icon: FileText,
      description: "String manipulation, pattern matching, and text processing",
      topics: ["String Matching", "Palindromes", "Anagrams", "Subsequences", "Regular Expressions"]
    },
    linkedLists: {
      name: "Linked Lists",
      icon: GitBranch,
      description: "Singly, doubly, and circular linked list operations",
      topics: ["Traversal", "Insertion/Deletion", "Reversal", "Cycle Detection", "Merging"]
    },
    stacks: {
      name: "Stacks & Queues",
      icon: Layers,
      description: "LIFO and FIFO data structure problems",
      topics: ["Expression Evaluation", "Parentheses Matching", "Next Greater Element", "Queue Operations"]
    },
    queues: {
      name: "Priority Queues & Heaps",
      icon: BarChart3,
      description: "Heap operations and priority-based problems",
      topics: ["Min/Max Heap", "Heap Sort", "Top K Elements", "Median Finding", "Priority Scheduling"]
    },
    trees: {
      name: "Trees & Binary Trees",
      icon: TreePine,
      description: "Tree traversal, BST operations, and tree algorithms",
      topics: ["Tree Traversal", "BST Operations", "Tree Construction", "LCA", "Path Problems"]
    },
    graphs: {
      name: "Graphs & Networks",
      icon: Network,
      description: "Graph algorithms, shortest paths, and network problems",
      topics: ["BFS/DFS", "Shortest Path", "MST", "Topological Sort", "Strongly Connected Components"]
    },
    dynamicProgramming: {
      name: "Dynamic Programming",
      icon: Zap,
      description: "Optimization problems using memoization and tabulation",
      topics: ["1D DP", "2D DP", "Knapsack", "LIS", "Edit Distance", "Coin Change"]
    },
    sorting: {
      name: "Sorting Algorithms",
      icon: BarChart3,
      description: "Various sorting techniques and their applications",
      topics: ["Quick Sort", "Merge Sort", "Heap Sort", "Counting Sort", "Custom Sorting"]
    },
    searching: {
      name: "Searching Algorithms",
      icon: Search,
      description: "Binary search and advanced searching techniques",
      topics: ["Binary Search", "Ternary Search", "Search in Rotated Array", "Peak Finding"]
    },
    hashing: {
      name: "Hashing & Hash Tables",
      icon: Hash,
      description: "Hash-based data structures and collision handling",
      topics: ["Hash Maps", "Hash Sets", "Collision Resolution", "Rolling Hash", "Bloom Filters"]
    },
    greedy: {
      name: "Greedy Algorithms",
      icon: Target,
      description: "Greedy choice property and optimization problems",
      topics: ["Activity Selection", "Huffman Coding", "Fractional Knapsack", "Job Scheduling"]
    },
    backtracking: {
      name: "Backtracking",
      icon: RotateCcw,
      description: "Exhaustive search with pruning techniques",
      topics: ["N-Queens", "Sudoku Solver", "Permutations", "Combinations", "Maze Solving"]
    },
    mathematics: {
      name: "Mathematical Algorithms",
      icon: Cpu,
      description: "Number theory, combinatorics, and mathematical problems",
      topics: ["Prime Numbers", "GCD/LCM", "Modular Arithmetic", "Combinatorics", "Bit Manipulation"]
    }
  };

  // Language configurations with proper syntax highlighting and execution
  const languageConfigs = {
    javascript: {
      name: "JavaScript",
      extension: "js",
      template: "function solution() {\n    // Your code here\n    \n}",
      executable: true
    },
    python: {
      name: "Python",
      extension: "py",
      template: "def solution():\n    # Your code here\n    pass",
      executable: true
    },
    java: {
      name: "Java",
      extension: "java",
      template: "class Solution {\n    public void solution() {\n        // Your code here\n        \n    }\n}",
      executable: true
    },
    cpp: {
      name: "C++",
      extension: "cpp",
      template: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Your code here\n        \n    }\n};",
      executable: true
    },
    go: {
      name: "Go",
      extension: "go",
      template: "package main\n\nimport \"fmt\"\n\nfunc solution() {\n    // Your code here\n    \n}",
      executable: true
    },
    rust: {
      name: "Rust",
      extension: "rs",
      template: "impl Solution {\n    pub fn solution() {\n        // Your code here\n        \n    }\n}",
      executable: false
    },
    typescript: {
      name: "TypeScript",
      extension: "ts",
      template: "function solution(): void {\n    // Your code here\n    \n}",
      executable: true
    },
    csharp: {
      name: "C#",
      extension: "cs",
      template: "public class Solution {\n    public void SolutionMethod() {\n        // Your code here\n        \n    }\n}",
      executable: false
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Comprehensive DSA question bank organized by categories
  const dsaQuestionBank = {
    arrays: [
      {
        id: 1,
        category: "arrays",
        title: "Two Sum",
        difficulty: "easy",
        tags: ["Array", "Hash Table", "Two Pointers"],
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
        category: "arrays",
        title: "Maximum Subarray",
        difficulty: "medium",
        tags: ["Array", "Dynamic Programming", "Kadane's Algorithm"],
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
        id: 3,
        category: "arrays",
        title: "Rotate Array",
        difficulty: "medium",
        tags: ["Array", "Math", "Two Pointers"],
        statement: "Given an array, rotate the array to the right by k steps, where k is non-negative.",
        examples: [
          { input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]" },
          { input: "nums = [-1,-100,3,99], k = 2", output: "[3,99,-1,-100]" }
        ],
        constraints: ["1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1", "0 <= k <= 10^5"],
        templates: {
          javascript: "function rotate(nums, k) {\n    // Your code here\n    \n}",
          python: "def rotate(nums, k):\n    # Your code here\n    pass",
          java: "class Solution {\n    public void rotate(int[] nums, int k) {\n        // Your code here\n        \n    }\n}",
          cpp: "class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        // Your code here\n        \n    }\n};"
        },
        testCases: [
          { input: { nums: [1, 2, 3, 4, 5, 6, 7], k: 3 }, expected: [5, 6, 7, 1, 2, 3, 4] },
          { input: { nums: [-1, -100, 3, 99], k: 2 }, expected: [3, 99, -1, -100] }
        ]
      }
    ],
    strings: [
      {
        id: 4,
        category: "strings",
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
        id: 5,
        category: "strings",
        title: "Longest Palindromic Substring",
        difficulty: "medium",
        tags: ["String", "Dynamic Programming"],
        statement: "Given a string s, return the longest palindromic substring in s.",
        examples: [
          { input: 's = "babad"', output: '"bab"' },
          { input: 's = "cbbd"', output: '"bb"' }
        ],
        constraints: ["1 <= s.length <= 1000", "s consist of only digits and English letters."],
        templates: {
          javascript: "function longestPalindrome(s) {\n    // Your code here\n    \n}",
          python: "def longest_palindrome(s):\n    # Your code here\n    pass",
          java: "class Solution {\n    public String longestPalindrome(String s) {\n        // Your code here\n        \n    }\n}",
          cpp: "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        // Your code here\n        \n    }\n};"
        },
        testCases: [
          { input: { s: "babad" }, expected: "bab" },
          { input: { s: "cbbd" }, expected: "bb" }
        ]
      }
    ],
    linkedLists: [
      {
        id: 6,
        category: "linkedLists",
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
      }
    ],
    trees: [
      {
        id: 7,
        category: "trees",
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
      }
    ],
    dynamicProgramming: [
      {
        id: 8,
        category: "dynamicProgramming",
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
    ]
  };


  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const savedAnswer = answers[currentQuestion.id]?.[language];
      setCode(savedAnswer || currentQuestion.templates?.[language] || languageConfigs[language]?.template || '');
      setShowOutput(false);
      setTestResults([]);
      setAiValidation(null);
    }
  }, [currentQuestionIndex, questions, answers, language]);

  useEffect(() => {
    if (!showSetup) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showSetup]);

  // Random question generator using AI
  const generateRandomQuestions = async () => {
    setGeneratingRandom(true);
    try {
      const enabledCategories = Object.entries(selectedCategories)
        .filter(([_, enabled]) => enabled)
        .map(([category, _]) => dsaCategories[category]?.name || category);

      if (enabledCategories.length === 0) {
        alert('Please select at least one category');
        return;
      }

      const prompt = `Generate ${questionCount} unique coding problems for a DSA assessment.
      
Categories to focus on: ${enabledCategories.join(', ')}
Difficulty: ${difficulty === 'mixed' ? 'Mix of easy, medium, and hard' : difficulty}

For each problem, provide:
1. A clear problem title
2. Problem statement with examples
3. Input/output constraints
4. Test cases with expected outputs
5. Difficulty level (easy/medium/hard)
6. Relevant tags/topics

Format as JSON array with this structure:
[
  {
    "id": 1,
    "title": "Problem Title",
    "difficulty": "easy|medium|hard",
    "category": "arrays|strings|trees|etc",
    "tags": ["tag1", "tag2"],
    "statement": "Problem description...",
    "examples": [{"input": "example input", "output": "expected output"}],
    "constraints": ["constraint1", "constraint2"],
    "testCases": [{"input": {"param": "value"}, "expected": "result"}]
  }
]

Make problems practical and interview-relevant. Ensure variety across selected categories.`;

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
              content: 'You are an expert DSA problem setter. Generate high-quality coding problems in valid JSON format only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Extract JSON from response
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('Invalid response format');
      }

      const jsonText = content.slice(jsonStart, jsonEnd + 1);
      const generatedQuestions = JSON.parse(jsonText);

      // Add templates for each language
      const questionsWithTemplates = generatedQuestions.map(q => ({
        ...q,
        templates: Object.fromEntries(
          Object.entries(languageConfigs).map(([lang, config]) => [
            lang,
            config.template.replace('solution', q.title.toLowerCase().replace(/\s+/g, ''))
          ])
        )
      }));

      setQuestions(questionsWithTemplates);
      setShowSetup(false);
      setCode(questionsWithTemplates[0]?.templates?.[language] || languageConfigs[language].template);

    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again or use predefined questions.');
    } finally {
      setGeneratingRandom(false);
    }
  };

  const generateQuestions = () => {
    if (useRandomGenerator) {
      generateRandomQuestions();
      return;
    }

    // Use predefined questions from selected categories
    const enabledCategories = Object.entries(selectedCategories)
      .filter(([_, enabled]) => enabled)
      .map(([category, _]) => category);

    if (enabledCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    let allQuestions = [];
    enabledCategories.forEach(category => {
      const categoryQuestions = dsaQuestionBank[category] || [];
      allQuestions = [...allQuestions, ...categoryQuestions];
    });

    // Filter by difficulty if not mixed
    if (difficulty !== 'mixed') {
      allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    }

    // Shuffle and select the requested number of questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    if (selected.length === 0) {
      alert('No questions available for the selected criteria. Please adjust your selection.');
      return;
    }

    setQuestions(selected);
    setShowSetup(false);
    setCode(selected[0]?.templates?.[language] || languageConfigs[language].template);

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

  // Language-specific code execution using Piston API
  const executeCodeWithPiston = async (code, testCase, language) => {
    try {
      // Map our language names to Piston language identifiers
      const languageMap = {
        javascript: { language: 'javascript', version: '18.15.0' },
        python: { language: 'python', version: '3.10.0' },
        java: { language: 'java', version: '15.0.2' },
        cpp: { language: 'c++', version: '10.2.0' },
        go: { language: 'go', version: '1.16.2' },
        rust: { language: 'rust', version: '1.68.2' },
        typescript: { language: 'typescript', version: '5.0.3' },
        csharp: { language: 'csharp', version: '6.12.0' }
      };

      const pistonConfig = languageMap[language];
      if (!pistonConfig) {
        throw new Error(`Language ${language} not supported`);
      }

      // Prepare code with test case execution
      let executableCode = code;
      const testInput = JSON.stringify(testCase.input);

      // Add test execution code based on language
      if (language === 'javascript' || language === 'typescript') {
        const functionMatch = code.match(/function\s+(\w+)/);
        const functionName = functionMatch ? functionMatch[1] : 'solution';
        executableCode += `\n\n// Test execution\nconst testInput = ${testInput};\nconst result = ${functionName}(...Object.values(testInput));\nconsole.log(JSON.stringify(result));`;
      } else if (language === 'python') {
        const functionMatch = code.match(/def\s+(\w+)/);
        const functionName = functionMatch ? functionMatch[1] : 'solution';
        executableCode += `\n\n# Test execution\nimport json\ntest_input = ${testInput}\nresult = ${functionName}(**test_input)\nprint(json.dumps(result))`;
      } else if (language === 'java') {
        // For Java, we need to wrap in a main method
        executableCode = code.replace(/class Solution/, `import java.util.*;\nimport com.google.gson.Gson;\n\nclass Solution`) + `\n\npublic static void main(String[] args) {\n  Solution sol = new Solution();\n  String testInput = "${testInput.replace(/"/g, '\\"')}";\n  // Parse and execute test\n  System.out.println("Execution completed");\n}`;
      } else if (language === 'cpp') {
        executableCode += `\n\nint main() {\n  Solution sol;\n  // Test execution\n  std::cout << "Execution completed" << std::endl;\n  return 0;\n}`;
      }

      // Call Piston API
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: pistonConfig.language,
          version: pistonConfig.version,
          files: [{
            name: `solution.${languageMap[language].language === 'c++' ? 'cpp' : languageMap[language].language}`,
            content: executableCode
          }],
          stdin: '',
          args: [],
          compile_timeout: 10000,
          run_timeout: 3000,
          compile_memory_limit: -1,
          run_memory_limit: -1
        })
      });

      if (!response.ok) {
        throw new Error('Code execution service unavailable');
      }

      const data = await response.json();

      if (data.compile && data.compile.code !== 0) {
        return {
          success: false,
          error: data.compile.stderr || data.compile.output || 'Compilation error'
        };
      }

      if (data.run.code !== 0) {
        return {
          success: false,
          error: data.run.stderr || data.run.output || 'Runtime error'
        };
      }

      // Parse output
      const output = data.run.stdout.trim();
      let result;

      try {
        result = JSON.parse(output);
      } catch {
        // If not JSON, return as string
        result = output;
      }

      return { success: true, result, executionTime: data.run.time };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fallback local execution for JavaScript
  const executeCodeLocally = (code, testCase) => {
    try {
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
        throw new Error('Local execution only supports JavaScript');
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

  const handleRunCode = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setAiValidation(null);

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      setIsRunning(false);
      return;
    }

    const testCases = currentQuestion.testCases || [];
    const results = [];

    // Execute test cases sequentially
    for (let index = 0; index < testCases.length; index++) {
      const testCase = testCases[index];

      // Try Piston API first, fallback to local execution for JavaScript
      let execution;
      try {
        execution = await executeCodeWithPiston(code, testCase, language);
      } catch (error) {
        console.log('Piston API failed, trying local execution:', error);
        if (language === 'javascript') {
          execution = executeCodeLocally(code, testCase);
        } else {
          execution = {
            success: false,
            error: 'Remote execution unavailable. Please try again or use JavaScript for local testing.'
          };
        }
      }

      if (!execution.success) {
        results.push({
          caseNumber: index + 1,
          passed: false,
          error: execution.error,
          input: testCase.input,
          expected: testCase.expected,
          executionTime: execution.executionTime
        });
        continue;
      }

      const passed = Array.isArray(testCase.expected)
        ? arraysEqual(execution.result, testCase.expected)
        : JSON.stringify(execution.result) === JSON.stringify(testCase.expected);

      results.push({
        caseNumber: index + 1,
        passed,
        input: testCase.input,
        output: execution.result,
        expected: testCase.expected,
        executionTime: execution.executionTime
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Run tests first for all languages
    await handleRunCode();

    // Wait a bit for state to update
    setTimeout(() => {
      const allPassed = testResults.every(r => r.passed);
      if (allPassed && !completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      }

      // Save answer and validate
      saveAnswerAndValidate();
    }, 500);
  };

  const saveAnswerAndValidate = () => {
    const currentQuestion = questions[currentQuestionIndex];
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced DSA Assessment</h1>
              <p className="text-gray-600">Comprehensive Data Structures & Algorithms evaluation with multi-language support</p>
            </div>

            <div className="space-y-8">
              {/* Question Generation Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Question Generation Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${!useRandomGenerator ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      checked={!useRandomGenerator}
                      onChange={() => setUseRandomGenerator(false)}
                      className="mr-3 w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="flex items-center mb-1">
                        <Database className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Curated Questions</span>
                      </div>
                      <p className="text-sm text-gray-600">Hand-picked, tested problems from our question bank</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${useRandomGenerator ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      checked={useRandomGenerator}
                      onChange={() => setUseRandomGenerator(true)}
                      className="mr-3 w-4 h-4 text-purple-600"
                    />
                    <div>
                      <div className="flex items-center mb-1">
                        <Shuffle className="w-4 h-4 mr-2 text-purple-600" />
                        <span className="font-medium">AI Generated</span>
                      </div>
                      <p className="text-sm text-gray-600">Fresh, unique problems generated by AI for each session</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select DSA Categories *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(dsaCategories).map(([key, info]) => {
                    const IconComponent = info.icon;
                    return (
                      <label
                        key={key}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedCategories[key]
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories[key]}
                          onChange={(e) =>
                            setSelectedCategories({
                              ...selectedCategories,
                              [key]: e.target.checked,
                            })
                          }
                          className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <IconComponent className="w-5 h-5 mr-2 text-blue-600" />
                            <span className="font-medium text-gray-900">{info.name}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {info.topics.slice(0, 2).map((topic, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                              >
                                {topic}
                              </span>
                            ))}
                            {info.topics.length > 2 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                +{info.topics.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2}>2 Questions</option>
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit</label>
                  <select
                    value={timeLeft / 60}
                    onChange={(e) => setTimeLeft(parseInt(e.target.value) * 60)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(languageConfigs).map(([key, config]) => (
                      <option key={key} value={key}>{config.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Assessment Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Select at least one DSA category to proceed</li>
                  <li>• {useRandomGenerator ? 'AI will generate unique problems based on your selections' : 'Questions will be selected from our curated problem bank'}</li>
                  <li>• Code editor supports {Object.keys(languageConfigs).length} programming languages</li>
                  <li>• Each problem includes test cases for validation</li>
                  <li>• You can switch between languages during the assessment</li>
                  <li>• Solutions are auto-saved as you type</li>
                </ul>
              </div>

              <button
                onClick={generateQuestions}
                disabled={Object.values(selectedCategories).every(v => !v) || generatingRandom}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingRandom ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Start DSA Assessment</span>
                  </>
                )}
              </button>
            </div>
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
            <div>
              <h2 className="text-2xl font-bold">{currentQuestion?.title}</h2>
              {currentQuestion?.category && (
                <div className="flex items-center mt-2">
                  {(() => {
                    const categoryInfo = dsaCategories[currentQuestion.category];
                    const IconComponent = categoryInfo?.icon || Code;
                    return (
                      <div className="flex items-center text-sm text-gray-600">
                        <IconComponent className="w-4 h-4 mr-1" />
                        <span>{categoryInfo?.name || currentQuestion.category}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
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
                  {Object.entries(languageConfigs).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
                {!languageConfigs[language]?.executable && (
                  <span className="text-xs text-amber-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Syntax support only
                  </span>
                )}
                {languageConfigs[language]?.executable && language !== 'javascript' && (
                  <span className="text-xs text-blue-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Simulated execution
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
                    const template = currentQuestion?.templates?.[language] || languageConfigs[language]?.template || '';
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
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${completedQuestions.includes(questions[i]?.id) ? 'bg-green-100 text-green-800' :
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
