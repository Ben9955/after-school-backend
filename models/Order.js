
const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  lessons: [
    {
      lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
      qty: { type: Number, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);
