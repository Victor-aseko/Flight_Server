import { Flight } from "../models/flight";
export async function searchHandler(data: { origin: string; destination: string }) {
  const { origin, destination } = data;

  if (origin === "") return { flights: null, previousPage: null, nextPage: null };

  const searchCriteria = {
    origin: { $regex: origin, $options: "i" },
    destination: { $regex: destination, $options: "i" },
  };

  const flights = await Flight.find(searchCriteria)
    .sort({ departureTime: 1 }) // sort by departure time in ascending order
    .limit(3);

  if (flights.length <= 0) {
    throw new Error("No flight found with the provided search criteria. Please change the criteria to get results.");
  }

  return { flights };
}
