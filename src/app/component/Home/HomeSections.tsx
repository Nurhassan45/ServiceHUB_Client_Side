
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#061418] px-6 py-24 md:py-32">
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#3DDBC0]/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-5 inline-block rounded-full border border-[#3DDBC0]/30 px-4 py-2 text-sm text-[#3DDBC0]">
            Reliable Home Services, Made Simple
          </p>

          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Your Home Deserves
            <span className="text-[#3DDBC0]"> Expert Care.</span>
          </h1>

          <p className="mt-6 max-w-xl leading-8 text-slate-400">
            Find trusted professionals for your home maintenance and repair
            needs. Book services easily and get quality work from verified
            technicians.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/services"
              className="rounded-xl bg-[#3DDBC0] px-7 py-3.5 font-semibold text-[#061418] transition hover:bg-[#2bc5aa]"
            >
              Explore Services
            </Link>

            <Link
              href="/technicians"
              className="rounded-xl border border-white/20 px-7 py-3.5 font-semibold text-white transition hover:border-[#3DDBC0] hover:text-[#3DDBC0]"
            >
              Find Technicians
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="rounded-3xl border border-white/10 bg-[#0A2228] p-3 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000"
              alt="Professional home service technician"
              className="h-[350px] w-full rounded-2xl object-cover md:h-[430px]"
            />
          </div>

          <div className="absolute -bottom-6 -left-5 rounded-2xl border border-white/10 bg-[#0A2228] p-5 shadow-xl">
            <p className="text-sm text-slate-400">Your trusted partner</p>
            <p className="mt-1 text-xl font-bold text-[#3DDBC0]">
              Home Care Experts
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
