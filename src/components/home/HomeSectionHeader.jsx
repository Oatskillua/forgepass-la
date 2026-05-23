export default function HomeSectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}) {
  const alignment =
    align === 'left'
      ? 'text-left'
      : 'text-center'

  const paragraphAlignment =
    align === 'left'
      ? ''
      : 'mx-auto'

  return (
    <div className={`mb-10 ${alignment}`}>
      {eyebrow && (
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
          {eyebrow}
        </p>
      )}

      <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
        {title}
      </h2>

      {subtitle && (
        <p className={`mt-5 max-w-3xl text-white/60 ${paragraphAlignment}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}