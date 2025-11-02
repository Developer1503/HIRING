const express = require('express');
const router = express.Router();

// Mock Groq API endpoints for development
router.post('/groq/chat', (req, res) => {
  const { messages, model } = req.body;
  
  // Simple mock responses based on the request
  const userMessage = messages[messages.length - 1]?.content || '';
  
  let mockResponse = '';
  
  if (userMessage.includes('aptitude questions')) {
    mockResponse = `[
      {
        "id": 1,
        "question": "What is 25% of 80?",
        "options": ["15", "20", "25", "30"],
        "correct": "20"
      },
      {
        "id": 2,
        "question": "If a train travels 120 km in 2 hours, what is its average speed?",
        "options": ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
        "correct": "60 km/h"
      }
    ]`;
  } else if (userMessage.includes('interview questions')) {
    mockResponse = `1. Tell me about your experience in software development? (Type: behavioral)
2. How do you handle debugging complex issues? (Type: technical)
3. Why are you interested in this position? (Type: hr)`;
  } else if (userMessage.includes('coding problems')) {
    mockResponse = `[
      {
        "id": 1,
        "title": "Two Sum",
        "difficulty": "easy",
        "tags": ["Array", "Hash Table"],
        "statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "examples": [{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}],
        "constraints": ["2 <= nums.length <= 10^4"],
        "templates": {
          "javascript": "function twoSum(nums, target) { /* code here */ }",
          "python": "def two_sum(nums, target): pass"
        },
        "testCases": [{"input": {"nums": [2,7,11,15], "target": 9}, "expected": [0,1]}]
      }
    ]`;
  } else {
    mockResponse = 'Mock response for development purposes.';
  }
  
  res.json({
    choices: [{
      message: {
        content: mockResponse
      }
    }]
  });
});

// Mock models endpoint
router.get('/groq/models', (req, res) => {
  res.json({
    data: [
      { id: 'llama-3.3-70b-versatile', object: 'model' },
      { id: 'mixtral-8x7b-32768', object: 'model' }
    ]
  });
});

module.exports = router;