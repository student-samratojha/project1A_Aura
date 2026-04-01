const express = require("express");
const app = express();
require("dotenv").config();
const authRoutes = require("./routes/auth.routes");
const secureRoutes = require("./routes/secure.routes");
const postRoutes = require("./routes/post.routes");
const storyRoutes = require("./routes/story.routes");
const reelsRoutes = require("./routes/reels.routes");
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");
const path = require("path");
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", authRoutes);
app.use("/secure", secureRoutes);
app.use("/post", postRoutes);
app.use("/story", storyRoutes);
app.use("/reel", reelsRoutes);
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/about", (req, res) => {
  res.render("about");
});
module.exports = app;