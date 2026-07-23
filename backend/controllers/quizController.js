const { Op, fn, col, literal } = require("sequelize");
const { Quiz, User, Score } = require("../models");

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

async function getAllQuizzes(req, res) {
  const quizzes = await Quiz.findAll({ order: [["createdAt", "DESC"]] });
  res.json(quizzes.map(quizResponse));
}

async function createQuiz(req, res) {
  const { title, description, language, difficulty, questions, is_public } = req.body;

  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ message: "Title and at least one question are required" });
  }

  const quiz = await Quiz.create({
    title,
    description,
    language,
    difficulty,
    questions,
    isPublic: is_public || false,
    ownerId: req.user.id,
  });

  res.json(quizResponse(quiz));
}

async function getQuiz(req, res) {
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json(quizResponse(quiz));
}

async function updateQuiz(req, res) {
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  if (quiz.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized to update this quiz" });
  }

  const { title, description, language, difficulty, questions, is_public } = req.body;
  if (title !== undefined) quiz.title = title;
  if (description !== undefined) quiz.description = description;
  if (language !== undefined) quiz.language = language;
  if (difficulty !== undefined) quiz.difficulty = difficulty;
  if (questions !== undefined) quiz.questions = questions;
  if (is_public !== undefined) quiz.isPublic = is_public;

  await quiz.save();
  res.json(quizResponse(quiz));
}

async function deleteQuiz(req, res) {
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  if (quiz.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized to delete this quiz" });
  }

  await Score.destroy({ where: { quizId: quiz.id } });
  await quiz.destroy();
  res.json({ message: "Quiz deleted successfully" });
}

async function getQuizAttemptCount(req, res) {
  const attempts = await Score.count({ where: { quizId: req.params.id } });
  res.json({ attempts });
}

async function getGlobalStats(req, res) {
  const totalQuizzes = await Quiz.count();
  const totalUsers = await User.count();

  const avgResult = await Score.findOne({
    attributes: [[fn("AVG", literal("score * 100.0 / maxScore")), "avg"]],
    where: { maxScore: { [Op.gt]: 0 } },
    raw: true,
  });
  const avgScore = Math.round(avgResult?.avg || 0);

  const topQuiz = await Score.findOne({
    attributes: ["quizId", [fn("COUNT", col("Score.id")), "attempts"]],
    include: [{ model: Quiz, as: "quiz", attributes: ["title"] }],
    group: ["quizId", "quiz.id"],
    order: [[literal("attempts"), "DESC"]],
    raw: true,
    nest: true,
  });

  res.json({
    totalQuizzes,
    totalUsers,
    avgScore,
    topicOfTheWeek: topQuiz?.quiz?.title || "JavaScript Fundamentals",
  });
}

async function getLeaderboard(req, res) {
  const { difficulty } = req.params;

  const scores = await Score.findAll({
    include: [
      { model: Quiz, as: "quiz", attributes: [], where: { difficulty } },
      { model: User, as: "user", attributes: [] },
    ],
    attributes: [
      [col("user.username"), "username"],
      [fn("MAX", col("Score.score")), "bestScore"],
      [fn("AVG", col("Score.score")), "avgScore"],
      [fn("COUNT", col("Score.id")), "totalQuizzes"],
      [fn("MAX", col("Score.maxScore")), "maxScore"],
    ],
    group: ["user.username"],
    order: [[literal("bestScore"), "DESC"]],
    limit: 10,
    raw: true,
  });

  const leaderboard = scores.map((row) => ({
    username: row.username,
    score: row.maxScore ? Math.round((row.bestScore / row.maxScore) * 100) : 0,
    avgScore: row.maxScore ? Math.round((row.avgScore / row.maxScore) * 100) : 0,
    totalQuizzes: Number(row.totalQuizzes),
  }));

  res.json(leaderboard);
}

async function browsePublicQuizzes(req, res) {
  const { search, difficulty, language, sort_by, page = 1, limit = 20 } = req.query;

  const where = { isPublic: true };
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }
  if (difficulty && difficulty !== "all") where.difficulty = difficulty;
  if (language && language !== "all") where.language = language;

  let order = [["createdAt", "DESC"]];
  if (sort_by === "difficulty") order = [["difficulty", "ASC"]];

  const offset = (Number(page) - 1) * Number(limit);

  const quizzes = await Quiz.findAll({
    where,
    include: [{ model: User, as: "owner", attributes: ["username"] }],
    order,
    limit: Number(limit),
    offset,
  });

  const quizIds = quizzes.map((q) => q.id);
  const stats = await Score.findAll({
    where: { quizId: quizIds },
    attributes: [
      "quizId",
      [fn("COUNT", col("id")), "attempts"],
      [fn("AVG", literal("score * 100.0 / maxScore")), "avgScore"],
    ],
    group: ["quizId"],
    raw: true,
  });
  const statsByQuiz = Object.fromEntries(stats.map((s) => [s.quizId, s]));

  const result = quizzes.map((quiz) => {
    const stat = statsByQuiz[quiz.id];
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      language: quiz.language,
      questionsCount: (quiz.questions || []).length,
      attempts: stat ? Number(stat.attempts) : 0,
      avgScore: stat ? Math.round(stat.avgScore || 0) : 0,
      creator: quiz.owner?.username || "Anonymous",
      created: quiz.createdAt,
      tags: [],
      is_public: quiz.isPublic,
    };
  });

  if (sort_by === "popular") {
    result.sort((a, b) => b.attempts - a.attempts);
  }

  res.json(result);
}

module.exports = {
  getAllQuizzes,
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizAttemptCount,
  getGlobalStats,
  getLeaderboard,
  browsePublicQuizzes,
};
