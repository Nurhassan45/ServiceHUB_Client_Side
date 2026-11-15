
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axiosInstance from "../../../lib/axios";
// import axiosInstance from "../../lib/axios";

interface Technician {
  id: string;
  name: string;
  experience?: string;
  address?: string;
  bio?: string;
  is_available: boolean;
}

export default function FeaturedTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await axiosInstance.get("/technicians");

        const list = response.data?.data;

        if (!Array.isArray(list)) {
          setTechnicians([]);
          return;
        }

        // Backend already returns verified technicians.
        // Only filter by availability here.
        const featured = list.filter(
          (technician: Technician) => technician.is_available === true
        );

        setTechnicians(featured.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch technicians:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  return (
    <section className="bg-[#061418] px-6 py-20">
      <div className="mx-auto max-w-7xl">

        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#3DDBC0]">
              Meet Our Professionals
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              Featured Technicians
            </h2>

            <p className="mt-3 text-slate-400">
              Connect with trusted professionals for your home.
            </p>
          </div>

          <Link
            href="/technicians"
            className="font-semibold text-[#3DDBC0] hover:underline"
          >
            View All Technicians →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl bg-[#0A2228]"
              />
            ))}
          </div>
        ) : technicians.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-[#0A2228] p-8 text-center text-slate-400">
            No available technicians at the moment.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {technicians.map((technician, index) => (
              <motion.div
                key={technician.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-[#0A2228] p-6 transition hover:-translate-y-1 hover:border-[#3DDBC0]/50"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#3DDBC0]/40 bg-[#102f35] text-2xl font-bold text-[#3DDBC0]">
                  {technician.name.charAt(0).toUpperCase()}
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  {technician.name}
                </h3>

                <p className="mt-2 text-sm text-[#3DDBC0]">
                  {technician.experience
                    ? `${technician.experience} Years Experience`
                    : "Professional Technician"}
                </p>

                <p className="mt-3 line-clamp-2 min-h-10 text-sm text-slate-400">
                  {technician.bio ||
                    technician.address ||
                    "Verified home service professional."}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-[#3DDBC0]/10 px-3 py-1 text-xs text-[#3DDBC0]">
                    ✓ Verified
                  </span>

                  <Link
                    href={`/technicians/${technician.id}`}
                    className="text-sm font-semibold text-white hover:text-[#3DDBC0]"
                  >
                    View Profile →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
