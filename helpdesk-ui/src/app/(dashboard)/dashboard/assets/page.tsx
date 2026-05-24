const AssetsPage = () => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/60">Assets</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Inventory management</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
        Central view reserved for corporate devices, owners, maintenance status and lifecycle tracking.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Registered assets', value: '128' },
          { label: 'In maintenance', value: '09' },
          { label: 'Retired', value: '14' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsPage;
