const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Math", "Science"
    emoji: { type: String, default: "📁" },             // optional icon
    color: { type: String, default: "#6C63FF" },        // accent colour

    // Sharing: list of user IDs that can view this folder
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPublic: { type: Boolean, default: false },        // share via link
    shareToken: { type: String },                       // unique share link token
  },
  { timestamps: true }
);

module.exports = mongoose.model("Folder", folderSchema);
