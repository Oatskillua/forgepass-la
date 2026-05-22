import { Shield, Users, Zap } from 'lucide-react'

export default function TrustStrip() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center gap-5 text-white/40 sm:mt-24 sm:flex-row sm:flex-wrap sm:gap-10">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Early Community
      </div>

      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Secure Access
      </div>

      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5" />
        LA 2028 Ready
      </div>
    </div>
  )
}