"use client";

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../../../../context/AuthContext";
import axiosInstance from "../../../../../lib/axios";
// import axiosInstance from "@/lib/axios";
// import { useAuth } from "@/context/AuthContext";

interface Service {
    id: string;
    name: string;
    description: string;
    base_price: number;
    image_url: string | null;
}

// Fonts load from Google Fonts via the @import line in globals.css.
const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";

const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";
const field =
    "w-full rounded-xl border border-[#1F3F46] bg-[#0D2227] px-4 py-3.5 text-white " +
    "placeholder:text-slate-500 outline-none transition [color-scheme:dark] " +
    "focus:border-[#3DDBC0] focus:ring-4 focus:ring-[#3DDBC0]/15";
const label = "block text-sm font-medium text-slate-300";

// datetime-local needs local time, not UTC
const toLocalInput = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function Shell({ children }: { children: ReactNode }) {
    return (
        <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
            <main className="mx-auto max-w-5xl px-6 py-14">{children}</main>
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

function BookingForm() {
    // const searchParams = useSearchParams();
      const params = useParams();

    const serviceId = params.serviceid as string;

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const reduce = useReducedMotion();

    const [service, setService] = useState<Service | null>(null);
    const [scheduledAt, setScheduledAt] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await axiosInstance.get(
                    `/services/${serviceId}`
                );

                setService(response.data.data);
            } catch {
                setError("Unable to load this service.");
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchService();
        } else {
            setLoading(false);
        }
    }, [serviceId,setLoading]);

    console.log('services data',service)

    const handleBooking = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user || user.role !== "customer") {
            setError("Only customers can create bookings.");
            return;
        }

        if (new Date(scheduledAt).getTime() <= Date.now()) {
            setError("Please select a future date and time.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const bookingData = {
                service_id: serviceId,
                scheduled_at: new Date(scheduledAt).toISOString(),
                address: address.trim(),
                description: description.trim() || undefined,
            };

            const response = await axiosInstance.post(
                "/bookings",
                bookingData
            );

            setSuccess(response.data.message || "Booking created successfully!");
            setTimeout(() => router.push("/dashboard"), 1500);
        } catch (err: unknown) {
            if (
                typeof err === "object" &&
                err !== null &&
                "response" in err
            ) {
                const apiError = err as {
                    response?: {
                        data?: { message?: string };
                    };
                };

                setError(
                    apiError.response?.data?.message ||
                    "Booking failed. Please try again."
                );
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <Shell>
                <div
                    role="status"
                    aria-label="Loading"
                    className="grid animate-pulse gap-8 motion-reduce:animate-none md:grid-cols-5"
                >
                    <div className="h-80 rounded-3xl bg-[#0A2228] md:col-span-2" />
                    <div className="h-[28rem] rounded-3xl bg-[#0A2228] md:col-span-3" />
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
                            className={`mt-5 rounded-xl bg-[#3DDBC0] px-6 py-2.5 font-semibold text-[#04181C] hover:bg-[#6AEAD3] ${focus}`}
                        >
                            Log in
                        </button>
                    }
                >
                    <p>Log in to book a service.</p>
                </Notice>
            </Shell>
        );
    }

    if (user.role !== "customer") {
        return (
            <Shell>
                <Notice>
                    <p>Only customers can book services.</p>
                </Notice>
            </Shell>
        );
    }

    if (!service) {
        return (
            <Shell>
                <Notice
                    action={
                        <button
                            onClick={() => router.push("/services")}
                            className={`mt-5 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 ${focus}`}
                        >
                            Browse services
                        </button>
                    }
                >
                    <p className="text-red-300">{error || "Service not found."}</p>
                </Notice>
            </Shell>
        );
    }

    return (
        <Shell>
            <motion.h1
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`${display} mb-10 text-4xl font-bold text-white sm:text-5xl`}
            >
                Book a service
            </motion.h1>

            <div className="grid gap-8 md:grid-cols-5">
                {/* Summary */}
                <motion.aside
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                    className="h-fit overflow-hidden rounded-3xl border border-white/10 bg-[#0A2228] shadow-xl shadow-black/30 md:sticky md:top-24 md:col-span-2"
                >
                    <div className="h-44 bg-[#102E35]">
                        {service.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={service.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div
                                aria-hidden
                                className={`${display} flex h-full items-center justify-center text-7xl font-bold text-[#3DDBC0]/30`}
                            >
                                {service.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="p-6">
                        <h2 className={`${display} text-xl font-bold text-white`}>{service.name}</h2>
                        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-400">
                            {service.description}
                        </p>
                        <p className="mt-5 text-xs text-slate-500">Starting at</p>
                        <p className={`${display} text-2xl font-bold text-[#3DDBC0]`}>
                            ৳{Number(service.base_price).toLocaleString("en-BD")}
                        </p>
                    </div>
                </motion.aside>

                {/* Form */}
                <motion.form
                    onSubmit={handleBooking}
                    initial={reduce ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="space-y-6 rounded-3xl border border-white/10 bg-[#0A2228] p-7 md:col-span-3"
                >
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.p
                                key={error}
                                role="alert"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto", x: reduce ? 0 : [0, -8, 8, -5, 5, 0] }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4 }}
                                className="overflow-hidden rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                            >
                                {error}
                            </motion.p>
                        )}
                        {success && (
                            <motion.p
                                key="success"
                                role="status"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="overflow-hidden rounded-xl border border-[#3DDBC0]/30 bg-[#3DDBC0]/10 px-4 py-3 text-sm text-[#3DDBC0]"
                            >
                                {success} Taking you to your dashboard.
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label htmlFor="scheduledAt" className={label}>Preferred date and time</label>
                        <input
                            id="scheduledAt"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            min={toLocalInput(new Date(Date.now() + 60000))}
                            required
                            className={field}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className={label}>Service address</label>
                        <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="House, road, area, and city"
                            required
                            rows={3}
                            className={`${field} resize-none`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className={label}>
                            Notes for the technician <span className="text-slate-500">(optional)</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the problem or anything we should know"
                            rows={3}
                            className={`${field} resize-none`}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={submitting || !!success}
                        whileHover={reduce || submitting ? undefined : { y: -2 }}
                        whileTap={reduce || submitting ? undefined : { scale: 0.98 }}
                        className={`flex w-full items-center justify-center gap-3 rounded-xl bg-[#3DDBC0] px-6 py-3.5 font-semibold text-[#04181C] shadow-lg shadow-[#3DDBC0]/20 transition-colors hover:bg-[#6AEAD3] disabled:cursor-not-allowed disabled:opacity-70 ${focus}`}
                    >
                        {submitting && (
                            <motion.span
                                aria-hidden
                                className="h-4 w-4 rounded-full border-2 border-[#04181C]/30 border-t-[#04181C]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                        {submitting ? "Confirming" : "Confirm booking"}
                    </motion.button>
                </motion.form>
            </div>
        </Shell>
    );
}

export default function CreateBookingPage() {
    return (
        <Suspense fallback={null}>
            <BookingForm />
        </Suspense>
    );
}