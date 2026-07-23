const sequelize = require("../config/db");
const User = require("./User");
const Quiz = require("./Quiz");
const Score = require("./Score");

// A user can own many quizzes
User.hasMany(Quiz, { foreignKey: "ownerId", as: "quizzes" });
Quiz.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// A user can have many scores, a quiz can have many scores
User.hasMany(Score, { foreignKey: "userId", as: "scores" });
Score.belongsTo(User, { foreignKey: "userId", as: "user" });

Quiz.hasMany(Score, { foreignKey: "quizId", as: "scores" });
Score.belongsTo(Quiz, { foreignKey: "quizId", as: "quiz" });

module.exports = { sequelize, User, Quiz, Score };
