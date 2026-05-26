'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Edit, Loader2, Plus } from 'lucide-react';
import { api } from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AssetListResponse, AssetRecord, AssetStatus, AssetType } from '@/types/dashboard';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const assetFormSchema = z.object({
  tagNumber: z.string().trim().regex(/^\d+$/, 'Tag number must contain only digits'),
  name: z.string().trim().min(2, 'Name is required').max(160),
  type: z.enum(['LAPTOP', 'MONITOR', 'PERIPHERAL', 'SERVER']),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED']),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

const updateAssetStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED']),
});

type UpdateAssetStatusValues = z.infer<typeof updateAssetStatusSchema>;

type AssetsDashboardProps = {
  initialData: AssetListResponse;
};

const emptyAssetFormValues: AssetFormValues = {
  tagNumber: '',
  name: '',
  type: 'LAPTOP',
  status: 'ACTIVE',
};

const formatAssetOwner = (asset: AssetRecord): string => {
  if (!asset.assignedUser) {
    return 'Inventory';
  }

  return asset.assignedUser.name;
};

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Unable to create the asset.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to create the asset.';
};

const AssetsDashboard = ({ initialData }: AssetsDashboardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const canManageAssets = user?.role === 'ADMIN' || user?.role === 'TECH';

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: emptyAssetFormValues,
  });

  const updateForm = useForm<UpdateAssetStatusValues>({
    resolver: zodResolver(updateAssetStatusSchema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (!selectedAsset) {
      return;
    }

    updateForm.reset({
      status: selectedAsset.status,
    });
  }, [selectedAsset, updateForm]);

  const assets = initialData.data;

  const summary = useMemo(() => {
    const active = assets.filter((asset) => asset.status === 'ACTIVE').length;
    const maintenance = assets.filter((asset) => asset.status === 'MAINTENANCE').length;
    const retired = assets.filter((asset) => asset.status === 'RETIRED').length;

    return { active, maintenance, retired, total: assets.length };
  }, [assets]);

  const handleCreateAsset = async (values: AssetFormValues): Promise<void> => {
    try {
      const payload = {
        tagNumber: Number(values.tagNumber),
        name: values.name,
        type: values.type as AssetType,
        status: values.status as AssetStatus,
      };

      await api.post('/api/assets', payload);
      toast.success('Asset created successfully.');
      setOpen(false);
      form.reset(emptyAssetFormValues);
      router.refresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleOpenEdit = (asset: AssetRecord): void => {
    setSelectedAsset(asset);
    setEditOpen(true);
  };

  const handleUpdateStatus = async (values: UpdateAssetStatusValues): Promise<void> => {
    if (!selectedAsset) {
      return;
    }

    try {
      await api.patch(`/api/assets/${selectedAsset.id}`, {
        status: values.status,
      });

      toast.success('Asset updated successfully.');
      setEditOpen(false);
      setSelectedAsset(null);
      router.refresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge>Corporate inventory</Badge>
            <CardTitle className="mt-4 text-3xl">Assets registry</CardTitle>
            <CardDescription className="mt-2 max-w-2xl">
              Operational table for networked equipment with creation and maintenance flows.
            </CardDescription>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300">
                <Plus className="size-4" />
                Novo Ativo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register new asset</DialogTitle>
                <DialogDescription>
                  Fill in the fields below to create a new corporate asset.
                </DialogDescription>
              </DialogHeader>

              <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(handleCreateAsset)}>
                <div className="space-y-2">
                  <Label htmlFor="tagNumber">Tag number</Label>
                  <Input id="tagNumber" inputMode="numeric" {...form.register('tagNumber')} />
                  {form.formState.errors.tagNumber ? (
                    <p className="text-sm text-rose-300">{form.formState.errors.tagNumber.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register('name')} />
                  {form.formState.errors.name ? <p className="text-sm text-rose-300">{form.formState.errors.name.message}</p> : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      className="h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 text-sm text-zinc-50 outline-none focus:border-cyan-300/40"
                      {...form.register('type')}
                    >
                      <option value="LAPTOP">Laptop</option>
                      <option value="MONITOR">Monitor</option>
                      <option value="PERIPHERAL">Peripheral</option>
                      <option value="SERVER">Server</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      className="h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 text-sm text-zinc-50 outline-none focus:border-cyan-300/40"
                      {...form.register('status')}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="RETIRED">Retired</option>
                    </select>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="submit"
                    className="gap-2 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    Create asset
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <SummaryCard label="Total assets" value={summary.total} />
            <SummaryCard label="Active" value={summary.active} />
            <SummaryCard label="Maintenance" value={summary.maintenance} />
            <SummaryCard label="Retired" value={summary.retired} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset data table</CardTitle>
          <CardDescription>Fetched server-side from GET /api/assets and rendered with shadcn-style primitives.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                {canManageAssets ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium text-white">{asset.tagNumber}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell>{asset.status}</TableCell>
                    <TableCell>{formatAssetOwner(asset)}</TableCell>
                    {canManageAssets ? (
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleOpenEdit(asset)}
                        >
                          <Edit className="size-4" />
                          Editar Ativo
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={canManageAssets ? 6 : 5} className="py-10 text-center text-zinc-400">
                    No assets available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Dialog
            open={editOpen}
            onOpenChange={(nextOpen) => {
              setEditOpen(nextOpen);

              if (!nextOpen) {
                setSelectedAsset(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit asset status</DialogTitle>
                <DialogDescription>
                  Update lifecycle status for asset #{selectedAsset?.tagNumber ?? 'N/A'}.
                </DialogDescription>
              </DialogHeader>

              <form className="mt-6 space-y-4" onSubmit={updateForm.handleSubmit(handleUpdateStatus)}>
                <div className="space-y-2">
                  <Label htmlFor="asset-status">Status</Label>
                  <select
                    id="asset-status"
                    className="h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 text-sm text-zinc-50 outline-none focus:border-cyan-300/40"
                    {...updateForm.register('status')}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                  {updateForm.formState.errors.status ? (
                    <p className="text-sm text-rose-300">{updateForm.formState.errors.status.message}</p>
                  ) : null}
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="submit"
                    className="gap-2 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                    disabled={updateForm.formState.isSubmitting}
                  >
                    {updateForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

type SummaryCardProps = {
  label: string;
  value: number;
};

const SummaryCard = ({ label, value }: SummaryCardProps): ReactNode => (
  <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
    <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
  </div>
);

export { AssetsDashboard };
