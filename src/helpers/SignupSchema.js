import * as zod from "zod";
import { regex } from "../assets/regex";
import calculateAge from "../helpers/date";

export const SignupSchema = zod
  .object({
    name: zod
      .string()
      .nonempty("Full Name is required")
      .regex(regex.name, "Enter valid full name"),
    email: zod
      .string()
      .nonempty("Email is required")
      .regex(regex.email, "Enter valid email"),
    password: zod
      .string()
      .nonempty("Password is required")
      .regex(
        regex.password,
        "Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
      ),
    rePassword: zod.string().nonempty("Password is required"),
    dateOfBirth: zod
      .string()
      .refine(
        (birthDate) => calculateAge(birthDate) >= 18,
        "Age must be more than or equal 18",
      ),
    gender: zod
      .string()
      .nonempty("Gender is required")
      .regex(regex.gender, "Gender must be male or female"),
  })
  .refine((data) => data.password == data.rePassword, {
    message: "Password and Confirm Password must be the same.",
    path: ["rePassword"],
  });