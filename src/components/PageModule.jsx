export default function PageModule({
  children,
  className = '',
}) {
  return (
    <div
      className={`rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8 ${className}`}
    >
      {children}
    </div>
  )
}