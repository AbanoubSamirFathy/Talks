import * as zod from "zod";
import { regex } from "../assets/regex";

export const SigninSchema = zod.object({
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
});
