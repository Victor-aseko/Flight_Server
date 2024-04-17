"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobApplication = exports.Flight = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FlightSchema = new mongoose_1.Schema({
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
    bookings: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Booking", required: true }], // Reference to Booking documents
}, {
    versionKey: false,
});
const ApplicationSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNo: { type: String, required: true },
    dob: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, required: true },
    availableDate: { type: String, required: true },
    status: { type: String, required: true },
    job: { type: mongoose_1.Schema.Types.ObjectId, ref: "Job", required: true },
}, {
    versionKey: false,
});
exports.Flight = mongoose_1.default.model("Flight", FlightSchema);
exports.JobApplication = mongoose_1.default.model("JobApplication", ApplicationSchema);
