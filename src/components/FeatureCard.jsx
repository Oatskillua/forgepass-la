export default function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
      <Icon className="w-8 h-8 mb-4" />

      <h3 className="text-xl font-bold mb-2">
        {title}
      </h3>

      <p className="text-white/60">
        {text}
      </p>
    </div>
  )
}