import express from "express";
import {
  createBooking,
  deleteBooking,
  getFlights,
  inquireDelete,
  searchFlight,
  updateFlight,
  inquireEdit,
  getSummary,
  getJobs,
  createApplication,
  updateApplication,
} from "../controllers/flight";

const router = express.Router();
router.post("/search", searchFlight);
router.post("/create-booking", createBooking);
router.post("/update-flight", updateFlight);
router.get("/get-flights", getFlights);
router.post("/inquire-delete", inquireDelete);
router.post("/inquire-edit", inquireEdit);
router.post("/delete", deleteBooking);
router.get("/get-summary/:email", getSummary);
router.get("/jobs", getJobs);
router.post("/create-application", createApplication);
router.post("/update-application", updateApplication);

export default router;
