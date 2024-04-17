"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplication = exports.createApplication = exports.getJobs = exports.getSummary = exports.getFlights = exports.deleteBooking = exports.inquireDelete = exports.inquireEdit = exports.updateFlight = exports.createBooking = exports.searchFlight = exports.CustomError = void 0;
const flight_1 = require("../models/flight");
const search_1 = require("../handler/search");
const booking_1 = __importDefault(require("../models/booking"));
const user_1 = __importDefault(require("../models/user"));
const jobs_1 = __importDefault(require("../models/jobs"));
const mongoose_1 = __importDefault(require("mongoose"));
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.CustomError = CustomError;
const searchFlight = async (req, res, next) => {
    var _a;
    try {
        const { destination, departureTime, origin, passengers } = req.body;
        const results = await (0, search_1.searchHandler)({ origin, destination });
        if (results) {
            // date check and checking if the plane is fully booked
            const flightDepartureTime = (_a = results === null || results === void 0 ? void 0 : results.flights) === null || _a === void 0 ? void 0 : _a.filter(f => new Date(f.departureTime).getTime() >= new Date(departureTime).getTime() && f.seatsBooked < f.capacity);
            // if the flight is full and no flight is available for a future date then send this
            if (flightDepartureTime.length <= 0) {
                return res.status(404).json({
                    message: "No flight will be leaving at the time you indicated. Please enter a different date and try again",
                });
            }
            else {
                // check if the user entered number of passengers can fit the remaining plane capacity
                const passengersCheck = flightDepartureTime.filter(f => f.capacity - f.seatsBooked >= +passengers);
                if (passengersCheck.length > 0)
                    return res.status(201).json({
                        message: "flights found",
                        flights: flightDepartureTime,
                    });
                else {
                    //if the plane remaining number of seats is less than the user enterd number of passengers, advice the user with the available number of seats
                    const flight = flightDepartureTime === null || flightDepartureTime === void 0 ? void 0 : flightDepartureTime.reduce((prev, curr) => new Date(curr.departureTime).getTime() - new Date(departureTime).getTime() <
                        new Date(prev.departureTime).getTime() - new Date(departureTime).getTime()
                        ? curr
                        : prev);
                    if (flight)
                        return res.status(201).json({
                            message: `The flight that was found has only ${flight.capacity - flight.seatsBooked} seat/s unbooked`,
                        });
                    // if no flight was found, then send this
                    else
                        return res.status(404).json({
                            message: "No flight will be leaving at the time you indicated. Please enter a different date and try again",
                        });
                }
            }
        }
        else {
            return res.status(404).json({
                message: "No Flight was found please refine your search and try again",
            });
        }
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
};
exports.searchFlight = searchFlight;
const createBooking = async (req, res, next) => {
    try {
        const { bookingId, fullName, passengers, passengersInfo, payment, paymentMethod, seatBooked, class: classData } = req.body;
        if (!bookingId || !fullName || !passengers || !passengersInfo || !payment || !paymentMethod || !seatBooked || !classData) {
            return res.status(400).json({ error: "Some fields are missing.Please fill in all fields" });
        }
        const id = new mongoose_1.default.Types.ObjectId(bookingId);
        const booking = new booking_1.default({
            flight: id,
            fullName,
            passengers,
            passengersInfo,
            payment,
            paymentMethod,
            seatBooked,
            class: classData,
            status: "successful",
        });
        const bookingData = await booking.save();
        const foundFlight = await flight_1.Flight.findById(id);
        if (foundFlight) {
            const updtFlight = updateFlightHandler(foundFlight, seatBooked, passengers, bookingData);
            const updateResult = await flight_1.Flight.updateOne({ _id: id }, // The filter to find the specific Flight document
            updtFlight // The update operation
            );
            if (updateResult.modifiedCount > 0) {
                // Check if any document was actually modified
                return res.status(201).json({
                    message: "Booking created successfully",
                    booking: bookingData,
                });
            }
        }
        else {
            return res.status(400).json({
                message: "No flight was not found to update",
            });
        }
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
    return;
};
exports.createBooking = createBooking;
const updateFlight = async (req, res, next) => {
    const { price } = req.body;
    if (price) {
        return res.status(400).json({ error: "Some fields are missing.Please fill in all fields" });
    }
    try {
        const foundFlight = await flight_1.Flight.findOne({ price }).exec();
        if (foundFlight) {
            await flight_1.Flight.findByIdAndUpdate(foundFlight._id, { price }, { new: true });
        }
        else {
            const error = new CustomError("No flight was found. Please create one", 404);
            throw error;
        }
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
};
exports.updateFlight = updateFlight;
const inquireEdit = async (req, res, next) => {
    try {
        const { fullName, passengersInfo, passengers, id } = req.body;
        if (!id || !passengersInfo || !passengers) {
            return res.status(400).json({ error: "The ID field is missing" });
        }
        const foundFlight = await booking_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(id), {
            fullName,
            passengersInfo,
            passengers: +passengers,
            status: "edit",
        }, { new: true });
        if (!foundFlight) {
            return res.status(404).json({ error: "Booking not found" });
        }
        res.status(200).json({ message: "Request pending to be approved", booking: foundFlight });
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
    return;
};
exports.inquireEdit = inquireEdit;
const inquireDelete = async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "The ID field is missing" });
        }
        const foundFlight = await booking_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(id), {
            status: "delete",
        });
        if (!foundFlight) {
            return res.status(404).json({ error: "Booking not found" });
        }
        res.status(200).json({ message: "Request pending to be approved" });
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
    return;
};
exports.inquireDelete = inquireDelete;
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "The ID field is missing" });
        }
        const foundBooking = await booking_1.default.findByIdAndRemove(new mongoose_1.default.Types.ObjectId(id));
        if (!foundBooking) {
            return res.status(404).json({ error: "Flight not found" });
        }
        return res.status(200).json({ message: "Successfully deleted the flight" });
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
    return;
};
exports.deleteBooking = deleteBooking;
const getFlights = async (req, res, next) => {
    try {
        const { email } = req.query;
        if (!email)
            return res.json({ error: "Please provide an email!" });
        const flight = await flight_1.Flight.find({ email }).sort();
        res.status(200).json({
            message: "Successfully fetched flight",
            flight: flight,
        });
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
    return;
};
exports.getFlights = getFlights;
const getSummary = async (req, res, next) => {
    try {
        const { email } = req.params;
        if (!email)
            return res.status(400).json({ error: "Please provide an email!" });
        const user = await user_1.default.findOne({ email }).exec();
        if (!user)
            return res.status(404).json({ error: "User not found" });
        if (user.level !== "admin") {
            return res.status(401).json({ error: "Not authorized" });
        }
        const booking = await booking_1.default.find({}).populate("flight");
        const deleteBooking = await booking_1.default.find({ status: "delete" });
        const EditBooking = await booking_1.default.find({ status: "edit" });
        const jobs = await flight_1.JobApplication.find({});
        const employeeMatch = (await flight_1.JobApplication.find({ status: "success" })).length;
        const flightsWithBookings = await flight_1.Flight.find({ bookings: { $exists: true, $not: { $size: 0 } } });
        const summary = {
            payment: booking.reduce((acc, cur) => acc + cur.payment, 0),
            scheduledFlights: flightsWithBookings.length,
            flightHours: flightsWithBookings.reduce((acc, cur) => acc + cur.flightTime, 0),
            booking,
            jobs,
            employeeMatch,
            deleteBooking,
            EditBooking,
        };
        res.status(200).json({
            message: "Successfully fetched flight",
            summary,
        });
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
    return;
};
exports.getSummary = getSummary;
const getJobs = async (_, res, next) => {
    try {
        const allJobs = await jobs_1.default.find({});
        if (allJobs.length === 0) {
            return res.status(404).json({
                message: "No job was found in the database.",
            });
        }
        return res.status(200).json({
            message: "Successfully fetched jobs",
            jobs: allJobs,
        });
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
    return;
};
exports.getJobs = getJobs;
const createApplication = async (req, res, next) => {
    try {
        const { id, fullName, dob, phoneNo, email, address, role, availableDate } = req.body;
        if (!fullName || !dob || !phoneNo || !email || !address || !role || !availableDate) {
            return res.status(400).json({ error: "Some fields are missing.Please fill in all fields" });
        }
        const application = new flight_1.JobApplication({
            job: new mongoose_1.default.Types.ObjectId(id),
            fullName,
            dob,
            phoneNo,
            email,
            address,
            role,
            availableDate,
            status: "pending",
        });
        const applicationSave = await application.save();
        if (applicationSave) {
            return res.status(200).json({
                message: "Application created successfully",
            });
        }
        else {
            return res.status(400).json({
                message: "Application not created",
            });
        }
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
    return;
};
exports.createApplication = createApplication;
const updateApplication = async (req, res, next) => {
    try {
        const { id, status } = req.body;
        const jobId = new mongoose_1.default.Types.ObjectId(id);
        if (!id || !status) {
            return res.status(400).json({ error: "Some fields are missing.Please fill in all fields" });
        }
        if (status === "success") {
            const foundApplication = await flight_1.JobApplication.findByIdAndUpdate(jobId, { status }, { new: true });
            if (foundApplication) {
                return res.status(200).json({ message: "Job application updated successfully" });
            }
            else {
                return res.status(404).json({ error: "no job application was found with the given id" });
            }
        }
        else {
            const removedApplication = await flight_1.JobApplication.findOneAndRemove(jobId);
            if (removedApplication) {
                return res.status(200).json({ message: "job application removed" });
            }
            else {
                return res.status(404).json({ error: "no job application was found with the given id" });
            }
        }
    }
    catch (err) {
        if (!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
};
exports.updateApplication = updateApplication;
const updateFlightHandler = (flight, seatsBooked, passengers, bookingData) => {
    const seatsBookedAlready = flight.seatsBookedAlready.concat(seatsBooked);
    const bookings = flight.bookings.concat(bookingData._id);
    const seatsBookedUpdt = flight.seatsBooked + +passengers;
    return { ...flight.toObject(), seatsBookedAlready, seatsBooked: seatsBookedUpdt, bookings };
};
