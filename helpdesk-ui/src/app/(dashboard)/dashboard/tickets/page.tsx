const TicketsPage = () => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Tickets</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Service queue</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
        Follow incident progress, priority distribution and operational response across the support queue.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[
          'Critical incidents waiting triage',
          'Tickets with active technician assignment',
          'Resolved tickets pending closure review',
          'User comments awaiting follow-up',
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsPage;
