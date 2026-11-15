
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#061418] px-6 pt-16">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" className="text-3xl font-bold text-white">
              Service<span className="text-[#3DDBC0]">Hub.</span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
              Your trusted platform for professional home services.
              Find skilled technicians and get your home maintenance
              needs completed with confidence.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-[#3DDBC0] hover:text-[#3DDBC0]"
              >
                f
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-[#3DDBC0] hover:text-[#3DDBC0]"
              >
                ig
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-[#3DDBC0] hover:text-[#3DDBC0]"
              >
                in
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-bold text-white">
              Quick Links
            </h3>

            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link href="/" className="transition hover:text-[#3DDBC0]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-[#3DDBC0]">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/technicians" className="transition hover:text-[#3DDBC0]">
                  Find Technicians
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-[#3DDBC0]">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="mb-6 text-lg font-bold text-white">
              For Users
            </h3>

            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link href="/register" className="transition hover:text-[#3DDBC0]">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-[#3DDBC0]">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-[#3DDBC0]">
                  Become a Technician
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-[#3DDBC0]">
                  Book a Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-bold text-white">
              Contact Us
            </h3>

            <ul className="space-y-5 text-sm text-slate-400">
              <li>
                <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                  Email
                </p>
                <a
                  href="mailto:support@servicehub.com"
                  className="transition hover:text-[#3DDBC0]"
                >
                  support@servicehub.com
                </a>
              </li>

              <li>
                <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                  Phone
                </p>
                <a
                  href="tel:+8801700000000"
                  className="transition hover:text-[#3DDBC0]"
                >
                  +880 1700-000000
                </a>
              </li>

              <li>
                <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                  Location
                </p>
                <p>Chattogram, Bangladesh</p>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-slate-500">
            © 2026 ServiceHub. All rights reserved.
          </p>

          <p className="text-sm text-slate-500">
            Made with <span className="text-[#3DDBC0]">♥</span> for better home care.
          </p>
        </div>

      </div>
    </footer>
  );
}
