export default function HomeSection({
  children,
  id,
  className = '',
}) {
  return (
    <section
      id={id}
      className={`mb-20 lg:mb-32 ${className}`}
    >
      {children}
    </section>
  )
}