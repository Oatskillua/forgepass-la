export default function HomeGrid({
  children,
  columns = 'four',
  className = '',
}) {
  const columnStyles = {
    two: 'md:grid-cols-2',
    three: 'md:grid-cols-3',
    four: 'sm:grid-cols-2 xl:grid-cols-4',
    five: 'sm:grid-cols-2 xl:grid-cols-5',
  }

  return (
    <div
      className={`grid gap-5 ${
        columnStyles[columns] || columnStyles.four
      } ${className}`}
    >
      {children}
    </div>
  )
}