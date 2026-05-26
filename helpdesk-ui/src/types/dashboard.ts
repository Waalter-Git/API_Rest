import type { AuthRole } from '@/types/auth';

export type AssetType = 'LAPTOP' | 'MONITOR' | 'PERIPHERAL' | 'SERVER';

export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AssetOwner = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

export type AssetRecord = {
  id: string;
  tagNumber: number;
  name: string;
  type: AssetType;
  status: AssetStatus;
  assignedUserId: string | null;
  assignedUser?: AssetOwner | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetListResponse = {
  data: AssetRecord[];
  pagination: Pagination;
};

export type TicketAuthor = AssetOwner;

export type TicketTechnician = AssetOwner;

export type TicketAsset = Pick<AssetRecord, 'id' | 'tagNumber' | 'name' | 'type' | 'status'> & {
  assignedUser?: AssetOwner | null;
};

export type TicketRecord = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  author: TicketAuthor;
  technician: TicketTechnician | null;
  asset: TicketAsset;
};

export type TicketListResponse = {
  data: TicketRecord[];
  pagination: Pagination;
};
