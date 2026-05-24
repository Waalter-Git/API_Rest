import { TicketPriority, TicketStatus } from '.prisma/client';
import { z } from 'zod';

const createTicketSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  assetId: z.string().uuid(),
  priority: z.nativeEnum(TicketPriority).optional(),
});

const ticketListQuerySchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const ticketStatusParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});

const createTicketCommentSchema = z.object({
  message: z.string().trim().min(1, 'Comment message cannot be empty').max(2000),
});

export { createTicketCommentSchema, createTicketSchema, ticketListQuerySchema, ticketStatusParamsSchema, updateTicketStatusSchema };
