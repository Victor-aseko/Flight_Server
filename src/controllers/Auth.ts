import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import User, { UserData } from "../models/user";

export const signUp = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { firstName, lastName, email, password } = req.body as UserData;
    if (!firstName || !lastName || !password) {
      return res.status(400).json({ error: "Some fields are missing. Please fill in all fields" });
    }
    const userExist: UserData | null = await User.findOne({ email }).exec();
    if (userExist) {
      return res.status(201).json({
        error: "User already exists",
      });
    } else {
      const hashedPassword: string = await bcrypt.hash(password, 10);

      const newUser: UserData = new User({ firstName, lastName, email, password: hashedPassword, level: "user" });
      await newUser.save();
      return res.status(201).json({ message: "User saved successfully" });
    }
  } catch (error: any) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }

  return;
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Some fields are missing. Please fill in all fields" });
    } else {
      const userExist: UserData | null = await User.findOne({ email }).exec();

      if (userExist) {
        const passwordMatched: boolean = await bcrypt.compare(password, userExist.password);
        if (passwordMatched) {
          return res.status(200).json({ message: "user exists", level: userExist.level });
        }
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error: any) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
  return;
};
