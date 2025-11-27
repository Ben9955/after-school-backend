import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();


// GET all lessons
router.get("/", async (req, res) => {
  const BACKEND_URL = process.env.BACKEND_URL;

  const db = req.app.locals.db;
  try {
    let lessons = await db.collection("lessons").find().toArray();

    lessons = lessons.map(lesson => ({
      ...lesson,
      image: lesson.image || `${BACKEND_URL}/images/${lesson.subject.toLowerCase()}.jpg`
    }));

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET lessons by search query
router.get("/search", async (req, res) => {
  const BACKEND_URL = process.env.BACKEND_URL;
  const db = req.app.locals.db;
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Search query is required" });

  try {
    const regex = new RegExp(q, "i"); 
    const numQuery = Number(q);

    let lessons = await db.collection("lessons").find({
      $or: [
        { subject: regex },
        { location: regex },
        { description: regex },
        ...(isNaN(numQuery) ? [] : [{ price: numQuery }, { spaces: numQuery }])
      ]
    }).toArray();

    lessons = lessons.map(lesson => ({
      ...lesson,
      image: lesson.image || `${BACKEND_URL}/images/${lesson.subject.toLowerCase()}.jpg`
    }));

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single lesson by ID
router.get("/:id", async (req, res) => {
  const BACKEND_URL = process.env.BACKEND_URL;
  const db = req.app.locals.db;
  try {
    let lesson = await db.collection("lessons").findOne({ _id: new ObjectId(req.params.id) });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    lesson.image = lesson.image || `${BACKEND_URL}/images/${lesson.subject.toLowerCase()}.jpg`;
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new lesson
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const { subject, location, price, spaces, image, description } = req.body;

  if (!subject || !location || price == null || spaces == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await db.collection("lessons").insertOne({ subject, location, price, spaces, image, description });
    const insertedLesson = await db.collection("lessons").findOne({ _id: result.insertedId });
    res.status(201).json(insertedLesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// PUT to update a lesson by ID
router.put("/:id", async (req, res) => {
  const db = req.app.locals.db;
  const updates = req.body;

  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lesson ID" });
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  try {
    const result = await db.collection("lessons").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: "after", upsert: false }  
    );

    // Fallback: if value is null, fetch the document manually
    const updatedLesson = result.value || await db.collection("lessons").findOne({ _id: new ObjectId(req.params.id) });

    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(updatedLesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

