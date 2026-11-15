"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../../lib/axios";
// import axiosInstance from "@/lib/axios";

interface Service {
    id: number;
    name: string;
    description: string;
    base_price: number;
    image_url: string | null;
    is_active: boolean;
}

// Fonts load from Google Fonts via the @import line in globals.css.
const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";

const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";

const stack = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const rise = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function ServiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const reduce = useReducedMotion();

    const id = params.id as string;

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await axiosInstance.get(`/services/${id}`);

                setService(response.data.data);
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
                        "Service not found."
                    );
                } else {
                    setError("Failed to load service.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id]);

    const shell = (children: React.ReactNode) => (
        <div className={`${body} min-h-[calc(100vh-65px)] bg-[#061418]`}>
            <main className="mx-auto max-w-5xl px-6 py-14">{children}</main>
        </div>
    );

    if (loading) {
        return shell(
            <div
                role="status"
                aria-label="Loading service details"
                className="grid animate-pulse gap-10 motion-reduce:animate-none md:grid-cols-2"
            >
                <div className="h-96 rounded-3xl bg-[#0A2228]" />
                <div className="space-y-4 py-4">
                    <div className="h-4 w-24 rounded bg-[#0A2228]" />
                    <div className="h-10 w-3/4 rounded bg-[#0A2228]" />
                    <div className="h-4 w-full rounded bg-[#0A2228]" />
                    <div className="h-4 w-5/6 rounded bg-[#0A2228]" />
                    <div className="h-20 w-full rounded-2xl bg-[#0A2228]" />
                    <div className="h-12 w-full rounded-xl bg-[#0A2228]" />
                </div>
            </div>
        );
    }

    if (error || !service) {
        return shell(
            <div
                role="alert"
                className="mx-auto max-w-md rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center"
            >
                <p className="text-red-300">{error || "Service not found."}</p>

                <button
                    onClick={() => router.push("/services")}
                    className={`mt-5 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 ${focus}`}
                >
                    Back to services
                </button>
            </div>
        );
    }

    return shell(
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            {/* Image */}
            <motion.div
                initial={reduce ? false : { opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#102E35] shadow-2xl shadow-black/40"
            >
                {service.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={service.image_url}
                        alt={service.name}
                        className="h-80 w-full object-cover md:h-[26rem]"
                    />
                ) : (
                    <div
                        aria-hidden
                        className={`${display} flex h-80 items-center justify-center text-9xl font-bold text-[#3DDBC0]/30 md:h-[26rem]`}
                    >
                        {service.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </motion.div>

            {/* Details */}
            <motion.div
                variants={stack}
                initial={reduce ? "show" : "hidden"}
                animate="show"
                className="flex flex-col justify-center"
            >
                <motion.span
                    variants={rise}
                    className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                        service.is_active
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-white/10 text-slate-400"
                    }`}
                >
                    <span
                        className={`h-2 w-2 rounded-full ${service.is_active ? "bg-emerald-400" : "bg-slate-500"}`}
                    />
                    {service.is_active ? "Available now" : "Currently unavailable"}
                </motion.span>

                <motion.h1 variants={rise} className={`${display} text-4xl font-bold text-white sm:text-5xl`}>
                    {service.name}
                </motion.h1>

                <motion.p variants={rise} className="mt-5 max-w-prose leading-7 text-slate-400">
                    {service.description}
                </motion.p>

                <motion.div
                    variants={rise}
                    className="mt-8 rounded-2xl border border-white/10 bg-[#0A2228] px-6 py-5"
                >
                    <p className="text-sm text-slate-500">Starting at</p>
                    <p className={`${display} text-3xl font-bold text-[#3DDBC0]`}>
                        ৳{Number(service.base_price).toLocaleString("en-BD")}
                    </p>
                </motion.div>

                <motion.div variants={rise} className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <motion.button
                        onClick={() =>
                            router.push(
                                `/bookings/create/${service.id}`
                            )
                        }
                        disabled={!service.is_active}
                        whileHover={reduce || !service.is_active ? undefined : { y: -2 }}
                        whileTap={reduce || !service.is_active ? undefined : { scale: 0.98 }}
                        className={`flex-1 rounded-xl bg-[#3DDBC0] px-6 py-3.5 font-semibold text-[#04181C] shadow-lg shadow-[#3DDBC0]/20 transition-colors hover:bg-[#6AEAD3] disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}
                    >
                        Book this service
                    </motion.button>

                    <button
                        onClick={() => router.push("/services")}
                        className={`rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-slate-200 transition-colors hover:bg-white/10 ${focus}`}
                    >
                        Back to services
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}