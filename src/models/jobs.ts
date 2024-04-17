import mongoose, { Document, Schema } from "mongoose";
interface Job extends Document {
  title: string;
  subtitle: string;
  details: string[];
  imageUrl: string;
  Requirements: string;
  salary: string;
}
const jobSchema = new Schema<Job>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    details: { type: [String], required: true },
    imageUrl: { type: String, required: true },
    Requirements: { type: String, required: true },
    salary: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<Job>("job", jobSchema);
