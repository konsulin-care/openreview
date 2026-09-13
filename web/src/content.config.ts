import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
  }),
});

const faq = defineCollection({
  loader: glob({ base: "./src/content/faq", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    question: z.string(),
    category: z.string().default("general"),
    order: z.number().default(0),
  }),
});

const components = defineCollection({
  loader: glob({ base: "./src/content/components", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.string().default("general"),
    status: z.enum(["stable", "experimental", "planned"]).default("planned"),
  }),
});

export const collections = { blog, docs, faq, components };
