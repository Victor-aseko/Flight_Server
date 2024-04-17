"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchHandler = void 0;
const flight_1 = require("../models/flight");
async function searchHandler(data) {
    const { origin, destination } = data;
    if (origin === "")
        return { flights: null, previousPage: null, nextPage: null };
    const searchCriteria = {
        origin: { $regex: origin, $options: "i" },
        destination: { $regex: destination, $options: "i" },
    };
    const flights = await flight_1.Flight.find(searchCriteria)
        .sort({ departureTime: 1 }) // sort by departure time in ascending order
        .limit(3);
    if (flights.length <= 0) {
        throw new Error("No flight found with the provided search criteria. Please change the criteria to get results.");
    }
    return { flights };
}
exports.searchHandler = searchHandler;
