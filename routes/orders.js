import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// Helper function tfor validation
function validateOrderBody(body) {
  const { name, phone, lessons } = body;

  if (!name || typeof name !== "string")
    return "Name is required and must be a string.";

  if (!phone || typeof phone !== "string")
    return "Phone is required and must be a string.";

  if (!Array.isArray(lessons) || lessons.length === 0)
    return "Lessons must be a non-empty array.";

  for (const item of lessons) {
    if (!item.lessonId || !ObjectId.isValid(item.lessonId))
      return "Each lesson must contain a valid lessonId.";

    if (item.qty == null || typeof item.qty !== "number")
      return "Each lesson must include 'qty' as a number.";
  }

  return null;
}


// Helper function to populate lessons in an order
async function populateLessons(db, order) {
  if (!order.lessons) return order;

  const populated = await Promise.all(
    order.lessons.map(async (item) => {
      const lesson = await db.collection("lessons").findOne({
        _id: new ObjectId(item.lessonId)
      });

      return {
        ...item,
        lesson: lesson || null
      };
    })
  );

  return { ...order, lessons: populated };
}

// GET all orders (for testing/admin)
router.get("/", async (req, res) => {
  const db = req.app.locals.db;

  try {
    const orders = await db.collection("orders").find().toArray();
    const populatedOrders = await Promise.all(
      orders.map(order => populateLessons(db, order))
    );

    res.json(populatedOrders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// GET single order by ID
router.get("/:id", async (req, res) => {
  const db = req.app.locals.db;
  const orderId = req.params.id;

  if (!ObjectId.isValid(orderId))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const populatedOrder = await populateLessons(db, order);
    res.json(populatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving order" });
  }
});

// POST a new order
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  
  const validation = validateOrderBody(req.body);
  if (validation) return res.status(400).json({ message: validation });
  
  const { name, phone, lessons } = req.body;

  try {
    const result = await db.collection("orders").insertOne({ name, phone, lessons });
    const savedOrder = await db.collection("orders").findOne({ _id: result.insertedId });

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: "Error creating order" });
  }
});

// DELETE an order by ID
router.delete("/:id", async (req, res) => {
  const db = req.app.locals.db;

  const orderId = req.params.id;
  
  if (!ObjectId.isValid(orderId))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const result = await db.collection("orders").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting order" });
  }
});

export default router;

