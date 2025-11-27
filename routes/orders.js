import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET all orders (for testing/admin)
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const orders = await db.collection("orders").find().toArray();

    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedLessons = await Promise.all(
          order.lessons.map(async (item) => {
            const lesson = await db.collection("lessons").findOne({ _id: new ObjectId(item.lessonId) });
            return {
              ...item,
              lesson
            };
          })
        );
        return { ...order, lessons: populatedLessons };
      })
    );

    res.json(populatedOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single order by ID
router.get("/:id", async (req, res) => {
  const db = req.app.locals.db;
  const orderId = req.params.id;

  try {
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.lessons = await Promise.all(
      order.lessons.map(async (item) => {
        const lesson = await db.collection("lessons").findOne({ _id: new ObjectId(item.lessonId) });
        return { ...item, lesson }; 
      })
    );

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new order
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const { name, phone, lessons } = req.body;

  if (!name || !phone || !lessons || !lessons.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const orderDoc = { name, phone, lessons };

  try {
    const result = await db.collection("orders").insertOne(orderDoc);
    const savedOrder = await db.collection("orders").findOne({ _id: result.insertedId });
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

