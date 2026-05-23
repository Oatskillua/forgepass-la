import Badge from './Badge'

const statusTones = {
  'Priority Zone': 'cyan',
  'High Demand': 'blue',
  'Tourist Core': 'purple',
  Planned: 'white',
  'Core System': 'green',
  Priority: 'yellow',
  Online: 'green',
  Building: 'yellow',
}

export default function StatusBadge({ status }) {
  return (
    <Badge tone={statusTones[status] || 'white'} className="mb-5">
      {status}
    </Badge>
  )
}