const statusStyles = {
  'Priority Zone': 'border-cyan-300/20 bg-cyan-300/10 text-cyan-300',
  'High Demand': 'border-blue-300/20 bg-blue-300/10 text-blue-300',
  'Tourist Core': 'border-purple-300/20 bg-purple-300/10 text-purple-300',
  Planned: 'border-white/15 bg-white/10 text-white/70',
  'Core System': 'border-green-300/20 bg-green-300/10 text-green-300',
  Priority: 'border-yellow-300/20 bg-yellow-300/10 text-yellow-300',
}

export default function StatusBadge({ status }) {
  const className =
    statusStyles[status] ||
    'border-white/15 bg-white/10 text-white/70'

  return (
    <div className={`mb-5 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${className}`}>
      {status}
    </div>
  )
}