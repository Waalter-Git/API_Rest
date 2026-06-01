import { type TicketPriority, type TicketStatus, type UserRole, Prisma } from '.prisma/client';
import prisma from '../../config/prisma';

type AuthenticatedTicketUser = {
  id: string;
  role: UserRole;
};

type CreateTicketInput = {
  title: string;
  description: string;
  assetId: string;
  priority?: TicketPriority;
};

type ListTicketsInput = {
  status?: TicketStatus;
  priority?: TicketPriority;
  page: number;
  limit: number;
};

type UpdateTicketStatusInput = {
  status: TicketStatus;
};

type CreateTicketCommentInput = {
  message: string;
};

type PaginatedTickets<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type PrismaErrorLike = {
  code?: string;
};

const isUniqueConstraintError = (error: unknown): error is PrismaErrorLike & Error => {
  return error instanceof Error && typeof (error as PrismaErrorLike).code === 'string' && (error as PrismaErrorLike).code === 'P2002';
};

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

const ticketListSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  technician: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  asset: {
    select: {
      id: true,
      tagNumber: true,
      name: true,
      type: true,
      status: true,
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
} as const;

const ticketCommentSelect = {
  id: true,
  message: true,
  createdAt: true,
  updatedAt: true,
  ticketId: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  ticket: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
    },
  },
} as const;

type TicketListItem = Prisma.TicketGetPayload<{ select: typeof ticketListSelect }>;
type TicketCommentItem = Prisma.TicketCommentGetPayload<{ select: typeof ticketCommentSelect }>;

const statusOrder: Record<TicketStatus, number> = {
  OPEN: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  CLOSED: 3,
};

const buildTicketWhereClause = (user: AuthenticatedTicketUser, filters: Pick<ListTicketsInput, 'status' | 'priority'>): Prisma.TicketWhereInput => {
  const baseFilter: Prisma.TicketWhereInput = {};

  if (filters.status) {
    baseFilter.status = filters.status;
  }

  if (filters.priority) {
    baseFilter.priority = filters.priority;
  }

  if (user.role === 'EMPLOYEE') {
    return {
      ...baseFilter,
      authorId: user.id,
      asset: {
        assignedUserId: user.id,
        status: 'ACTIVE',
      },
    };
  }

  return baseFilter;
};

const createTicket = async (user: AuthenticatedTicketUser, input: CreateTicketInput) => {
  const asset = await prisma.asset.findUnique({
    where: { id: input.assetId },
    select: {
      id: true,
      assignedUserId: true,
    },
  });

  if (!asset) {
    throw new NotFoundError('Asset not found');
  }

  const isPrivileged = user.role === 'ADMIN' || user.role === 'TECH';

  if (asset.assignedUserId !== user.id && !isPrivileged) {
    throw new ForbiddenError('You do not own the selected asset');
  }

  try {
    return await prisma.ticket.create({
      data: {
        title: input.title,
        description: input.description,
        assetId: input.assetId,
        authorId: user.id,
        priority: input.priority ?? 'MEDIUM',
        status: 'OPEN',
      },
      select: ticketListSelect,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new BadRequestError('Unable to create ticket');
    }

    throw error;
  }
};

const getTickets = async (user: AuthenticatedTicketUser, filters: ListTicketsInput): Promise<PaginatedTickets<TicketListItem>> => {
  const where = buildTicketWhereClause(user, filters);
  const skip = (filters.page - 1) * filters.limit;

  const [data, total] = await prisma.$transaction([
    prisma.ticket.findMany({
      where,
      select: ticketListSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  };
};

const updateTicketStatus = async (user: AuthenticatedTicketUser, ticketId: string, input: UpdateTicketStatusInput) => {
  if (user.role !== 'ADMIN' && user.role !== 'TECH') {
    throw new ForbiddenError('Forbidden');
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  const currentOrder = statusOrder[ticket.status];
  const targetOrder = statusOrder[input.status];

  if (targetOrder < currentOrder) {
    throw new BadRequestError('Invalid ticket status transition');
  }

  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status: input.status },
    select: ticketListSelect,
  });
};

const createTicketComment = async (
  user: AuthenticatedTicketUser,
  ticketId: string,
  input: CreateTicketCommentInput,
): Promise<TicketCommentItem> => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  const canComment = user.role === 'ADMIN' || user.role === 'TECH' || ticket.authorId === user.id;

  if (!canComment) {
    throw new ForbiddenError('Forbidden');
  }

  return prisma.ticketComment.create({
    data: {
      message: input.message,
      ticketId,
      authorId: user.id,
    },
    select: ticketCommentSelect,
  });
};

export { BadRequestError, ForbiddenError, NotFoundError, createTicket, createTicketComment, getTickets, updateTicketStatus };
