import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import flightRoute from "./routes/flight";
import userRoute from "./routes/auth";
import cors from "cors";
// import "./utils/saveData";
const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.json()); // application/json
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  const message = err.message;
  res.status(status).json({ message: message });
  next();
});

app.use("/user", userRoute);
app.use("/flight", flightRoute);

mongoose.set("strictQuery", true);
// mongoose.set("strictPopulate", false);

mongoose
  .connect("mongodb+srv://victoraseko2024:oBPoHq0ZNEFQ3J3Z@cluster1.3sffq8l.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    app.listen(3000);
    console.log("listening at port 3000.....");
  })
  .catch(err => {
    console.log(err);
  });
