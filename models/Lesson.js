
const lessonSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  spaces: { type: Number, required: true },
  image: { type: String },
  description: { type: String }
});

export default mongoose.model("Lesson", lessonSchema);
