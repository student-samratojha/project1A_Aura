const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },
    reels: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reels",
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Comment", commentSchema);
