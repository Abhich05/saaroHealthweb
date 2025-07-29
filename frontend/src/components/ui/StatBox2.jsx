export default function StatBox({ stats = [] }) {
  return (
    <div className="space-y-2">
      {stats.map(({ label, value }, idx) => (
        <div key={idx} className="border border-[#D9D4E3] rounded-xl px-7 py-5">
          <p className="text-sm mb-1 text-[#120F1A]-500">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}