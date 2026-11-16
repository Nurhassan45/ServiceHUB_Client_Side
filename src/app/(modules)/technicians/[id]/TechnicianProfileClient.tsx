
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../../lib/axios";
import Link from "next/link";
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

interface Summary {
    average_rating: string | number;
    total_reviews: number;
}

const display =
    "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";

const body =
    "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
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

export default function TechnicianProfilePage() {
    const params = useParams();
    const router = useRouter();
    const reduce = useReducedMotion();

    const id = params.id as string;

    const [technician, setTechnician] = useState<Technician | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<Summary>({
        average_rating: 0,
        total_reviews: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                // Get verified technicians and find the selected profile.
                const technicianResponse = await axiosInstance.get(
                    "/technicians"
                );

                const technicianList: Technician[] =
                    technicianResponse.data.data || [];

                const selectedTechnician = technicianList.find(
                    (item) => item.id === id
                );

                if (!selectedTechnician) {
                    throw new Error("Technician profile not found.");
                }

                if (cancelled) return;

                setTechnician(selectedTechnician);

                // Fetch technician reviews.
                const reviewResponse = await axiosInstance.get(
                    `/reviews/technician/${id}`
                );

                if (cancelled) return;

                setReviews(reviewResponse.data.data || []);

                setSummary(
                    reviewResponse.data.summary || {
                        average_rating: 0,
                        total_reviews: 0,
                    }
                );
            } catch (err: unknown) {
                if (cancelled) return;

                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Failed to load technician profile.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const formattedDate = (date: string) =>
        new Date(date).toLocaleDateString("en-BD", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    return (
        <div className={`${body} min-h-screen bg-[#061418]`}>
            <main className="mx-auto max-w-5xl px-6 py-14">

                {/* Back button */}
                <button
                    onClick={() => router.push("/technicians")}
                    className="mb-8 text-sm text-slate-400 transition hover:text-[#3DDBC0]"
                >
                    ← Back to technicians
                </button>

                {/* Loading */}
                {loading && (
                    <div
                        role="status"
                        aria-label="Loading technician profile"
                        className="animate-pulse space-y-5 motion-reduce:animate-none"
                    >
                        <div className="h-64 rounded-3xl bg-[#0A2228]" />
                        <div className="h-32 rounded-3xl bg-[#0A2228]" />
                        <div className="h-48 rounded-3xl bg-[#0A2228]" />
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
                            onClick={() => router.push("/technicians")}
                            className="mt-5 rounded-xl bg-[#3DDBC0] px-5 py-2.5 font-semibold text-[#04181C]"
                        >
                            Browse technicians
                        </button>
                    </div>
                )}

                {!loading && !error && technician && (
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Profile header */}
                        <section className="rounded-3xl border border-white/10 bg-[#0A2228] p-7 sm:p-10">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[#3DDBC0]/10 text-5xl font-bold text-[#3DDBC0]">
                                    {technician.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className={`${display} text-3xl font-bold text-white sm:text-4xl`}>
                                            {technician.name}
                                        </h1>

                                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                            ✓ Verified
                                        </span>
                                    </div>

                                    <p className="mt-3 text-sm text-slate-400">
                                        Professional Home Service Technician
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <Stars
                                            rating={Number(summary.average_rating)}
                                        />

                                        <span className="font-semibold text-white">
                                            {Number(summary.total_reviews) > 0
                                                ? Number(summary.average_rating).toFixed(1)
                                                : "New"}
                                        </span>

                                        <span className="text-sm text-slate-500">
                                            ({summary.total_reviews} reviews)
                                        </span>
                                    </div>
                                </div>

                                <span
                                    className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
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
                        </section>

                        {/* Profile information */}
                        <section className="mt-8 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-6">
                                <p className="text-sm text-slate-500">
                                    Experience
                                </p>
                                <p className={`${display} mt-2 text-2xl font-bold text-[#3DDBC0]`}>
                                    {technician.experience} years
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-6">
                                <p className="text-sm text-slate-500">
                                    Location
                                </p>
                                <p className="mt-2 leading-7 text-white">
                                    {technician.address}
                                </p>
                            </div>
                        </section>

                        {/* About */}
                        <section className="mt-8 rounded-2xl border border-white/10 bg-[#0A2228] p-7">
                            <h2 className={`${display} text-2xl font-bold text-white`}>
                                About this technician
                            </h2>

                            <p className="mt-4 leading-8 text-slate-400">
                                {technician.bio}
                            </p>
                        </section>
                        


                        {/* Reviews */}
                        <section className="mt-12">
                            <div className="mb-7">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3DDBC0]">
                                    Customer feedback
                                </p>

                                <h2 className={`${display} mt-2 text-3xl font-bold text-white`}>
                                    Reviews & Ratings
                                </h2>
                            </div>

                            {/* Rating summary */}
                            <div className="mb-6 flex flex-wrap items-center gap-6 rounded-2xl border border-white/10 bg-[#0A2228] p-6">
                                <div>
                                    <p className={`${display} text-4xl font-bold text-[#3DDBC0]`}>
                                        {Number(summary.average_rating).toFixed(1)}
                                        <span className="text-lg text-slate-500">
                                            /5
                                        </span>
                                    </p>
                                    <Stars rating={Number(summary.average_rating)} />
                                </div>

                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {summary.total_reviews}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Total customer reviews
                                    </p>
                                </div>
                            </div>

                            {/* Review list */}
                            {reviews.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/15 bg-[#0A2228]/60 px-6 py-14 text-center">
                                    <p className="text-3xl text-yellow-400">
                                        ★
                                    </p>

                                    <h3 className={`${display} mt-3 text-xl font-bold text-white`}>
                                        No reviews yet
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Customer feedback will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {reviews.map((review) => (
                                        <article
                                            key={review.id}
                                            className="rounded-2xl border border-white/10 bg-[#0A2228] p-6"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-white">
                                                        {review.customer_name}
                                                    </h3>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {formattedDate(review.created_at)}
                                                    </p>
                                                </div>

                                                <span className="rounded-lg bg-white/5 px-3 py-1 text-sm font-semibold text-yellow-400">
                                                    ★ {review.rating}/5
                                                </span>
                                            </div>

                                            <Stars rating={review.rating} />

                                            {review.service_name && (
                                                <p className="mt-3 text-xs text-[#3DDBC0]">
                                                    Service: {review.service_name}
                                                </p>
                                            )}

                                            <p className="mt-3 leading-7 text-slate-400">
                                                {review.comment ||
                                                    "No written comment provided."}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
