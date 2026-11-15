
"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../lib/axios";
// import axiosInstance from "../../lib/axios";

interface Technician {
    id: string;
    name: string;
    experience: string;
    address: string;
    bio: string;
    is_available: boolean;
}

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    customer_name: string;
    service_name?: string;
}

interface RatingSummary {
    average_rating: string | number;
    total_reviews: number;
}

interface TechnicianFeedback {
    summary: RatingSummary;
    reviews: Review[];
}

type AvailabilityFilter = "all" | "available" | "unavailable";

const display =
    "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";

const body =
    "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";

const grid = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
};

const rise = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" as const },
    },
};

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={
                        star <= Math.round(rating)
                            ? "text-yellow-400"
                            : "text-slate-600"
                    }
                >
                    ★
                </span>
            ))}
        </div>
    );
}

export default function TechniciansPage() {
    const reduce = useReducedMotion();

    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [feedback, setFeedback] = useState<
        Record<string, TechnicianFeedback>
    >({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<AvailabilityFilter>("all");

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get("/technicians");

                const technicianList: Technician[] =
                    response.data.data || [];

                setTechnicians(technicianList);

                // Fetch each technician's public reviews.
                const results = await Promise.all(
                    technicianList.map(async (technician) => {
                        try {
                            const reviewResponse =
                                await axiosInstance.get(
                                    `/reviews/technician/${technician.id}`
                                );

                            return {
                                id: technician.id,
                                feedback: {
                                    summary:
                                        reviewResponse.data.summary || {
                                            average_rating: 0,
                                            total_reviews: 0,
                                        },
                                    reviews:
                                        reviewResponse.data.data || [],
                                },
                            };
                        } catch {
                            return {
                                id: technician.id,
                                feedback: {
                                    summary: {
                                        average_rating: 0,
                                        total_reviews: 0,
                                    },
                                    reviews: [],
                                },
                            };
                        }
                    })
                );

                const feedbackMap: Record<
                    string,
                    TechnicianFeedback
                > = {};

                results.forEach((result) => {
                    feedbackMap[result.id] = result.feedback;
                });

                setFeedback(feedbackMap);
            } catch {
                setError(
                    "Unable to load technicians. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTechnicians();
    }, []);

    const filteredTechnicians = useMemo(() => {
        return technicians.filter((technician) => {
            const matchesSearch = [
                technician.name,
                technician.address,
                technician.bio,
            ]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesAvailability =
                filter === "all" ||
                (filter === "available" && technician.is_available) ||
                (filter === "unavailable" && !technician.is_available);

            return matchesSearch && matchesAvailability;
        });
    }, [technicians, search, filter]);

    return (
        <div
            className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}
        >
            <main className="mx-auto max-w-7xl px-6 py-14">

                {/* Header */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 max-w-2xl"
                >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3DDBC0]">
                        Our professionals
                    </p>

                    <h1
                        className={`${display} mt-3 text-4xl font-bold text-white sm:text-5xl`}
                    >
                        Find your technician
                    </h1>

                    <p className="mt-4 text-lg text-slate-400">
                        Explore verified professionals, compare their
                        experience and ratings, and find the right person
                        for your service needs.
                    </p>
                </motion.div>

                {/* Statistics */}
                {!loading && !error && (
                    <div className="mb-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-5">
                            <p className="text-sm text-slate-500">
                                Verified technicians
                            </p>
                            <p className={`${display} mt-2 text-3xl font-bold text-[#3DDBC0]`}>
                                {technicians.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-5">
                            <p className="text-sm text-slate-500">
                                Currently available
                            </p>
                            <p className={`${display} mt-2 text-3xl font-bold text-white`}>
                                {technicians.filter(
                                    (tech) => tech.is_available
                                ).length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Search and filters */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, address or skill..."
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0A2228] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#3DDBC0]/60"
                    />

                    <select
                        value={filter}
                        onChange={(e) =>
                            setFilter(e.target.value as AvailabilityFilter)
                        }
                        className="rounded-xl border border-white/10 bg-[#0A2228] px-4 py-3 text-sm text-white outline-none focus:border-[#3DDBC0]/60"
                    >
                        <option value="all">All technicians</option>
                        <option value="available">Available only</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                </div>

                {/* Loading */}
                {loading && (
                    <div
                        role="status"
                        aria-label="Loading technicians"
                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-80 animate-pulse rounded-2xl border border-white/10 bg-[#0A2228] motion-reduce:animate-none"
                            />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center"
                    >
                        <p className="text-red-300">{error}</p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-xl border border-white/15 px-5 py-2 text-sm text-white hover:bg-white/10"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    !error &&
                    filteredTechnicians.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-[#0A2228]/60 px-6 py-16 text-center">
                            <h2 className={`${display} text-xl font-bold text-white`}>
                                No technicians found
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Try another search or availability filter.
                            </p>
                        </div>
                    )}

                {/* Technician cards */}
                {!loading &&
                    !error &&
                    filteredTechnicians.length > 0 && (
                        <motion.div
                            variants={grid}
                            initial={reduce ? "show" : "hidden"}
                            animate="show"
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredTechnicians.map((technician) => {
                                const technicianFeedback =
                                    feedback[technician.id];

                                const averageRating = Number(
                                    technicianFeedback?.summary.average_rating || 0
                                );

                                const totalReviews = Number(
                                    technicianFeedback?.summary.total_reviews || 0
                                );

                                return (
                                    <motion.article
                                        key={technician.id}
                                        variants={rise}
                                        whileHover={
                                            reduce ? undefined : { y: -5 }
                                        }
                                        className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A2228] shadow-xl shadow-black/20 transition-colors hover:border-[#3DDBC0]/40"
                                    >
                                        {/* Card header */}
                                        <div className="border-b border-white/10 bg-[#102E35] p-6">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3DDBC0]/10 text-2xl font-bold text-[#3DDBC0]">
                                                    {technician.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        technician.is_available
                                                            ? "bg-emerald-500/10 text-emerald-300"
                                                            : "bg-white/10 text-slate-400"
                                                    }`}
                                                >
                                                    {technician.is_available
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </span>
                                            </div>

                                            <h2 className={`${display} mt-5 text-xl font-bold text-white`}>
                                                {technician.name}
                                            </h2>

                                            <p className="mt-1 text-xs font-medium text-[#3DDBC0]">
                                                <span className="mr-1">✓</span>
                                                Verified technician
                                            </p>
                                        </div>

                                        {/* Card body */}
                                        <div className="flex flex-1 flex-col p-6">
                                            {/* Rating */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Stars rating={averageRating} />

                                                {totalReviews > 0 ? (
                                                    <>
                                                        <span className="font-semibold text-white">
                                                            {averageRating.toFixed(1)}
                                                        </span>

                                                        <span className="text-xs text-slate-500">
                                                            ({totalReviews} reviews)
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-500">
                                                        No reviews yet
                                                    </span>
                                                )}
                                            </div>

                                            {/* Experience */}
                                            <div className="mt-5">
                                                <p className="text-xs text-slate-500">
                                                    Experience
                                                </p>

                                                <p className="mt-1 font-semibold text-white">
                                                    {technician.experience} years
                                                </p>
                                            </div>

                                            {/* Address */}
                                            <div className="mt-4">
                                                <p className="text-xs text-slate-500">
                                                    Location
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-slate-300">
                                                    {technician.address}
                                                </p>
                                            </div>

                                            {/* Bio */}
                                            <div className="mt-4">
                                                <p className="text-xs text-slate-500">
                                                    About
                                                </p>

                                                <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-400">
                                                    {technician.bio}
                                                </p>
                                            </div>

                                            {/* Latest reviews */}
                                            {totalReviews > 0 && (
                                                <div className="mt-5 border-t border-white/10 pt-4">
                                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                        Recent feedback
                                                    </p>

                                                    {technicianFeedback.reviews
                                                        .slice(0, 2)
                                                        .map((review) => (
                                                            <div
                                                                key={review.id}
                                                                className="mb-3 last:mb-0"
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-xs font-medium text-white">
                                                                        {review.customer_name}
                                                                    </p>

                                                                    <span className="text-xs text-yellow-400">
                                                                        ★ {review.rating}/5
                                                                    </span>
                                                                </div>

                                                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                                                                    {review.comment ||
                                                                        "No written comment."}
                                                                </p>
                                                            </div>
                                                        ))}

                                                </div>
                                            )}
                                                                                                    <Link
    href={`/technicians/${technician.id}`}
    className="mt-6 block rounded-xl bg-[#3DDBC0] px-5 py-3 text-center text-sm font-bold text-[#04181C] transition hover:bg-[#6AEAD3]"
>
    View Full Profile →
</Link>
                                        </div>
                                    </motion.article>
                                );
                            })}
                            
                        </motion.div>
                    )}
                    
            </main>
        </div>
    );
}
