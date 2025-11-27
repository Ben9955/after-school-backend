import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

//middlewares
import logger from "./middlewares/logger.js";
import staticImages from "./middlewares/staticImages.js";

// routes
import lessonsRouter from "./routes/lessons.js";
import ordersRouter from "./routes/orders.js";

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
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("after-school"); 
    app.locals.db = db; 
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
