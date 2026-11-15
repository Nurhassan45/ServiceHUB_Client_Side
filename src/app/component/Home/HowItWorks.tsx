
"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Choose a Service",
    description:
      "Explore our services and select the one that matches your home needs.",
    icon: "🔍",
  },
  {
    number: "02",
    title: "Book a Technician",
    description:
      "Select an available technician and schedule a convenient appointment.",
    icon: "📅",
  },
  {
    number: "03",
    title: "Get Your Service",
    description:
      "Our professional technician completes your work with care and quality.",
    icon: "🏠",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#081b20] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#3DDBC0]">
            Simple Process
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            How ServiceHub Works
          </h2>

          <p className="mt-4 leading-7 text-slate-400">
            Getting professional home services has never been easier.
            Follow three simple steps to get started.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative rounded-2xl border border-white/10 bg-[#0A2228] p-8 text-center transition hover:border-[#3DDBC0]/50"
            >
              <span className="absolute right-6 top-5 text-3xl font-bold text-white/10">
                {step.number}
              </span>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3DDBC0]/10 text-3xl">
                {step.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
