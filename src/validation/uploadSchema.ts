import { z } from "zod";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB for PDFs
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf"
];

export const mediaUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500, "Description too long").optional(),
  type: z.enum(["Photos", "Videos", "Magazines", "Publications", "Tabloids"]),
  // Note: the file object validation works for frontend FormData
  file: z.any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 25MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .jpg, .png, .webp, .gif and .pdf formats are supported."
    ),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
