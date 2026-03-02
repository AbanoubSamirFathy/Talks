import * as zod from "zod";
import { regex } from "../assets/regex";

export const ChangePasswordSchema = zod
  .object({
    currentPassword: zod.string().nonempty("Current password is required"),

    newPassword: zod
      .string()
      .nonempty("New password is required")
      .regex(
        regex.password,
        "Password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
      ),

    confirmPassword: zod.string().nonempty("Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password and Confirm Password must be the same.",
    path: ["confirmPassword"],
  });
