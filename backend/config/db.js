const { Sequelize } = require("sequelize");

// If DATABASE_URL is set we connect to Postgres, otherwise we fall back
// to a local SQLite file so the project runs with zero setup.
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
  });
}

module.exports = sequelize;
