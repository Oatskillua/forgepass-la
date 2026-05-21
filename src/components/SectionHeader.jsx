export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
}) {
  return (
    <div className="mb-12">
      {eyebrow && (
        <div className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
          {eyebrow}
        </div>
      )}

      <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
        {title}
      </h2>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
        {subtitle}
      </p>
    </div>
  )
}