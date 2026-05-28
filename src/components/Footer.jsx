import { Link } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'
import { analyticsEvents } from '../config/analyticsEvents'
import { appVersion } from '../config/appVersion'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 pt-10">
      <div className="flex flex-col items-center justify-between gap-6 text-sm text-white/40 md:flex-row">
        <p>
          ForgePass LA — Navigate the City. Unlock the Experience.
        </p>

        <div className="mt-6 border-t border-white/10 pt-6 text-center text-xs text-white/25">
          ForgePass LA v{appVersion.version} · {appVersion.stage} · {appVersion.build}
        </div>

        <div className="flex items-center gap-5">
          <Link
            to="/privacy"
             onClick={() =>
  	      trackEvent(analyticsEvents.FOOTER_LINK_CLICKED, {
   	       route: '/privacy',
  	       label: 'Privacy',
 	     })
	    }
            className="transition hover:text-cyan-300"
          >
            Privacy
          </Link>

          <Link
            to="/terms"
             onClick={() =>
  	      trackEvent(analyticsEvents.FOOTER_LINK_CLICKED, {
   	       route: '/terms',
  	       label: 'Terms',
 	     })
	    }

            className="transition hover:text-cyan-300"
          >
            Terms
          </Link>

          <Link
            to="/status"
             onClick={() =>
  	      trackEvent(analyticsEvents.FOOTER_LINK_CLICKED, {
   	       route: '/status',
  	       label: 'Status',
 	     })
	    }

            className="transition hover:text-cyan-300"
          >
            Status
          </Link>

          <Link
            to="/Contact"
             onClick={() =>
  	      trackEvent(analyticsEvents.FOOTER_LINK_CLICKED, {
   	       route: '/contact',
  	       label: 'Contact',
 	     })
	    }

            className="transition hover:text-cyan-300"
          >
            Contact
          </Link>

          <Link
            to="/security"
             onClick={() =>
  	      trackEvent(analyticsEvents.FOOTER_LINK_CLICKED, {
   	       route: '/security',
  	       label: 'Security',
 	     })
	    }

            className="transition hover:text-cyan-300"
          >
            Security
          </Link>
        </div>
      </div>
    </footer>
  )
}