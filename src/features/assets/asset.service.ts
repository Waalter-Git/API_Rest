import { type AssetStatus, type AssetType, Prisma, type UserRole } from '.prisma/client';
import prisma from '../../config/prisma';

type CreateAssetInput = {
  tagNumber: number;
  name: string;
  type: AssetType;
  status?: AssetStatus;
  assignedUserId?: string | null;
};

type UpdateAssetInput = Partial<CreateAssetInput>;

type PaginationInput = {
  page: number;
  limit: number;
};

type AssetOwnerSelect = {
  id: true;
  name: true;
  email: true;
  role: true;
};

const adminAssetSelect = {
  id: true,
  tagNumber: true,
  name: true,
  type: true,
  status: true,
  assignedUserId: true,
  createdAt: true,
  updatedAt: true,
  assignedUser: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} as const;

const employeeAssetSelect = {
  id: true,
  tagNumber: true,
  name: true,
  type: true,
  status: true,
  assignedUserId: true,
  createdAt: true,
  updatedAt: true,
} as const;

type AdminAsset = Prisma.AssetGetPayload<{ select: typeof adminAssetSelect }>;
type EmployeeAsset = Prisma.AssetGetPayload<{ select: typeof employeeAssetSelect }>;
type AssetListItem = AdminAsset | EmployeeAsset;

type PaginatedAssets<T> = {
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

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

const assertAvailableTagNumber = async (tagNumber: number, assetId?: string): Promise<void> => {
  const conflictingAsset = await prisma.asset.findFirst({
    where: {
      tagNumber,
      ...(assetId ? { NOT: { id: assetId } } : {}),
    },
    select: { id: true },
  });

  if (conflictingAsset) {
    throw new ConflictError('An asset with this tagNumber already exists');
  }
};

const createAsset = async (input: CreateAssetInput) => {
  await assertAvailableTagNumber(input.tagNumber);

  try {
    return await prisma.asset.create({
      data: {
        tagNumber: input.tagNumber,
        name: input.name,
        type: input.type,
        status: input.status,
        assignedUserId: input.assignedUserId ?? null,
      },
      select: adminAssetSelect,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ConflictError('An asset with this tagNumber already exists');
    }

    throw error;
  }
};

const listAssets = async (user: { id: string; role: UserRole }, pagination: PaginationInput): Promise<PaginatedAssets<AssetListItem>> => {
  const skip = (pagination.page - 1) * pagination.limit;

  if (user.role === 'EMPLOYEE') {
    const [data, total] = await prisma.$transaction([
      prisma.asset.findMany({
        where: {
          status: 'ACTIVE',
          assignedUserId: user.id,
        },
        select: employeeAssetSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.asset.count({
        where: {
          status: 'ACTIVE',
          assignedUserId: user.id,
        },
      }),
    ]);

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
      },
    };
  }

  const where = {};

  const [data, total] = await prisma.$transaction([
    prisma.asset.findMany({
      where,
      select: adminAssetSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pagination.limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    },
  };
};

const updateAsset = async (assetId: string, input: UpdateAssetInput) => {
  const existingAsset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true },
  });

  if (!existingAsset) {
    throw new NotFoundError('Asset not found');
  }

  if (input.tagNumber !== undefined) {
    await assertAvailableTagNumber(input.tagNumber, assetId);
  }

  try {
    return await prisma.asset.update({
      where: { id: assetId },
      data: {
        ...(input.tagNumber !== undefined ? { tagNumber: input.tagNumber } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.assignedUserId !== undefined ? { assignedUserId: input.assignedUserId } : {}),
      },
      select: adminAssetSelect,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ConflictError('An asset with this tagNumber already exists');
    }

    throw error;
  }
};

export { createAsset, listAssets, updateAsset, ConflictError, NotFoundError };
