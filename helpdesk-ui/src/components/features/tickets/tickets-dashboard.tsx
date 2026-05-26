'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Edit, Loader2, MessageSquarePlus, Plus } from 'lucide-react';
import { api } from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AssetRecord, TicketListResponse, TicketPriority, TicketRecord } from '@/types/dashboard';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const ticketFormSchema = z.object({
  title: z.string().trim().min(3, 'Title is required').max(180),
  description: z.string().trim().min(10, 'Description is required').max(5000),
  assetId: z.string().uuid('Select a valid asset'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

const ticketStatusFormSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

type TicketStatusFormValues = z.infer<typeof ticketStatusFormSchema>;

const ticketCommentFormSchema = z.object({
  message: z.string().trim().min(1, 'Comment message is required').max(2000),
});

type TicketCommentFormValues = z.infer<typeof ticketCommentFormSchema>;

type TicketsDashboardProps = {
  initialData: TicketListResponse;
  assets: AssetRecord[];
};

const emptyTicketFormValues: TicketFormValues = {
  title: '',
  description: '',
  assetId: '',
  priority: 'MEDIUM',
};

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Unable to create the ticket.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to create the ticket.';
};

const TicketsDashboard = ({ initialData, assets }: TicketsDashboardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const canManageTickets = user?.role === 'ADMIN' || user?.role === 'TECH';

  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [selectedTicketForStatus, setSelectedTicketForStatus] = useState<TicketRecord | null>(null);
  const [selectedTicketForComment, setSelectedTicketForComment] = useState<TicketRecord | null>(null);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: emptyTicketFormValues,
  });

  const statusForm = useForm<TicketStatusFormValues>({
    resolver: zodResolver(ticketStatusFormSchema),
    defaultValues: {
      status: 'OPEN',
    },
  });

  const commentForm = useForm<TicketCommentFormValues>({
    resolver: zodResolver(ticketCommentFormSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (!selectedTicketForStatus) {
      return;
    }

    statusForm.reset({
      status: selectedTicketForStatus.status,
    });
  }, [selectedTicketForStatus, statusForm]);

  const tickets = initialData.data;

  const summary = useMemo(() => {
    const openTickets = tickets.filter((ticket) => ticket.status === 'OPEN').length;
    const inProgress = tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((ticket) => ticket.status === 'RESOLVED').length;
    const closed = tickets.filter((ticket) => ticket.status === 'CLOSED').length;

    return { openTickets, inProgress, resolved, closed, total: tickets.length };
  }, [tickets]);

  const handleCreateTicket = async (values: TicketFormValues): Promise<void> => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        assetId: values.assetId,
        priority: values.priority as TicketPriority,
      };

      await api.post('/api/tickets', payload);
      toast.success('Ticket created successfully.');
      setOpen(false);
      form.reset(emptyTicketFormValues);
      router.refresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleOpenStatusModal = (ticket: TicketRecord): void => {
    setSelectedTicketForStatus(ticket);
    setStatusOpen(true);
  };

  const handleOpenCommentModal = (ticket: TicketRecord): void => {
    setSelectedTicketForComment(ticket);
    commentForm.reset({ message: '' });
    setCommentOpen(true);
  };

  const handleUpdateTicketStatus = async (values: TicketStatusFormValues): Promise<void> => {
    const ticketId = selectedTicketForStatus?.id;

    if (!ticketId) {
      toast.error('Unable to identify the selected ticket.');
      return;
    }

    try {
      const payload = {
        status: values.status,
      };

      await api.patch(`/api/tickets/${ticketId}/status`, payload);

      toast.success('Ticket status updated successfully.');
      setStatusOpen(false);
      setSelectedTicketForStatus(null);
      router.refresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleCreateComment = async (values: TicketCommentFormValues): Promise<void> => {
    const ticketId = selectedTicketForComment?.id;

    if (!ticketId) {
      toast.error('Unable to identify the selected ticket.');
      return;
    }

    try {
      const payload = {
        message: values.message,
      };

      await api.post(`/api/tickets/${ticketId}/comments`, payload);

      toast.success('Comment added successfully.');
      setCommentOpen(false);
      setSelectedTicketForComment(null);
      commentForm.reset({ message: '' });
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
            <Badge>Incident control</Badge>
            <CardTitle className="mt-4 text-3xl">Tickets queue</CardTitle>
            <CardDescription className="mt-2 max-w-2xl">
              Server-rendered incident list with modal creation flow and automatic refresh after successful insertion.
            </CardDescription>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300">
                <Plus className="size-4" />
                Abrir Chamado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open new ticket</DialogTitle>
                <DialogDescription>
                  Register an incident and associate it with an asset.
                </DialogDescription>
              </DialogHeader>

              <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(handleCreateTicket)}>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...form.register('title')} />
                  {form.formState.errors.title ? <p className="text-sm text-rose-300">{form.formState.errors.title.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...form.register('description')} />
                  {form.formState.errors.description ? (
                    <p className="text-sm text-rose-300">{form.formState.errors.description.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="assetId">Asset</Label>
                    <select
                      id="assetId"
                      className="h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 text-sm text-zinc-50 outline-none focus:border-cyan-300/40"
                      {...form.register('assetId')}
                    >
                      <option value="">Select one asset</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          #{asset.tagNumber} - {asset.name}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.assetId ? <p className="text-sm text-rose-300">{form.formState.errors.assetId.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      className="h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 text-sm text-zinc-50 outline-none focus:border-cyan-300/40"
                      {...form.register('priority')}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
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
                    Create ticket
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-5">
            <SummaryCard label="Total tickets" value={summary.total} />
            <SummaryCard label="Open" value={summary.openTickets} />
            <SummaryCard label="In progress" value={summary.inProgress} />
            <SummaryCard label="Resolved" value={summary.resolved} />
            <SummaryCard label="Closed" value={summary.closed} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ticket data table</CardTitle>
          <CardDescription>Fetched server-side from GET /api/tickets and refreshed after ticket creation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium text-white">{ticket.title}</TableCell>
                    <TableCell>{ticket.status}</TableCell>
                    <TableCell>{ticket.priority}</TableCell>
                    <TableCell>#{ticket.asset.tagNumber} - {ticket.asset.name}</TableCell>
                    <TableCell>{ticket.author.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManageTickets ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleOpenStatusModal(ticket)}
                          >
                            <Edit className="size-4" />
                            Evoluir Chamado
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleOpenCommentModal(ticket)}
                        >
                          <MessageSquarePlus className="size-4" />
                          Novo Comentário
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-zinc-400">
                    No tickets available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Dialog
            open={statusOpen}
            onOpenChange={(nextOpen) => {
              setStatusOpen(nextOpen);

              if (!nextOpen) {
                setSelectedTicketForStatus(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Evolve ticket status</DialogTitle>
                <DialogDescription>
                  Update the lifecycle for ticket &quot;{selectedTicketForStatus?.title ?? 'Selected ticket'}&quot;.
                </DialogDescription>
              </DialogHeader>

              <form className="mt-6 space-y-4" onSubmit={statusForm.handleSubmit(handleUpdateTicketStatus)}>
                <div className="space-y-2">
                  <Label htmlFor="ticket-status">Status</Label>
                  <select
                    id="ticket-status"
                    className="h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 text-sm text-zinc-50 outline-none focus:border-cyan-300/40"
                    {...statusForm.register('status')}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  {statusForm.formState.errors.status ? (
                    <p className="text-sm text-rose-300">{statusForm.formState.errors.status.message}</p>
                  ) : null}
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="submit"
                    className="gap-2 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                    disabled={statusForm.formState.isSubmitting}
                  >
                    {statusForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    Save status
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={commentOpen}
            onOpenChange={(nextOpen) => {
              setCommentOpen(nextOpen);

              if (!nextOpen) {
                setSelectedTicketForComment(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add new comment</DialogTitle>
                <DialogDescription>
                  Add an operational note for ticket &quot;{selectedTicketForComment?.title ?? 'Selected ticket'}&quot;.
                </DialogDescription>
              </DialogHeader>

              <form className="mt-6 space-y-4" onSubmit={commentForm.handleSubmit(handleCreateComment)}>
                <div className="space-y-2">
                  <Label htmlFor="ticket-comment-message">Message</Label>
                  <Textarea id="ticket-comment-message" {...commentForm.register('message')} />
                  {commentForm.formState.errors.message ? (
                    <p className="text-sm text-rose-300">{commentForm.formState.errors.message.message}</p>
                  ) : null}
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="submit"
                    className="gap-2 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                    disabled={commentForm.formState.isSubmitting}
                  >
                    {commentForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    Save comment
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

const SummaryCard = ({ label, value }: SummaryCardProps) => (
  <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
    <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
  </div>
);

export { TicketsDashboard };
