const express = require("express");
const crypto = require("crypto");
const Folder = require("../models/Folder");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const owned  = await Folder.find({ owner: req.user._id });
    const shared = await Folder.find({ sharedWith: req.user._id });
    res.json({ owned, shared });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    const folder = await Folder.create({ owner: req.user._id, name, emoji, color });
    res.status(201).json(folder);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH — rename or update emoji
router.patch("/:id", async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ message: "Folder not found." });
    const { name, emoji } = req.body;
    if (name)  folder.name  = name;
    if (emoji) folder.emoji = emoji;
    await folder.save();
    res.json(folder);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:id/share", async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ message: "Folder not found." });
    const { email } = req.body;
    const target = await User.findOne({ email });
    if (!target) return res.status(404).json({ message: "No Sophos account with that email." });
    if (target._id.equals(req.user._id)) return res.status(400).json({ message: "You already own this folder." });
    if (!folder.sharedWith.includes(target._id)) {
      folder.sharedWith.push(target._id);
      await folder.save();
    }
    res.json({ message: `Folder shared with ${email}.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:id/share-link", async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ message: "Folder not found." });
    folder.isPublic = true;
    folder.shareToken = crypto.randomBytes(16).toString("hex");
    await folder.save();
    res.json({ shareUrl: `/shared/${folder.shareToken}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ message: "Folder not found." });
    res.json({ message: "Folder deleted." });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
