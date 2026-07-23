const { Op, fn, literal } = require("sequelize");
const { Score } = require("../models");

async function getStats(req, res) {
  const userId = req.user.id;

  const totalTaken = await Score.count({ where: { userId } });

  const avgResult = await Score.findOne({
    attributes: [[fn("AVG", literal("score * 100.0 / maxScore")), "avg"]],
    where: { userId, maxScore: { [Op.gt]: 0 } },
    raw: true,
  });
  const avgScore = Math.round(avgResult?.avg || 0);

  const bestResult = await Score.findOne({
    attributes: [[fn("MAX", literal("score * 100.0 / maxScore")), "best"]],
    where: { userId, maxScore: { [Op.gt]: 0 } },
    raw: true,
  });
  const bestScore = Math.round(bestResult?.best || 0);

  const streak = await calculateStreak(userId);

  res.json({ totalTaken, avgScore, bestScore, streak });
}

// Counts consecutive days (including today) the user has taken at least one quiz
async function calculateStreak(userId) {
  const scores = await Score.findAll({
    where: { userId },
    attributes: ["createdAt"],
    order: [["createdAt", "DESC"]],
  });
  if (scores.length === 0) return 0;

  const toDateString = (d) => new Date(d).toISOString().slice(0, 10);
  const uniqueDays = [...new Set(scores.map((s) => toDateString(s.createdAt)))];

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecent = uniqueDays[0];
  if (mostRecent !== toDateString(today) && mostRecent !== toDateString(yesterday)) {
    return 0;
  }

  let streak = 0;
  let expected = new Date(mostRecent);
  for (const day of uniqueDays) {
    if (day === toDateString(expected)) {
      streak += 1;
      expected.setDate(expected.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

module.exports = { getStats };
