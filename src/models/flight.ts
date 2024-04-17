import mongoose, { Schema, Document } from "mongoose";

export interface FlightData extends Document {
  flightName: string;
  flightNo: number;
  departureTime: string;
  returnTime: string;
  origin: string;
  arrivalTime: string;
  destination: string;
  price: { executive: number; middle: number; low: number };
  seatsBooked: number;
  capacity: number;
  passengers: number;
  flightTime: number;
  seatsBookedAlready: { row: number; col: number }[];
  rows: number;
  executiveClassseatNumber: number;
  middleClassseatNumber: number;
  lowClassSeatNumber: number; //in this case we will need to find flight and check the number of seats remaining in every class
  bookings: Array<Schema.Types.ObjectId>; // Reference to Booking documents
}
const FlightSchema: Schema = new Schema(
  {
    flightName: { type: String, required: true },
    flightNo: { type: Number, required: true },
    departureTime: { type: Date, required: true },
    returnTime: { type: Date, requred: true },
    origin: { type: String, required: true },
    seatsBooked: { type: Number, default: 0 },
    capacity: { type: Number, required: true },
    destination: { type: String, required: true },
    price: { executive: { type: Number, required: true }, middle: { type: Number, required: true }, low: { type: Number, required: true } },
    flightTime: { type: Number, required: true },
    seatsBookedAlready: [{ row: { type: Number, required: true }, col: { type: Number, required: true } }],
    rows: { type: Number, required: true },
    executiveClassSeatNumber: { type: Number, required: true },
    middleClassSeatNumber: { type: Number, required: true },
    lowClassSeatNumber: { type: Number, required: true },
    bookings: [{ type: Schema.Types.ObjectId, ref: "Booking", required: true }], // Reference to Booking documents
  },
  {
    versionKey: false,
  }
);

export interface ApplicationData extends Document {
  bookingId: string;
  fullName: string;
  dob: string;
  phoneNo: string;
  email: string;
  address: string;
  role: string;
  availableDate: string;
  status: string;
}
const ApplicationSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNo: { type: String, required: true },
    dob: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, required: true },
    availableDate: { type: String, required: true },
    status: { type: String, required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  },
  {
    versionKey: false,
  }
);
export const Flight = mongoose.model<FlightData>("Flight", FlightSchema);
export const JobApplication = mongoose.model<ApplicationData>("JobApplication", ApplicationSchema);
