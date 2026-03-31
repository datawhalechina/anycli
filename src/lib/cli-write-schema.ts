import { z } from "zod";

/** 与 POST/PATCH 请求体一致的 CLI 可写字段（不含 slug） */
export const cliWriteBodySchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(10).max(8000),
  version: z.string().max(32).optional(),
  homepage: z.string().url(),
  repository: z.string().url(),
  license: z.string().max(64).optional(),
  categories: z.array(z.string()).min(1).max(20),
  tags: z.array(z.string()).min(1).max(40),
  docsUrl: z.string().url(),
  installMethod: z.enum(["brew", "npm", "pnpm", "cargo", "pip", "go", "other"]),
  installPackage: z.string().min(1).max(200),
  binaryName: z.string().min(1).max(120),
  runExample: z.string().min(1).max(500),
});

export const createCliSchema = cliWriteBodySchema.extend({
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export type CliWriteBody = z.infer<typeof cliWriteBodySchema>;
