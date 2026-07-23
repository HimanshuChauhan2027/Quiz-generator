const { Score, Quiz } = require("../models");

function scoreResponse(score) {
  return {
    id: score.id,
    quiz_id: score.quizId,
    user_id: score.userId,
    score: score.score,
    max_score: score.maxScore,
    answers: score.answers,
  };
}

async function submitScore(req, res) {
  const { score, max_score, answers } = req.body;

  const created = await Score.create({
    quizId: Number(req.params.quizId),
    userId: req.user.id,
    score: score || 0,
    maxScore: max_score || 0,
    answers: answers || {},
  });

  res.json(scoreResponse(created));
}

async function updateScore(req, res) {
  const existing = await Score.findByPk(req.params.scoreId);
  if (!existing || existing.userId !== req.user.id) {
    return res.status(404).json({ message: "Score not found" });
  }

  const { score, max_score, answers } = req.body;
  if (score !== undefined) existing.score = score;
  if (max_score !== undefined) existing.maxScore = max_score;
  if (answers !== undefined) existing.answers = answers;

  await existing.save();
  res.json(scoreResponse(existing));
}

async function getLatestAttempt(req, res) {
  const latest = await Score.findOne({
    where: { quizId: req.params.quizId, userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });
  if (!latest) return res.status(404).json({ message: "Score not found" });
  res.json(scoreResponse(latest));
}

async function getAttempt(req, res) {
  const attempt = await Score.findOne({
    where: { id: req.params.scoreId, userId: req.user.id },
  });
  if (!attempt) return res.status(404).json({ message: "Score not found" });
  res.json(scoreResponse(attempt));
}

async function getUserHistory(req, res) {
  const { offset, limit } = req.query;

  const baseQuery = {
    where: { userId: req.user.id },
    include: [{ model: Quiz, as: "quiz", attributes: ["title", "language", "difficulty"] }],
    order: [["createdAt", "DESC"]],
  };

  const toHistoryItem = (s) => ({
    score_id: s.id,
    quiz_id: s.quizId,
    language: s.quiz?.language,
    difficulty: s.quiz?.difficulty,
    title: s.quiz?.title,
    score: s.score,
    max_score: s.maxScore,
    date: s.createdAt,
  });

  // If pagination params are provided, return a paginated payload
  if (offset !== undefined && limit !== undefined) {
    const total = await Score.count({ where: { userId: req.user.id } });
    const items = await Score.findAll({
      ...baseQuery,
      offset: Number(offset),
      limit: Number(limit),
    });
    return res.json({
      items: items.map(toHistoryItem),
      total,
      offset: Number(offset),
      limit: Number(limit),
    });
  }

  // Backward-compatible plain list
  const items = await Score.findAll(baseQuery);
  res.json(items.map(toHistoryItem));
}

async function deleteScore(req, res) {
  const score = await Score.findOne({
    where: { id: req.params.scoreId, userId: req.user.id },
  });
  if (!score) return res.status(404).json({ message: "Score not found" });

  await score.destroy();
  res.json({ status: "success" });
}

module.exports = {
  submitScore,
  updateScore,
  getLatestAttempt,
  getAttempt,
  getUserHistory,
  deleteScore,
};
