import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// GET all orders (for testing/admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("lessons.lessonId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new order
router.post("/", async (req, res) => {
  const { name, phone, lessons } = req.body;

  if (!name || !phone || !lessons || !lessons.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const order = new Order({ name, phone, lessons });

  try {
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
