const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },

    // Front: the question screenshot
    questionImage: { type: String },
    questionText:  { type: String },

    // Back: answer screenshot uploaded by student
    answerImage: { type: String },

    // Student's own written explanation / notes
    myExplanation: { type: String, default: "" },

    starred:    { type: Boolean, default: false },
    understood: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);
