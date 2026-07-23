const { Quiz } = require("../models");

async function saveGeneratedQuiz({ topic, difficulty, language, questions, ownerId }) {
  return Quiz.create({
    title: topic,
    description: `Auto-generated ${difficulty} quiz about ${topic}`,
    language,
    difficulty,
    questions,
    ownerId,
    isPublic: false,
  });
}

module.exports = { saveGeneratedQuiz };
