
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../lib/axios";

interface Booking {
    id: string;
    service_id: string;
    technician_id: string | null;
    scheduled_at: string;
    address: string;
    description: string | null;
    status: string;
    total_price: string | number;
    created_at: string;

    service?: {
        name: string;
    };

    technician?: {
        name: string;
    };
}

const display =
    "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";

const body =
    "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";

const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";

const list = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const rise = {
    hidden: {
        opacity: 0,
        y: 24,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: "easeOut" as const,
        },
    },
};

function Shell({ children }: { children: ReactNode }) {
    return (
        <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
            <main className="mx-auto max-w-7xl px-6 py-14">
                {children}
            </main>
        </div>
    );
}

function Notice({
    children,
    action,
}: {
    children: ReactNode;
    action?: ReactNode;
}) {
    return (
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0A2228] p-8 text-center text-slate-300">
            {children}
            {action}
        </div>
    );
}

export default function CustomerBookingsPage() {
    const { user, loading: authLoading } = useAuth();

    const router = useRouter();
    const reduce = useReducedMotion();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Fetch customer bookings
    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== "customer") {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchBookings = async () => {
            try {
                const response = await axiosInstance.get(
                    "/bookings/my-bookings"
                );

                if (isMounted) {
                    setBookings(response.data.data);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    const apiError = err as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    };

                    setError(
                        apiError.response?.data?.message ||
                        "Failed to load your bookings."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBookings();

        return () => {
            isMounted = false;
        };
    }, [user, authLoading]);

    // Cancel booking
    const handleCancelBooking = async (bookingId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) return;

        try {
            setCancellingId(bookingId);
            setError("");

            const response = await axiosInstance.patch(
                `/bookings/${bookingId}/cancel`
            );

            if (response.data.success) {
                setBookings((prevBookings) =>
                    prevBookings.map((booking) =>
                        booking.id === bookingId
                            ? {
                                ...booking,
                                status: "cancelled",
                            }
                            : booking
                    )
                );
            }
        } catch (err: unknown) {
            const apiError = err as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };

            setError(
                apiError.response?.data?.message ||
                "Failed to cancel booking. Please try again."
            );
        } finally {
            setCancellingId(null);
        }
    };

    // Booking status styles
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return {
                    badge: "bg-amber-400/10 text-amber-300",
                    dot: "bg-amber-400",
                };

            case "confirmed":
                return {
                    badge: "bg-sky-400/10 text-sky-300",
                    dot: "bg-sky-400",
                };

            case "accepted":
                return {
                    badge: "bg-sky-400/10 text-sky-300",
                    dot: "bg-sky-400",
                };

            case "in_progress":
                return {
                    badge: "bg-violet-400/10 text-violet-300",
                    dot: "bg-violet-400",
                };

            case "completed":
                return {
                    badge: "bg-emerald-400/10 text-emerald-300",
                    dot: "bg-emerald-400",
                };

            case "rejected":
            case "cancelled":
                return {
                    badge: "bg-red-400/10 text-red-300",
                    dot: "bg-red-400",
                };

            default:
                return {
                    badge: "bg-white/10 text-slate-300",
                    dot: "bg-slate-400",
                };
        }
    };

    // Loading state
    if (authLoading || loading) {
        return (
            <Shell>
                <div
                    role="status"
                    aria-label="Loading your bookings"
                    className="grid animate-pulse gap-6 motion-reduce:animate-none md:grid-cols-2"
                >
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-64 rounded-2xl border border-white/10 bg-[#0A2228]"
                        />
                    ))}
                </div>
            </Shell>
        );
    }

    // Login check
    if (!user) {
        return (
            <Shell>
                <Notice
                    action={
                        <button
                            onClick={() => router.push("/login")}
                            className={`mt-5 rounded-xl bg-[#3DDBC0] px-6 py-2.5 font-semibold text-[#04181C] hover:bg-[#6AEAD3] ${focus}`}
                        >
                            Log in
                        </button>
                    }
                >
                    <p>Log in to view your bookings.</p>
                </Notice>
            </Shell>
        );
    }

    // Customer role check
    if (user.role !== "customer") {
        return (
            <Shell>
                <Notice>
                    <p>Only customers can view this page.</p>
                </Notice>
            </Shell>
        );
    }

    return (
        <Shell>
            {/* Page heading */}
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut",
                }}
                className="mb-10"
            >
                <h1
                    className={`${display} text-4xl font-bold text-white sm:text-5xl`}
                >
                    My bookings
                </h1>

                <p className="mt-3 text-lg text-slate-400">
                    Track and manage your service bookings.
                </p>
            </motion.div>

            {/* Error message */}
            {error && (
                <p
                    role="alert"
                    className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                    {error}
                </p>
            )}

            {/* Empty state */}
            {!error && bookings.length === 0 ? (
                <Notice
                    action={
                        <button
                            onClick={() => router.push("/services")}
                            className={`mt-5 rounded-xl bg-[#3DDBC0] px-6 py-2.5 font-semibold text-[#04181C] hover:bg-[#6AEAD3] ${focus}`}
                        >
                            Explore services
                        </button>
                    }
                >
                    <h2
                        className={`${display} text-xl font-bold text-white`}
                    >
                        No bookings yet
                    </h2>

                    <p className="mt-2 text-slate-400">
                        You haven’t booked any services yet.
                    </p>
                </Notice>
            ) : (
                <motion.ul
                    variants={list}
                    initial={reduce ? "show" : "hidden"}
                    animate="show"
                    className="grid gap-6 md:grid-cols-2"
                >
                    {bookings.map((booking) => {
                        const s = getStatusStyle(booking.status);

                        return (
                            <motion.li
                                key={booking.id}
                                variants={rise}
                                whileHover={
                                    reduce ? undefined : { y: -4 }
                                }
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 22,
                                }}
                                className="rounded-2xl border border-white/10 bg-[#0A2228] p-6 shadow-xl shadow-black/30 transition-colors hover:border-[#3DDBC0]/40"
                            >
                                {/* Booking heading */}
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2
                                            className={`${display} text-xl font-bold text-white`}
                                        >
                                            {booking.service?.name ||
                                                `Service #${booking.service_id}`}
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Booking {booking.id}
                                        </p>
                                    </div>

                                    {/* Status badge */}
                                    <span
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium capitalize ${s.badge}`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${s.dot}`}
                                        />

                                        {booking.status.replaceAll("_", " ")}
                                    </span>
                                </div>

                                {/* Booking information */}
                                <dl className="mt-6 space-y-4 text-sm">
                                    <div>
                                        <dt className="text-slate-500">
                                            Scheduled
                                        </dt>

                                        <dd className="mt-0.5 text-slate-200">
                                            {new Date(
                                                booking.scheduled_at
                                            ).toLocaleString(undefined, {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-slate-500">
                                            Address
                                        </dt>

                                        <dd className="mt-0.5 text-slate-200">
                                            {booking.address}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-slate-500">
                                            Technician
                                        </dt>

                                        <dd className="mt-0.5 text-slate-200">
                                            {booking.technician?.name ||
                                                (booking.technician_id
                                                    ? "Assigned"
                                                    : "Not assigned yet")}
                                        </dd>
                                    </div>

                                    {booking.description && (
                                        <div>
                                            <dt className="text-slate-500">
                                                Notes
                                            </dt>

                                            <dd className="mt-0.5 text-slate-200">
                                                {booking.description}
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                {/* Price */}
                                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                                    <span className="text-sm text-slate-500">
                                        Total price
                                    </span>

                                    <span
                                        className={`${display} text-xl font-bold text-[#3DDBC0]`}
                                    >
                                        ৳
                                        {Number(
                                            booking.total_price
                                        ).toLocaleString("en-BD")}
                                    </span>
                                </div>

                                {/* Cancel booking button */}
                                {booking.status.toLowerCase() === "pending" && (
                                    <div className="mt-5 border-t border-white/10 pt-4">
                                        <button
                                            onClick={() =>
                                                handleCancelBooking(booking.id)
                                            }
                                            disabled={
                                                cancellingId === booking.id
                                            }
                                            className={`w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}
                                        >
                                            {cancellingId === booking.id
                                                ? "Cancelling..."
                                                : "Cancel Booking"}
                                        </button>
                                    </div>
                                )}
                            </motion.li>
                        );
                    })}
                </motion.ul>
            )}
        </Shell>
    );
}
