import express from "express";
import Lesson from "../models/Lesson.js";

const router = express.Router();

// GET all lessons
router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET lessons by search query
router.get("/search", async (req, res) => {
  const { q } = req.query; 
  if (!q) return res.status(400).json({ message: "Search query is required" });

  try {
    // Full-text search on multiple fields
    const regex = new RegExp(q, "i"); 
    const numQuery = Number(q);
    const lessons = await Lesson.find({
      $or: [
        { subject: regex },
        { location: regex },
        { description: regex },
        ...(isNaN(numQuery) ? [] : [{ price: numQuery }, { spaces: numQuery }])
      ]
    });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single lesson by id
router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new lesson
router.post("/", async (req, res) => {
  console.log("POST /api/lessons hit");
  const lesson = new Lesson(req.body);
  try {
    const savedLesson = await lesson.save();
    res.status(201).json(savedLesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


export default router;
