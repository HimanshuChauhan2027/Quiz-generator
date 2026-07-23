const genAI = require("../config/gemini");

// Schema Gemini must follow, so the response is already valid JSON
// and we don't need to parse markdown fences ourselves.
const quizSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer: { type: "string" },
        },
        required: ["question", "options", "answer"],
      },
    },
  },
  required: ["questions"],
};

async function generateQuizQuestions(topic, difficulty, language, numQuestions = 5) {
  const prompt = `Generate a ${difficulty} quiz about "${topic}" in ${language} with ${numQuestions} questions.

Requirements:
- Questions must be accurate, clear, and appropriate for a ${difficulty} level
- Each question must have exactly 4 options with only one correct answer
- Options should be plausible and clearly distinct from each other
- Include a mix of question types (factual, conceptual, analytical)`;

  const response = await genAI.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
    },
  });

  const data = JSON.parse(response.text);
  return data.questions;
}

module.exports = { generateQuizQuestions };
