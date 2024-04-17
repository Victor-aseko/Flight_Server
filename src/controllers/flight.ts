import { Request, Response, NextFunction } from "express";

import { Flight, FlightData, JobApplication, ApplicationData } from "../models/flight";
import { searchHandler } from "../handler/search";
import { BookingData } from "../models/booking";
import Booking from "../models/booking";
import User from "../models/user";
import Jobs from "../models/jobs";

import mongoose from "mongoose";

export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const searchFlight = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { destination, departureTime, origin, passengers } = req.body as FlightData;

    const results = await searchHandler({ origin, destination });

    if (results) {
      // date check and checking if the plane is fully booked
      const flightDepartureTime = results?.flights?.filter(
        f => new Date(f.departureTime).getTime() >= new Date(departureTime).getTime() && f.seatsBooked < f.capacity
      ) as FlightData[];
      // if the flight is full and no flight is available for a future date then send this
      if (flightDepartureTime.length <= 0) {
        return res.status(404).json({
          message: "No flight will be leaving at the time you indicated. Please enter a different date and try again",
        });
      } else {
        // check if the user entered number of passengers can fit the remaining plane capacity
        const passengersCheck = flightDepartureTime.filter(f => f.capacity - f.seatsBooked >= +passengers);
        if (passengersCheck.length > 0)
          return res.status(201).json({
            message: "flights found",
            flights: flightDepartureTime,
          });
        else {
          //if the plane remaining number of seats is less than the user enterd number of passengers, advice the user with the available number of seats
          const flight = flightDepartureTime?.reduce((prev, curr) =>
            new Date(curr.departureTime).getTime() - new Date(departureTime).getTime() <
            new Date(prev.departureTime).getTime() - new Date(departureTime).getTime()
              ? curr
              : prev
          );
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
    } else {
      return res.status(404).json({
        message: "No Flight was found please refine your search and try again",
      });
    }
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { bookingId, fullName, passengers, passengersInfo, payment, paymentMethod, seatBooked, class: classData } = req.body as BookingData;

    if (!bookingId || !fullName || !passengers || !passengersInfo || !payment || !paymentMethod || !seatBooked || !classData) {
      return res.status(400).json({ error: "Some fields are missing.Please fill in all fields" });
    }
    const id = new mongoose.Types.ObjectId(bookingId);
    const booking: BookingData = new Booking({
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
    const foundFlight = await Flight.findById(id);

    if (foundFlight) {
      const updtFlight = updateFlightHandler(foundFlight, seatBooked, passengers, bookingData);

      const updateResult = await Flight.updateOne(
        { _id: id }, // The filter to find the specific Flight document
        updtFlight // The update operation
      );

      if (updateResult.modifiedCount > 0) {
        // Check if any document was actually modified
        return res.status(201).json({
          message: "Booking created successfully",
          booking: bookingData,
        });
      }
    } else {
      return res.status(400).json({
        message: "No flight was not found to update",
      });
    }
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
  return;
};

export const updateFlight = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  const { price } = req.body as FlightData;
  if (price) {
    return res.status(400).json({ error: "Some fields are missing.Please fill in all fields" });
  }
  try {
    const foundFlight = await Flight.findOne({ price }).exec();
    if (foundFlight) {
      await Flight.findByIdAndUpdate(foundFlight._id, { price }, { new: true });
    } else {
      const error = new CustomError("No flight was found. Please create one", 404);
      throw error;
    }
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

export const inquireEdit = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { fullName, passengersInfo, passengers, id } = req.body;
    if (!id || !passengersInfo || !passengers) {
      return res.status(400).json({ error: "The ID field is missing" });
    }
    const foundFlight = await Booking.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      {
        fullName,
        passengersInfo,
        passengers: +passengers,
        status: "edit",
      },
      { new: true }
    );
    if (!foundFlight) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Request pending to be approved", booking: foundFlight });
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
  return;
};
export const inquireDelete = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "The ID field is missing" });
    }
    const foundFlight = await Booking.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {
      status: "delete",
    });

    if (!foundFlight) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ message: "Request pending to be approved" });
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
  return;
};
export const deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "The ID field is missing" });
    }
    const foundBooking = await Booking.findByIdAndRemove(new mongoose.Types.ObjectId(id));
    if (!foundBooking) {
      return res.status(404).json({ error: "Flight not found" });
    }
    return res.status(200).json({ message: "Successfully deleted the flight" });
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
  return;
};

export const getFlights = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ error: "Please provide an email!" });

    const flight: FlightData[] = await Flight.find({ email }).sort();
    res.status(200).json({
      message: "Successfully fetched flight",
      flight: flight,
    });
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
  return;
};

export const getSummary = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: "Please provide an email!" });
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.level !== "admin") {
      return res.status(401).json({ error: "Not authorized" });
    }
    const booking = await Booking.find({}).populate("flight");
    const deleteBooking = await Booking.find({ status: "delete" });
    const EditBooking = await Booking.find({ status: "edit" });
    const jobs = await JobApplication.find({});
    const employeeMatch = (await JobApplication.find({ status: "success" })).length;
    const flightsWithBookings = await Flight.find({ bookings: { $exists: true, $not: { $size: 0 } } });

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
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
  return;
};

export const getJobs = async (_: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const allJobs = await Jobs.find({});
    if (allJobs.length === 0) {
      return res.status(404).json({
        message: "No job was found in the database.",
      });
    }
    return res.status(200).json({
      message: "Successfully fetched jobs",
      jobs: allJobs,
    });
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
  return;
};

export const createApplication = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { id, fullName, dob, phoneNo, email, address, role, availableDate } = req.body as ApplicationData;

    if (!fullName || !dob || !phoneNo || !email || !address || !role || !availableDate) {
      return res.status(400).json({ error: "Some fields are missing.Please fill in all fields" });
    }
    const application: ApplicationData = new JobApplication({
      job: new mongoose.Types.ObjectId(id),
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
    } else {
      return res.status(400).json({
        message: "Application not created",
      });
    }
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
  return;
};

export const updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { id, status } = req.body as ApplicationData;

    const jobId = new mongoose.Types.ObjectId(id);
    if (!id || !status) {
      return res.status(400).json({ error: "Some fields are missing.Please fill in all fields" });
    }
    if (status === "success") {
      const foundApplication = await JobApplication.findByIdAndUpdate(jobId, { status }, { new: true });
      if (foundApplication) {
        return res.status(200).json({ message: "Job application updated successfully" });
      } else {
        return res.status(404).json({ error: "no job application was found with the given id" });
      }
    } else {
      const removedApplication = await JobApplication.findOneAndRemove(jobId);
      if (removedApplication) {
        return res.status(200).json({ message: "job application removed" });
      } else {
        return res.status(404).json({ error: "no job application was found with the given id" });
      }
    }
  } catch (err: any) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const updateFlightHandler = (flight: FlightData, seatsBooked: { col: number; row: number }[], passengers: number, bookingData: BookingData) => {
  const seatsBookedAlready = flight.seatsBookedAlready.concat(seatsBooked);
  const bookings = flight.bookings.concat(bookingData._id);
  const seatsBookedUpdt = flight.seatsBooked + +passengers;
  return { ...flight.toObject(), seatsBookedAlready, seatsBooked: seatsBookedUpdt, bookings };
};
