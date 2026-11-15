
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../lib/axios";

interface Service {
    id: number;
    name: string;
    description: string;
    base_price: number;
    image_url: string | null;
    is_active: boolean;
}

interface ServiceRating {
    average_rating: string | number;
    total_reviews: number;
}

const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";

const grid = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

const rise = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" as const },
    },
};

export default function ServicesPage() {
    const reduce = useReducedMotion();

    const [services, setServices] = useState<Service[]>([]);
    const [ratings, setRatings] = useState<Record<number, ServiceRating>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axiosInstance.get("/services");
                const serviceList: Service[] = response.data.data;

                setServices(serviceList);

                // Fetch ratings for all services independently.
                const ratingResults = await Promise.all(
                    serviceList.map(async (service) => {
                        try {
                            const ratingResponse = await axiosInstance.get(
                                `/reviews/service/${service.id}`
                            );

                            return {
                                id: service.id,
                                rating: ratingResponse.data.summary,
                            };
                        } catch {
                            return {
                                id: service.id,
                                rating: null,
                            };
                        }
                    })
                );

                const ratingMap: Record<number, ServiceRating> = {};

                ratingResults.forEach((result) => {
                    if (result.rating) {
                        ratingMap[result.id] = result.rating;
                    }
                });

                setRatings(ratingMap);
            } catch {
                setError("Failed to load services. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    return (
        <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
            <main className="mx-auto max-w-7xl px-6 py-14">
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-12 max-w-2xl"
                >
                    <h1 className={`${display} text-4xl font-bold text-white sm:text-5xl`}>
                        Our services
                    </h1>

                    <p className="mt-3 text-lg text-slate-400">
                        Find trusted professionals for your home service needs.
                    </p>
                </motion.div>

                {/* Loading */}
                {loading && (
                    <div
                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        role="status"
                        aria-label="Loading services"
                    >
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#0A2228] motion-reduce:animate-none"
                            >
                                <div className="h-52 bg-[#102E35]" />

                                <div className="space-y-3 p-5">
                                    <div className="h-5 w-2/3 rounded bg-[#102E35]" />
                                    <div className="h-3 w-full rounded bg-[#102E35]" />
                                    <div className="h-3 w-4/5 rounded bg-[#102E35]" />
                                    <div className="h-8 w-1/3 rounded bg-[#102E35]" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div
                        role="alert"
                        className="mx-auto max-w-md rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center"
                    >
                        <p className="text-red-300">{error}</p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && services.length === 0 && (
                    <p className="py-20 text-center text-slate-400">
                        No services are available right now. Check back soon.
                    </p>
                )}

                {/* Services */}
                {!loading && !error && services.length > 0 && (
                    <motion.ul
                        variants={grid}
                        initial={reduce ? "show" : "hidden"}
                        animate="show"
                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {services.map((service) => {
                            const rating = ratings[service.id];

                            return (
                                <motion.li
                                    key={service.id}
                                    variants={rise}
                                    whileHover={reduce ? undefined : { y: -6 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 22,
                                    }}
                                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A2228] shadow-xl shadow-black/30 transition-colors focus-within:border-[#3DDBC0]/60 hover:border-[#3DDBC0]/40"
                                >
                                    <div className="h-52 overflow-hidden bg-[#102E35]">
                                        {service.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={service.image_url}
                                                alt=""
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                                            />
                                        ) : (
                                            <div
                                                aria-hidden
                                                className={`${display} flex h-full items-center justify-center text-7xl font-bold text-[#3DDBC0]/30`}
                                            >
                                                {service.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <h2 className={`${display} text-xl font-bold text-white`}>
                                            <Link
                                                href={`/services/${service.id}`}
                                                className="outline-none after:absolute after:inset-0 after:content-['']"
                                            >
                                                {service.name}
                                            </Link>
                                        </h2>

                                        {/* Rating */}
                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                            {rating && Number(rating.total_reviews) > 0 ? (
                                                <>
                                                    <span className="text-yellow-400">
                                                        ★
                                                    </span>

                                                    <span className="font-semibold text-white">
                                                        {Number(rating.average_rating).toFixed(1)}
                                                    </span>

                                                    <span className="text-slate-500">
                                                        ({rating.total_reviews} reviews)
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-slate-500">
                                                    No reviews yet
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-400">
                                            {service.description}
                                        </p>

                                        <div className="mt-5 flex items-end justify-between">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Starting at
                                                </p>

                                                <p className="text-xl font-bold text-[#3DDBC0]">
                                                    ৳{Number(service.base_price).toLocaleString("en-BD")}
                                                </p>
                                            </div>

                                            <span className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-[#3DDBC0] group-hover:text-[#04181C]">
                                                View details
                                            </span>
                                        </div>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </motion.ul>
                )}
            </main>
        </div>
    );
}
