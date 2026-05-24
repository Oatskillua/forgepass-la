import Badge from '../Badge'

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
        <Badge tone="cyan" className="mb-4 uppercase tracking-[0.25em]">
          {eyebrow}
        </Badge>
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