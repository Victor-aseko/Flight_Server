"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signUp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const signUp = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !password) {
            return res.status(400).json({ error: "Some fields are missing. Please fill in all fields" });
        }
        const userExist = await user_1.default.findOne({ email }).exec();
        if (userExist) {
            return res.status(201).json({
                error: "User already exists",
            });
        }
        else {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const newUser = new user_1.default({ firstName, lastName, email, password: hashedPassword, level: "user" });
            await newUser.save();
            return res.status(201).json({ message: "User saved successfully" });
        }
    }
    catch (error) {
        if (!error.statusCode)
            error.statusCode = 500;
        next(error);
    }
    return;
};
exports.signUp = signUp;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Some fields are missing. Please fill in all fields" });
        }
        else {
            const userExist = await user_1.default.findOne({ email }).exec();
            if (userExist) {
                const passwordMatched = await bcryptjs_1.default.compare(password, userExist.password);
                if (passwordMatched) {
                    return res.status(200).json({ message: "user exists", level: userExist.level });
                }
            }
            return res.status(401).json({ error: "Invalid credentials" });
        }
    }
    catch (error) {
        if (!error.statusCode)
            error.statusCode = 500;
        next(error);
    }
    return;
};
exports.login = login;
