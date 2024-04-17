import { Document, Schema, model } from "mongoose";

export interface BookingData extends Document {
  bookingId: string;
  fullName: string;
  class: string;
  passengers: number;
  passengersInfo: { fullName: string; email: string; phoneNo: string; dob: string }[];
  payment: number;
  paymentMethod: string;
  seatBooked: { col: number; row: number }[];
  flight: Schema.Types.ObjectId;
  status: string;
}
const bookingSchema = new Schema(
  {
    fullName: { type: String, required: true },
    class: { type: String, required: true },
    passengers: { type: Number, required: true },
    passengersInfo: [
      {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNo: { type: String, required: true },
        dob: { type: String, required: true },
      },
    ],
    payment: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    seatBooked: [{ row: { type: Number, required: true }, col: { type: Number, required: true } }],
    status: { type: String, required: true },
    flight: { type: Schema.Types.ObjectId, ref: "Flight", required: true }, // Reference to Flight documents

  },
  {
    versionKey: false,
  }
);

export default model<BookingData>("Booking", bookingSchema);
