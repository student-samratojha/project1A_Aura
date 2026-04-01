const mognoose = require("mongoose");
const dbURI = process.env.MONGO_URI;
async function connectDB() {
  try {
    await mognoose.connect(dbURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
