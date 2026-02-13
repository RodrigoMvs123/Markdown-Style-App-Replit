import { z } from 'zod';

export const api = {
  enhance: {
    method: 'POST' as const,
    path: '/api/enhance-markdown',
    input: z.object({
      text: z.string().min(1, "Text is required"),
      styleSource: z.string().optional(),
    }),
    responses: {
      200: z.object({
        enhancedText: z.string(),
      }),
      400: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
  },
};
