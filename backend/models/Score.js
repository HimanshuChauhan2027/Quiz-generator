const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Score = sequelize.define(
  "Score",
  {
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    answers: {
      // { "0": "Paris", "1": "Mars", ... } keyed by question index
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "scores",
  }
);

module.exports = Score;
