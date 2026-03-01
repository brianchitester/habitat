import { z } from "zod/v4";

export const habitFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
  color: z.string().min(1, "Color is required"),
  daily_target: z.coerce.number().int().min(1, "Target must be at least 1").max(999, "Target must be 999 or less"),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Date must be in YYYY-MM-DD format"
);
