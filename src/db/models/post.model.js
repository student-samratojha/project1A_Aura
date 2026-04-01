const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postSchema = new Schema(
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
    media: [
      {
        url: String,
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Post", postSchema);
