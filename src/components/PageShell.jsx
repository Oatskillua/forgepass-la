import AppLayout from '../layouts/AppLayout'
import SectionHeader from './SectionHeader'

export default function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
}) {
  return (
    <AppLayout>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
      />

      {children}
    </AppLayout>
  )
}