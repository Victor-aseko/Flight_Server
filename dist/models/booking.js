"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
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
    flight: { type: mongoose_1.Schema.Types.ObjectId, ref: "Flight", required: true }, // Reference to Flight documents
}, {
    versionKey: false,
});
exports.default = (0, mongoose_1.model)("Booking", bookingSchema);
