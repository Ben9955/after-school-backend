import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

function validateLessonBody(body) {
  const { subject, location, price, spaces, image, description } = body;

  if (!subject || typeof subject !== "string") return "Subject is required and must be a string.";
  if (!location || typeof location !== "string") return "Location is required and must be a string.";
  if (price == null || typeof price !== "number") return "Price is required and must be a number.";
  if (spaces == null || typeof spaces !== "number") return "Spaces is required and must be a number.";

  return null;
}

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
  
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "Invalid lesson ID" });

  try {
    let lesson = await db.collection("lessons").findOne({ _id: new ObjectId(req.params.id) });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    lesson.image = lesson.image || `${BACKEND_URL}/images/${lesson.subject.toLowerCase()}.jpg`;
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving lesson" });
  }
});

// POST a new lesson
router.post("/", async (req, res) => {
  const db = req.app.locals.db;

  const validation = validateLessonBody(req.body);
  if (validation) return res.status(400).json({ message: validation });

  const { subject, location, price, spaces, image, description } = body;

  try {
    const result = await db.collection("lessons").insertOne({ subject, location, price, spaces, image, description });
    const insertedLesson = await db.collection("lessons").findOne({ _id: result.insertedId });
    res.status(201).json(insertedLesson);
  } catch (err) {
    res.status(500).json({ message: "Error creating lesson" });
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

    if (!result.value)
      return res.status(404).json({ message: "Lesson not found" });

    res.json(updatedLesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a lesson by ID
router.delete("/:id", async (req, res) => {
  const db = req.app.locals.db;

  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lesson ID" });
  }

  try {
    const result = await db.collection("lessons").deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Lesson not found" });

    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting lesson" });
  }
});

export default router;

