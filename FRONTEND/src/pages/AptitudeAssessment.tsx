"use client";

import React, { useState } from "react";
import {
  Brain,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function AptitudeQuestionGenerator() {
  // Read API key from Vite env var to avoid committing secrets
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_KEY || '');
  const [showKey, setShowKey] = useState(false);
  const [category, setCategory] = useState("logical");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { width, height } = useWindowSize();

  // --- Generate Questions ---
  const generateQuestions = async () => {
    // API key is now hardcoded, no need to validate
    setError("");
    setLoading(true);
    setQuestions([]);
    setSubmitted(false);
    setTestMode(false);
    setUserAnswers({});
    setScore(0);

    try {
      const prompt = `
Generate ${numQuestions} multiple-choice aptitude questions on ${category} reasoning (${difficulty} difficulty).
Each question should be formatted as valid JSON array objects like this:
[
  {
    "id": 1,
    "question": "Sample question text?",
    "options": ["A", "B", "C", "D"],
    "correct": "B"
  }
]
Return ONLY JSON array.
      `;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are an AI that generates structured aptitude test questions in JSON format only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";

      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]");
      const jsonText = text.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonText);

      setQuestions(parsed);
      setTestMode(true); // start test mode after generation
    } catch (err) {
      console.error(err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Answer Selection ---
  const handleSelect = (qIndex, option) => {
    if (!submitted) {
      setUserAnswers({ ...userAnswers, [qIndex]: option });
    }
  };

  // --- Submit Test ---
  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correctCount++;
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center py-10 px-4">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-center mb-6 space-x-2">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Aptitude Question Generator (Groq AI)
          </h1>
        </div>

        {/* API Key is now hardcoded - no input needed */}

        {/* Form Inputs */}
        {!testMode && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="logical">Logical</option>
                  <option value="quantitative">Quantitative</option>
                  <option value="verbal">Verbal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  No. of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={generateQuestions}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Questions
                </>
              )}
            </button>
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
            <XCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* TEST MODE */}
        {testMode && questions.length > 0 && (
          <div className="mt-8 relative">
            {/* Confetti for perfect score */}
            {submitted && score === questions.length && (
              <Confetti width={width} height={height} numberOfPieces={300} />
            )}

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Aptitude Test ({questions.length} Questions)
            </h2>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <p className="font-medium text-gray-900 mb-2">
                    {i + 1}. {q.question}
                  </p>
                  <ul className="grid grid-cols-2 gap-2 text-gray-700 text-sm">
                    {q.options.map((opt, j) => {
                      const isSelected = userAnswers[i] === opt;
                      const isCorrect = q.correct === opt;
                      let bg = "bg-white";

                      if (submitted) {
                        if (isCorrect) bg = "bg-green-100 border-green-400";
                        else if (isSelected && !isCorrect)
                          bg = "bg-red-100 border-red-400";
                      } else if (isSelected) bg = "bg-blue-100 border-blue-400";

                      return (
                        <li
                          key={j}
                          onClick={() => handleSelect(i, opt)}
                          className={`p-2 border rounded-lg cursor-pointer ${bg}`}
                        >
                          {String.fromCharCode(65 + j)}. {opt}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
              >
                Submit Test
              </button>
            ) : (
              <div className="mt-6 text-center">
                <p
                  className={`text-xl font-semibold ${
                    score === questions.length ? "text-purple-600" : "text-green-700"
                  }`}
                >
                  ✅ You scored {score}/{questions.length}
                </p>
                <button
                  onClick={() => setTestMode(false)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Generate New Test
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
