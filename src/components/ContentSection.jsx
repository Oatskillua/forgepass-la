export default function ContentSection({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="mt-14">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-2xl font-black text-white">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-3 max-w-3xl text-white/55">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  )
}