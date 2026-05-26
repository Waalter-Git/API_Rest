import type { NextFunction, Request, Response } from 'express';
import { createTicketCommentSchema, createTicketSchema, ticketCommentParamsSchema, ticketListQuerySchema, ticketStatusParamsSchema, updateTicketStatusSchema } from './ticket.schema';
import { BadRequestError, ForbiddenError, NotFoundError, createTicket, createTicketComment, getTickets, updateTicketStatus } from './ticket.service';

const createTicketHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    if (!request.user) {
      response.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = createTicketSchema.parse(request.body);
    const ticket = await createTicket(request.user, payload);

    response.status(201).json(ticket);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      response.status(403).json({ message: error.message });
      return;
    }

    if (error instanceof NotFoundError) {
      response.status(404).json({ message: error.message });
      return;
    }

    next(error);
  }
};

const getTicketsHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    if (!request.user) {
      response.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const query = ticketListQuerySchema.parse(request.query);
    const tickets = await getTickets(request.user, query);

    response.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

const updateTicketStatusHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    if (!request.user) {
      response.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const params = ticketStatusParamsSchema.parse(request.params);
    const payload = updateTicketStatusSchema.parse(request.body);
    const ticket = await updateTicketStatus(request.user, params.id, payload);

    response.status(200).json(ticket);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      response.status(403).json({ message: error.message });
      return;
    }

    if (error instanceof BadRequestError) {
      response.status(400).json({ message: error.message });
      return;
    }

    if (error instanceof NotFoundError) {
      response.status(404).json({ message: error.message });
      return;
    }

    next(error);
  }
};

const createTicketCommentHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    if (!request.user) {
      response.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const params = ticketCommentParamsSchema.parse(request.params);
    const payload = createTicketCommentSchema.parse(request.body);
    const comment = await createTicketComment(request.user, params.ticketId, payload);

    response.status(201).json(comment);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      response.status(403).json({ message: error.message });
      return;
    }

    if (error instanceof NotFoundError) {
      response.status(404).json({ message: error.message });
      return;
    }

    next(error);
  }
};

export { createTicketCommentHandler, createTicketHandler, getTicketsHandler, updateTicketStatusHandler };
