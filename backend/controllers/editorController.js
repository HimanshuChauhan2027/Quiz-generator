const { Quiz } = require("../models");

function quizResponse(quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    language: quiz.language,
    difficulty: quiz.difficulty,
    questions: quiz.questions,
    is_public: quiz.isPublic,
    created_at: quiz.createdAt,
  };
}

async function getMyQuizzes(req, res) {
  const quizzes = await Quiz.findAll({
    where: { ownerId: req.user.id },
    order: [["createdAt", "DESC"]],
  });
  res.json(quizzes.map(quizResponse));
}

async function duplicateQuiz(req, res) {
  const original = await Quiz.findByPk(req.params.id);
  if (!original) return res.status(404).json({ message: "Quiz not found" });

  const copy = await Quiz.create({
    title: `${original.title} (Copy)`,
    description: original.description,
    language: original.language,
    difficulty: original.difficulty,
    questions: original.questions,
    ownerId: req.user.id,
  });

  res.json(quizResponse(copy));
}

// A few ready-made quizzes so the editor isn't empty on first use
const TEMPLATES = [
  {
    id: "general-knowledge",
    title: "General Knowledge Template",
    description: "A basic general knowledge quiz template",
    difficulty: "easy",
    language: "English",
    questions: [
      { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: "Paris" },
      { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
    ],
  },
  {
    id: "science-basic",
    title: "Basic Science Template",
    description: "A basic science quiz template",
    difficulty: "medium",
    language: "English",
    questions: [
      { question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: "H2O" },
      { question: "What force keeps planets in orbit around the sun?", options: ["Magnetism", "Gravity", "Friction", "Inertia"], answer: "Gravity" },
    ],
  },
  {
    id: "history-world",
    title: "World History Template",
    description: "A world history quiz template",
    difficulty: "hard",
    language: "English",
    questions: [
      { question: "In which year did World War II end?", options: ["1944", "1945", "1946", "1947"], answer: "1945" },
      { question: "Who was the first person to walk on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"], answer: "Neil Armstrong" },
    ],
  },
];

async function getTemplates(req, res) {
  res.json(TEMPLATES);
}

module.exports = { getMyQuizzes, duplicateQuiz, getTemplates };
