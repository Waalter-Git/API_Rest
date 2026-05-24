import { Router } from 'express';
import { UserRole } from '.prisma/client';
import { authenticateUser, requireRole } from '../../middleware/auth.middleware';
import { createTicketCommentHandler, createTicketHandler, getTicketsHandler, updateTicketStatusHandler } from './ticket.controller';

const ticketRoutes = Router();

ticketRoutes.use(authenticateUser);
ticketRoutes.post('/', createTicketHandler);
ticketRoutes.get('/', getTicketsHandler);
ticketRoutes.post('/:ticketId/comments', createTicketCommentHandler);
ticketRoutes.patch('/:id/status', requireRole([UserRole.ADMIN, UserRole.TECH]), updateTicketStatusHandler);

export { ticketRoutes };
