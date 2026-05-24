import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth.middleware';
import { createAssetHandler, listAssetsHandler, updateAssetHandler } from './asset.controller';
import { UserRole } from '.prisma/client';

const assetRoutes = Router();

assetRoutes.use(authenticateUser);
assetRoutes.post('/', requireRole([UserRole.ADMIN, UserRole.TECH]), createAssetHandler);
assetRoutes.get('/', listAssetsHandler);
assetRoutes.patch('/:id', requireRole([UserRole.ADMIN, UserRole.TECH]), updateAssetHandler);

export { assetRoutes };
