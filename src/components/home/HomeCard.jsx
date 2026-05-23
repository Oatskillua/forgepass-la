export default function HomeCard({
  children,
  className = '',
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.06] ${className}`}
    >
      {children}
    </div>
  )
}