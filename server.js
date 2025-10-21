import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
// routes
import lessonsRouter from "./routes/lessons.js";
import ordersRouter from "./routes/orders.js";
//middlewares
import logger from "./middlewares/logger.js";
import staticImages from "./middlewares/staticImages.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(logger);
app.use(cors());
app.use(express.json());
app.get("/images/:filename", staticImages);


// Routes
app.use("/api/lessons", lessonsRouter);
app.use("/api/orders", ordersRouter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
