import type { NextFunction, Request, Response } from 'express';
import { assetIdParamsSchema, assetListQuerySchema, createAssetSchema, updateAssetSchema } from './asset.schema';
import { ConflictError, NotFoundError, createAsset, listAssets, updateAsset } from './asset.service';

const createAssetHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = createAssetSchema.parse(request.body);
    const createdAsset = await createAsset(payload);

    response.status(201).json(createdAsset);
  } catch (error) {
    if (error instanceof ConflictError) {
      response.status(409).json({ message: error.message });
      return;
    }

    next(error);
  }
};

const listAssetsHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const query = assetListQuerySchema.parse(request.query);

    if (!request.user) {
      response.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await listAssets(request.user, query);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateAssetHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const params = assetIdParamsSchema.parse(request.params);
    const payload = updateAssetSchema.parse(request.body);
    const updatedAsset = await updateAsset(params.id, payload);

    response.status(200).json(updatedAsset);
  } catch (error) {
    if (error instanceof NotFoundError) {
      response.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof ConflictError) {
      response.status(409).json({ message: error.message });
      return;
    }

    next(error);
  }
};

export { createAssetHandler, listAssetsHandler, updateAssetHandler };
