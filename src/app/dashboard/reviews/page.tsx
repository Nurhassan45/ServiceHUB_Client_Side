
"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../lib/axios";

interface Booking {
    id: string;
    status: string;
    scheduled_at: string;
    technician_id: string | null;
    service_name?: string;
    service?: { name?: string };
}

interface Review {
    id: string;
    booking_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    service_name: string;
    scheduled_at: string;
}

const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";
const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";

const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

const rise = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" as const },
    },
};

const field =
    "w-full rounded-xl border border-[#1F3F46] bg-[#0D2227] px-4 py-3 text-white outline-none transition [color-scheme:dark] placeholder:text-slate-500 focus:border-[#3DDBC0] focus:ring-4 focus:ring-[#3DDBC0]/15";

function Shell({ children }: { children: ReactNode }) {
    return (
        <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
            <main className="mx-auto max-w-7xl px-6 py-14">{children}</main>
        </div>
    );
}

function Stars({ rating }: { rating: number }) {
    return (
        <div
            className="flex items-center gap-1 text-lg"
            aria-label={`${rating} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={
                        star <= rating ? "text-[#3DDBC0]" : "text-slate-600"
                    }
                >
                    ★
                </span>
            ))}
        </div>
    );
}

export default function CustomerReviewsPage() {
    const reduce = useReducedMotion();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [selectedBooking, setSelectedBooking] = useState("");
    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");

    const [editRating, setEditRating] = useState("5");
    const [editComment, setEditComment] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchData = async () => {
        try {
            setError("");

            const [bookingResponse, reviewResponse] = await Promise.all([
                axiosInstance.get("/bookings/my-bookings"),
                axiosInstance.get("/reviews/my-reviews"),
            ]);

            if (bookingResponse.data.success) {
                setBookings(bookingResponse.data.data);
            }

            if (reviewResponse.data.success) {
                setReviews(reviewResponse.data.data);
            }
        } catch (err: unknown) {
            const apiError = err as {
                response?: { data?: { message?: string } };
            };
            setError(
                apiError.response?.data?.message ||
                    "Failed to load your reviews."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 4000);
        return () => clearTimeout(timer);
    }, [success]);

    const reviewedBookingIds = new Set(
        reviews.map((review) => review.booking_id)
    );

    const eligibleBookings = bookings.filter(
        (booking) =>
            booking.status.toLowerCase() === "completed" &&
            booking.technician_id !== null &&
            !reviewedBookingIds.has(booking.id)
    );

    const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedBooking) {
            setError("Please select a completed booking.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const response = await axiosInstance.post("/reviews", {
                booking_id: selectedBooking,
                rating: Number(rating),
                comment,
            });

            if (response.data.success) {
                setSuccess("Your review has been submitted successfully.");
                setSelectedBooking("");
                setRating("5");
                setComment("");
                await fetchData();
            }
        } catch (err: unknown) {
            const apiError = err as {
                response?: { data?: { message?: string } };
            };
            setError(
                apiError.response?.data?.message ||
                    "Failed to submit your review."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const startEditing = (review: Review) => {
        setEditingId(review.id);
        setEditRating(String(review.rating));
        setEditComment(review.comment || "");
        setError("");
        setSuccess("");
    };

    const handleUpdateReview = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const response = await axiosInstance.patch(
                `/reviews/${editingId}`,
                {
                    rating: Number(editRating),
                    comment: editComment,
                }
            );

            if (response.data.success) {
                setSuccess("Your review has been updated.");
                setEditingId(null);
                await fetchData();
            }
        } catch (err: unknown) {
            const apiError = err as {
                response?: { data?: { message?: string } };
            };
            setError(
                apiError.response?.data?.message ||
                    "Failed to update your review."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            const response = await axiosInstance.delete(
                `/reviews/${reviewId}`
            );

            if (response.data.success) {
                setReviews((previous) =>
                    previous.filter((review) => review.id !== reviewId)
                );
                setSuccess("Your review has been deleted.");
                if (editingId === reviewId) setEditingId(null);
            }
        } catch (err: unknown) {
            const apiError = err as {
                response?: { data?: { message?: string } };
            };
            setError(
                apiError.response?.data?.message ||
                    "Failed to delete your review."
            );
        }
    };

    const averageRating =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, review) => sum + review.rating, 0) /
                  reviews.length
              ).toFixed(1)
            : "0.0";

    if (loading) {
        return (
            <Shell>
                <div
                    role="status"
                    aria-label="Loading reviews"
                    className="animate-pulse motion-reduce:animate-none"
                >
                    <div className="mb-10 h-28 rounded-2xl bg-[#0A2228]" />
                    <div className="mb-10 grid gap-4 sm:grid-cols-3">
                        {[0, 1, 2].map((item) => (
                            <div
                                key={item}
                                className="h-28 rounded-2xl bg-[#0A2228]"
                            />
                        ))}
                    </div>
                    <div className="h-64 rounded-2xl bg-[#0A2228]" />
                </div>
            </Shell>
        );
    }

    return (
        <Shell>
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
            >
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#3DDBC0]">
                    Your experience matters
                </p>
                <h1
                    className={`${display} text-4xl font-bold text-white sm:text-5xl`}
                >
                    My reviews<span className="text-[#3DDBC0]">.</span>
                </h1>
                <p className="mt-3 max-w-2xl text-lg text-slate-400">
                    Share your experience, rate completed services, and manage
                    your feedback.
                </p>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        key="error"
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        key="success"
                        role="status"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden rounded-xl border border-[#3DDBC0]/30 bg-[#3DDBC0]/10 px-4 py-3 text-sm text-[#3DDBC0]"
                    >
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                variants={list}
                initial={reduce ? "show" : "hidden"}
                animate="show"
                className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
                {[
                    {
                        label: "Reviews submitted",
                        value: reviews.length,
                        color: "text-white",
                    },
                    {
                        label: "Average rating",
                        value: averageRating,
                        color: "text-[#3DDBC0]",
                    },
                    {
                        label: "Available to review",
                        value: eligibleBookings.length,
                        color: "text-amber-300",
                    },
                ].map((stat) => (
                    <motion.div
                        key={stat.label}
                        variants={rise}
                        className="rounded-2xl border border-white/10 bg-[#0A2228] p-6"
                    >
                        <p className="text-sm text-slate-400">{stat.label}</p>
                        <p
                            className={`${display} mt-2 text-4xl font-bold ${stat.color}`}
                        >
                            {stat.value}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* New review form */}
            <motion.section
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 rounded-2xl border border-white/10 bg-[#0A2228] p-6 shadow-xl shadow-black/20 sm:p-8"
            >
                <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-widest text-[#3DDBC0]">
                        Leave feedback
                    </p>
                    <h2
                        className={`${display} mt-2 text-2xl font-bold text-white`}
                    >
                        Write a review
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        You can review a completed booking with an assigned
                        technician.
                    </p>
                </div>

                {eligibleBookings.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-[#061418] p-5 text-sm text-slate-400">
                        No completed bookings are currently available for
                        review.
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-5">
                        <div>
                            <label
                                htmlFor="booking"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Select completed booking
                            </label>
                            <select
                                id="booking"
                                required
                                value={selectedBooking}
                                onChange={(e) =>
                                    setSelectedBooking(e.target.value)
                                }
                                className={`${field} sm:max-w-xl`}
                            >
                                <option value="">Choose a booking</option>
                                {eligibleBookings.map((booking) => (
                                    <option
                                        key={booking.id}
                                        value={booking.id}
                                    >
                                        {booking.service_name ||
                                            booking.service?.name ||
                                            "Service"}{" "}
                                        —{" "}
                                        {new Date(
                                            booking.scheduled_at
                                        ).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="rating"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Your rating
                            </label>
                            <select
                                id="rating"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className={`${field} sm:max-w-xl`}
                            >
                                <option value="5">5 — Excellent</option>
                                <option value="4">4 — Very good</option>
                                <option value="3">3 — Good</option>
                                <option value="2">2 — Fair</option>
                                <option value="1">1 — Poor</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="comment"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Your feedback{" "}
                                <span className="text-slate-500">
                                    (optional)
                                </span>
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={1000}
                                rows={4}
                                placeholder="Tell us about your experience..."
                                className={field}
                            />
                            <p className="mt-2 text-right text-xs text-slate-500">
                                {comment.length}/1000
                            </p>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={submitting || !selectedBooking}
                            whileHover={
                                reduce || submitting ? undefined : { y: -2 }
                            }
                            whileTap={
                                reduce || submitting ? undefined : { scale: 0.98 }
                            }
                            className={`rounded-xl bg-[#3DDBC0] px-7 py-3 font-semibold text-[#04181C] transition hover:bg-[#6AEAD3] disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}
                        >
                            {submitting ? "Submitting..." : "Submit review"}
                        </motion.button>
                    </form>
                )}
            </motion.section>

            {/* Existing reviews */}
            <section>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#3DDBC0]">
                            Your feedback history
                        </p>
                        <h2
                            className={`${display} mt-2 text-2xl font-bold text-white sm:text-3xl`}
                        >
                            Submitted reviews
                        </h2>
                    </div>
                    <span className="rounded-full border border-white/10 bg-[#0A2228] px-4 py-2 text-sm text-slate-300">
                        {reviews.length} total
                    </span>
                </div>

                {reviews.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-[#0A2228] p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3DDBC0]/10 text-2xl text-[#3DDBC0]">
                            ★
                        </div>
                        <h3
                            className={`${display} text-xl font-bold text-white`}
                        >
                            No reviews yet
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Your submitted reviews will appear here.
                        </p>
                    </div>
                ) : (
                    <motion.div
                        variants={list}
                        initial={reduce ? "show" : "hidden"}
                        animate="show"
                        className="space-y-5"
                    >
                        {reviews.map((review) => (
                            <motion.article
                                key={review.id}
                                variants={rise}
                                className="rounded-2xl border border-white/10 bg-[#0A2228] p-6 shadow-xl shadow-black/20"
                            >
                                {editingId === review.id ? (
                                    <form
                                        onSubmit={handleUpdateReview}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-widest text-[#3DDBC0]">
                                                Update feedback
                                            </p>
                                            <h3
                                                className={`${display} mt-2 text-xl font-bold text-white`}
                                            >
                                                Edit your review
                                            </h3>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                                Rating
                                            </label>
                                            <select
                                                value={editRating}
                                                onChange={(e) =>
                                                    setEditRating(e.target.value)
                                                }
                                                className={`${field} sm:max-w-xl`}
                                            >
                                                <option value="5">
                                                    5 — Excellent
                                                </option>
                                                <option value="4">
                                                    4 — Very good
                                                </option>
                                                <option value="3">
                                                    3 — Good
                                                </option>
                                                <option value="2">
                                                    2 — Fair
                                                </option>
                                                <option value="1">
                                                    1 — Poor
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                                Comment
                                            </label>
                                            <textarea
                                                value={editComment}
                                                onChange={(e) =>
                                                    setEditComment(e.target.value)
                                                }
                                                maxLength={1000}
                                                rows={4}
                                                className={field}
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className={`rounded-xl bg-[#3DDBC0] px-6 py-3 font-semibold text-[#04181C] hover:bg-[#6AEAD3] disabled:opacity-50 ${focus}`}
                                            >
                                                {submitting
                                                    ? "Saving..."
                                                    : "Save changes"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingId(null)
                                                }
                                                className={`rounded-xl border border-white/10 px-6 py-3 font-medium text-slate-300 transition hover:bg-white/5 ${focus}`}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <h3
                                                    className={`${display} text-xl font-bold text-white`}
                                                >
                                                    {review.service_name}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Booking date:{" "}
                                                    {new Date(
                                                        review.scheduled_at
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-[#3DDBC0]/20 bg-[#3DDBC0]/10 px-4 py-2">
                                                <p className="text-xs text-slate-400">
                                                    Your rating
                                                </p>
                                                <p className="mt-1 font-bold text-[#3DDBC0]">
                                                    {review.rating}/5
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Stars rating={review.rating} />
                                        </div>

                                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                            {review.comment ||
                                                "No written comment provided."}
                                        </p>

                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                                            <p className="text-xs text-slate-500">
                                                Submitted{" "}
                                                {new Date(
                                                    review.created_at
                                                ).toLocaleDateString()}
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startEditing(review)
                                                    }
                                                    className={`rounded-lg border border-[#3DDBC0]/30 px-4 py-2 text-sm font-semibold text-[#3DDBC0] transition hover:bg-[#3DDBC0]/10 ${focus}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteReview(
                                                            review.id
                                                        )
                                                    }
                                                    className={`rounded-lg border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 ${focus}`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.article>
                        ))}
                    </motion.div>
                )}
            </section>
        </Shell>
    );
}
