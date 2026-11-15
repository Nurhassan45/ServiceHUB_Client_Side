
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axiosInstance from "../../../lib/axios";
// import axiosInstance from "../../lib/axios";

interface Service {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
}

export default function PopularServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/services");
        const result = response.data?.data;
        const serviceList = Array.isArray(result)
          ? result
          : result?.services ?? [];

        setServices(serviceList.slice(0, 6));
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="bg-[#081b20] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#3DDBC0]">
              What We Offer
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              Popular Services
            </h2>
            <p className="mt-3 text-slate-400">
              Professional solutions for your everyday needs.
            </p>
          </div>

          <Link
            href="/services"
            className="font-semibold text-[#3DDBC0] hover:underline"
          >
            View All Services →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl bg-[#0A2228]"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-slate-400">No services available right now.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A2228] transition hover:-translate-y-1 hover:border-[#3DDBC0]/50"
              >
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-[#102f35] text-[#3DDBC0]">
                    ServiceHub
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white">
                    {service.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {service.description || "Professional home service."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="font-bold text-[#3DDBC0]">
                      From ৳{Number(service.base_price).toLocaleString()}
                    </p>

                    <Link
                      href={`/services/${service.id}`}
                      className="text-sm font-semibold text-white hover:text-[#3DDBC0]"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
