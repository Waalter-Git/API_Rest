import { AssetStatus, AssetType } from '.prisma/client';
import { z } from 'zod';

const assetTypeSchema = z.nativeEnum(AssetType);
const assetStatusSchema = z.nativeEnum(AssetStatus);

const createAssetSchema = z.object({
  tagNumber: z.coerce.number().int().positive('tagNumber must be a positive integer'),
  name: z.string().trim().min(2).max(160),
  type: assetTypeSchema,
  status: assetStatusSchema.optional(),
  assignedUserId: z.string().uuid().optional().nullable(),
});

const updateAssetSchema = z.object({
  tagNumber: z.coerce.number().int().positive('tagNumber must be a positive integer').optional(),
  name: z.string().trim().min(2).max(160).optional(),
  type: assetTypeSchema.optional(),
  status: assetStatusSchema.optional(),
  assignedUserId: z.string().uuid().optional().nullable(),
}).refine(
  (value) => value.tagNumber !== undefined || value.name !== undefined || value.type !== undefined || value.status !== undefined || value.assignedUserId !== undefined,
  {
    message: 'At least one field must be provided',
  },
);

const assetIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const assetListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export { assetIdParamsSchema, assetListQuerySchema, createAssetSchema, updateAssetSchema };
