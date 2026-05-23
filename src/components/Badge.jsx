export default function Badge({
  children,
  tone = 'cyan',
  className = '',
}) {
  const tones = {
    cyan: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-300',
    white: 'border-white/10 bg-white/5 text-white/70',
    green: 'border-green-300/20 bg-green-300/10 text-green-300',
    yellow: 'border-yellow-300/20 bg-yellow-300/10 text-yellow-300',
    blue: 'border-blue-300/20 bg-blue-300/10 text-blue-300',
    purple: 'border-purple-300/20 bg-purple-300/10 text-purple-300',
  }

  return (
    <div
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tones[tone] || tones.white} ${className}`}
    >
      {children}
    </div>
  )
}