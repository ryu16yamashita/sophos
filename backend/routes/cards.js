const express = require("express");
const Card = require("../models/Card");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

// GET /api/cards
router.get("/", async (req, res) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.folder)                filter.folder     = req.query.folder;
    if (req.query.starred    === "true") filter.starred    = true;
    if (req.query.understood === "true") filter.understood = true;
    const cards = await Card.find(filter).sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    console.error("GET /cards error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cards
router.post("/", async (req, res) => {
  try {
    const { folder, questionImage, questionText, answerImage, myExplanation } = req.body;
    const card = await Card.create({
      owner: req.user._id,
      folder,
      questionImage,
      questionText,
      answerImage,
      myExplanation: myExplanation || "",
    });
    res.status(201).json(card);
  } catch (err) {
    console.error("POST /cards error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/cards/:id
router.patch("/:id", async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, owner: req.user._id });
    if (!card) return res.status(404).json({ message: "Card not found." });
    Object.assign(card, req.body);
    await card.save();
    res.json(card);
  } catch (err) {
    console.error("PATCH /cards error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cards/:id
router.delete("/:id", async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!card) return res.status(404).json({ message: "Card not found." });
    res.json({ message: "Card deleted." });
  } catch (err) {
    console.error("DELETE /cards error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
