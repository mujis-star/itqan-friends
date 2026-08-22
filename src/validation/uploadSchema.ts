import { z } from "zod";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for Videos, PDFs, and High-Res Images
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
  "video/avi",
  "video/mpeg",
  "video/mp2t",
  "video/3gpp",
  "video/x-msvideo",
  "video/x-ms-wmv",
];

export const mediaUploadSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().max(1000, "Description too long").optional().nullable(),
  type: z.enum(["Photos", "Videos", "Magazines", "Publications", "Tabloids"]),
  videoUrl: z.string().optional().nullable(),
  file: z
    .any()
    .optional()
    .nullable()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, `Max file size is 100MB.`)
    .refine(
      (file) =>
        !file ||
        !file.type ||
        ACCEPTED_FILE_TYPES.includes(file?.type) ||
        file.type.startsWith("video/") ||
        file.type.startsWith("image/"),
      "File format not supported. Please upload a valid image, PDF, or video file."
    ),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
