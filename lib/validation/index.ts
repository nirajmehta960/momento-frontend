import { z } from "zod";

// ============================================================
// AUTHENTICATION VALIDATION
// ============================================================

export const SignupValidation = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["USER", "ADMIN"]).optional().default("USER"),
});

export const SigninValidation = z.object({
  email: z.string().min(1, { message: "Email/Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// ============================================================
// POST VALIDATION
// ============================================================

export const PostValidation = z.object({
  caption: z.string().min(1, { message: "Caption is required" }),
  file: z
    .custom<File[]>()
    .refine((files) => files && files.length > 0, {
      message: "Image is required",
    })
    .refine((files) => files && files[0] && files[0].size <= 5 * 1024 * 1024, {
      message: "Image size must be less than 5MB",
    }),
  location: z.string().optional(),
  tags: z.string().optional(),
});

export const UpdatePostValidation = z.object({
  caption: z.string().min(1, { message: "Caption is required" }),
  file: z
    .custom<File[]>()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0] && files[0].size <= 5 * 1024 * 1024;
      },
      {
        message: "Image size must be less than 5MB",
      }
    )
    .optional(),
  location: z.string().optional(),
  tags: z.string().optional(),
});

// ============================================================
// PROFILE VALIDATION
// ============================================================

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  username: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email(),
  bio: z.string(),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || val.length >= 8,
      { message: "Password must be at least 8 characters" }
    ),
});

// ============================================================
// REVIEW VALIDATION
// ============================================================

export const ReviewValidation = z.object({
  rating: z
    .number()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" }),
  comment: z.string().min(1, { message: "Comment is required" }),
});
