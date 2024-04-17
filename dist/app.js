"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const flight_1 = __importDefault(require("./routes/flight"));
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("cors"));
// import "./utils/saveData";
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" }));
app.use(body_parser_1.default.json()); // application/json
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message;
    res.status(status).json({ message: message });
    next();
});
app.use("/user", auth_1.default);
app.use("/flight", flight_1.default);
mongoose_1.default.set("strictQuery", true);
// mongoose.set("strictPopulate", false);
mongoose_1.default
    .connect("mongodb+srv://victoraseko2024:oBPoHq0ZNEFQ3J3Z@cluster1.3sffq8l.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
    app.listen(3000);
    console.log("listening at port 3000.....");
})
    .catch(err => {
    console.log(err);
});
