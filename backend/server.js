require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { sequelize } = require("./models");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const editorRoutes = require("./routes/editorRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const generateRoutes = require("./routes/generateRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // needed for the login form post

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/ping", (req, res) => res.json({ ping: "pong" }));

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/editor", editorRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });
