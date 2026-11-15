"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
// import axiosInstance from "@/lib/axios";
// import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../lib/axios";

interface Booking {
    id: string;
    customer_id: string;
    technician_id: string | null;
    service_id: string;
    scheduled_at: string;
    address: string;
    description: string | null;
    status: string;
    total_price: string | number;
    created_at: string;

    // These are available if your SQL query joins these fields
    service_name?: string;
    customer_name?: string;
    customer_email?: string;
}

// Fonts load from Google Fonts via the @import line in globals.css.
const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";
const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";

const btnPrimary = `rounded-xl bg-[#3DDBC0] px-4 py-2.5 text-sm font-semibold text-[#04181C] transition-colors hover:bg-[#6AEAD3] disabled:cursor-not-allowed disabled:opacity-50 ${focus}`;
const btnDanger = `rounded-xl border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`;

const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};
const rise = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function Shell({ children }: { children: ReactNode }) {
    return (
        <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
            <main className="mx-auto max-w-7xl px-6 py-14">{children}</main>
        </div>
    );
}

function Notice({ children, action }: { children: ReactNode; action?: ReactNode }) {
    return (
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0A2228] p-8 text-center text-slate-300">
            {children}
            {action}
        </div>
    );
}

function Spinner() {
    return (
        <motion.span
            aria-hidden
            className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-[#3DDBC0]"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
    );
}

export default function TechnicianDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const reduce = useReducedMotion();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        try {
            setError("");

            const response = await axiosInstance.get("/bookings/assigned");

            setBookings(response.data.data);
        } catch (err: unknown) {
            const apiError = err as {
                response?: {
                    data?: { message?: string };
                };
            };

            setError(
                apiError.response?.data?.message ||
                "Failed to load assigned bookings."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== "technician") {
            setLoading(false);
            return;
        }

        fetchBookings();
    }, [user, authLoading, fetchBookings]);

    // Success messages fade out on their own
    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(""), 4000);
        return () => clearTimeout(t);
    }, [notice]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchBookings();
        setRefreshing(false);
    };

    // Accept or reject booking
    const handleResponse = async (
        bookingId: string,
        action: "accepted" | "rejected"
    ) => {
        try {
            setProcessingId(bookingId);
            setError("");

            const response = await axiosInstance.patch(
                `/bookings/${bookingId}/respond`,
                { action }
            );

            setNotice(response.data.message);
            await fetchBookings();
        } catch (err: unknown) {
            const apiError = err as {
                response?: {
                    data?: { message?: string };
                };
            };

            setError(
                apiError.response?.data?.message ||
                `Failed to ${action} booking.`
            );
        } finally {
            setProcessingId(null);
        }
    };

    // Update booking progress
    const handleProgress = async (
        bookingId: string,
        status: "in_progress" | "completed"
    ) => {
        try {
            setProcessingId(bookingId);
            setError("");

            const response = await axiosInstance.patch(
                `/bookings/${bookingId}/status`,
                { status }
            );

            setNotice(response.data.message);
            await fetchBookings();
        } catch (err: unknown) {
            const apiError = err as {
                response?: {
                    data?: { message?: string };
                };
            };

            setError(
                apiError.response?.data?.message ||
                "Failed to update booking status."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return { badge: "bg-amber-400/10 text-amber-300", dot: "bg-amber-400" };

            case "accepted":
                return { badge: "bg-sky-400/10 text-sky-300", dot: "bg-sky-400" };

            case "in_progress":
                return { badge: "bg-violet-400/10 text-violet-300", dot: "bg-violet-400" };

            case "completed":
                return { badge: "bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" };

            case "rejected":
                return { badge: "bg-red-400/10 text-red-300", dot: "bg-red-400" };

            default:
                return { badge: "bg-white/10 text-slate-300", dot: "bg-slate-400" };
        }
    };

    if (authLoading || loading) {
        return (
            <Shell>
                <div role="status" aria-label="Loading dashboard" className="animate-pulse motion-reduce:animate-none">
                    <div className="mb-10 grid gap-4 sm:grid-cols-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-28 rounded-2xl bg-[#0A2228]" />
                        ))}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {[0, 1].map((i) => (
                            <div key={i} className="h-72 rounded-2xl bg-[#0A2228]" />
                        ))}
                    </div>
                </div>
            </Shell>
        );
    }

    if (!user) {
        return (
            <Shell>
                <Notice
                    action={
                        <button
                            onClick={() => router.push("/login")}
                            className={`mt-5 ${btnPrimary} px-6`}
                        >
                            Log in
                        </button>
                    }
                >
                    <p>Log in to access your dashboard.</p>
                </Notice>
            </Shell>
        );
    }

    if (user.role !== "technician") {
        return (
            <Shell>
                <Notice>
                    <p>Only technicians can access this dashboard.</p>
                </Notice>
            </Shell>
        );
    }

    const stats = [
        { label: "Total bookings", value: bookings.length, color: "text-white" },
        { label: "In progress", value: bookings.filter((b) => b.status === "in_progress").length, color: "text-violet-300" },
        { label: "Completed", value: bookings.filter((b) => b.status === "completed").length, color: "text-emerald-300" },
    ];

    return (
        <Shell>
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-10"
            >
                <h1 className={`${display} text-4xl font-bold text-white sm:text-5xl`}>Technician dashboard</h1>
                <p className="mt-3 text-lg text-slate-400">
                    Welcome, {user.name}. Manage your assigned bookings.
                </p>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        key="error"
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto", x: reduce ? 0 : [0, -8, 8, -5, 5, 0] }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                        {error}
                    </motion.div>
                )}
                {notice && (
                    <motion.div
                        key="notice"
                        role="status"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden rounded-xl border border-[#3DDBC0]/30 bg-[#3DDBC0]/10 px-4 py-3 text-sm text-[#3DDBC0]"
                    >
                        {notice}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <motion.div
                variants={list}
                initial={reduce ? "show" : "hidden"}
                animate="show"
                className="mb-12 grid gap-4 sm:grid-cols-3"
            >
                {stats.map((s) => (
                    <motion.div
                        key={s.label}
                        variants={rise}
                        className="rounded-2xl border border-white/10 bg-[#0A2228] p-6"
                    >
                        <p className="text-sm text-slate-400">{s.label}</p>
                        <p className={`${display} mt-2 text-5xl font-bold ${s.color}`}>{s.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="mb-6 flex items-center justify-between">
                <h2 className={`${display} text-2xl font-bold text-white`}>Assigned bookings</h2>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-60 ${focus}`}
                >
                    {refreshing && <Spinner />}
                    Refresh
                </button>
            </div>

            {bookings.length === 0 ? (
                <Notice>
                    <h3 className={`${display} text-xl font-bold text-white`}>No assigned bookings</h3>
                    <p className="mt-2 text-slate-400">New bookings assigned to you will appear here.</p>
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
                        const busy = processingId === booking.id;
                        return (
                            <motion.li
                                key={booking.id}
                                variants={rise}
                                className="flex flex-col rounded-2xl border border-white/10 bg-[#0A2228] p-6 shadow-xl shadow-black/30"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className={`${display} text-xl font-bold text-white`}>
                                            {booking.service_name || `Service ID: ${booking.service_id}`}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">Booking {booking.id}</p>
                                    </div>

                                    <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium capitalize ${s.badge}`}>
                                        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                                        {booking.status.replaceAll("_", " ")}
                                    </span>
                                </div>

                                <dl className="mt-6 space-y-4 text-sm">
                                    <div>
                                        <dt className="text-slate-500">Customer</dt>
                                        <dd className="mt-0.5 text-slate-200">
                                            {booking.customer_name || booking.customer_id}
                                            {booking.customer_email && (
                                                <span className="block text-slate-400">{booking.customer_email}</span>
                                            )}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-slate-500">Scheduled</dt>
                                        <dd className="mt-0.5 text-slate-200">
                                            {new Date(booking.scheduled_at).toLocaleString(undefined, {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-slate-500">Address</dt>
                                        <dd className="mt-0.5 text-slate-200">{booking.address}</dd>
                                    </div>

                                    {booking.description && (
                                        <div>
                                            <dt className="text-slate-500">Notes</dt>
                                            <dd className="mt-0.5 text-slate-200">{booking.description}</dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                                    <span className="text-sm text-slate-500">Total price</span>
                                    <span className={`${display} text-xl font-bold text-[#3DDBC0]`}>
                                        ৳{Number(booking.total_price).toLocaleString("en-BD")}
                                    </span>
                                </div>

                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    {booking.status === "pending" && (
                                        <>
                                            <button
                                                disabled={busy}
                                                onClick={() => handleResponse(booking.id, "accepted")}
                                                className={btnPrimary}
                                            >
                                                Accept
                                            </button>

                                            <button
                                                disabled={busy}
                                                onClick={() => handleResponse(booking.id, "rejected")}
                                                className={btnDanger}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {booking.status === "accepted" && (
                                        <button
                                            disabled={busy}
                                            onClick={() => handleProgress(booking.id, "in_progress")}
                                            className={btnPrimary}
                                        >
                                            Start service
                                        </button>
                                    )}

                                    {booking.status === "in_progress" && (
                                        <button
                                            disabled={busy}
                                            onClick={() => handleProgress(booking.id, "completed")}
                                            className={btnPrimary}
                                        >
                                            Complete service
                                        </button>
                                    )}

                                    {busy && (
                                        <span className="flex items-center gap-2 text-sm text-slate-400">
                                            <Spinner />
                                            Processing
                                        </span>
                                    )}
                                </div>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            )}
        </Shell>
    );
}