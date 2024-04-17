import mongoose, { Schema, Document } from "mongoose";

export interface UserData extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  level: "admin" | "user";
}

const userSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    level: { type: String, required: true },
  },
  { versionKey: false }
);

export default mongoose.model<UserData>("user", userSchema);
