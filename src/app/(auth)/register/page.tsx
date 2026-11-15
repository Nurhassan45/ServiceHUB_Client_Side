"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import axiosInstance from "../../../lib/axios";
// import axiosInstance from "@/lib/axios";

type UserRole = "customer" | "technician";

// Fonts load from Google Fonts via the @import line in globals.css.
const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";

const tickets = [
    { job: "Burst pipe repair", who: "Posted by a customer", when: "2 minutes ago", status: "Needs a plumber", dot: "bg-amber-400", tilt: -2, shift: "ml-0" },
    { job: "Ceiling fan install", who: "Sabbir, electrician", when: "Today, 16:00", status: "Accepted", dot: "bg-emerald-500", tilt: 1.5, shift: "ml-10" },
    { job: "Wiring safety check", who: "Job completed", when: "Yesterday", status: "Paid", dot: "bg-sky-400", tilt: -1, shift: "ml-4" },
];

const roles: { value: UserRole; title: string; hint: string }[] = [
    { value: "customer", title: "Customer", hint: "I need a service" },
    { value: "technician", title: "Technician", hint: "I offer a service" },
];

const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};
const drop = {
    hidden: { opacity: 0, y: -28, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 160, damping: 16 } },
};

export default function RegisterPage() {
    const router = useRouter();
    const reduce = useReducedMotion();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer" as UserRole,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            await axiosInstance.post("/auth/register", formData);

            setSuccess(true);
            setTimeout(() => router.push("/login"), 1500);
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
                    "Registration failed. Please try again."
                );
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const field =
        "w-full rounded-xl border border-[#1F3F46] bg-[#0D2227] px-4 py-3.5 text-white " +
        "placeholder:text-slate-500 outline-none transition " +
        "focus:border-[#3DDBC0] focus:ring-4 focus:ring-[#3DDBC0]/15";
    const label = "block text-sm font-medium text-slate-300";

    return (
        <div className={`${body} grid min-h-screen bg-[#061418] lg:grid-cols-2`}>
            {/* Brand panel */}
            <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0A2228] p-14 text-white lg:flex">
                <div className="absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#3DDBC0]/20 blur-3xl" aria-hidden />
                <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#3DDBC0]/5 blur-3xl" aria-hidden />

                <p className={`${display} relative text-2xl font-bold`}>ServiceHub</p>

                <div className="relative">
                    <motion.h2
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`${display} max-w-md text-5xl font-bold leading-[1.05]`}
                    >
                        Find skilled help, or find your next job.
                    </motion.h2>

                    <motion.ul
                        variants={list}
                        initial={reduce ? "show" : "hidden"}
                        animate="show"
                        className="mt-12 max-w-sm space-y-4"
                    >
                        {tickets.map((t, i) => (
                            <motion.li key={t.job} variants={drop} className={t.shift} style={{ rotate: t.tilt }}>
                                <motion.div
                                    animate={reduce ? undefined : { y: [0, -6, 0] }}
                                    transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                                    className="rounded-2xl border border-white/10 bg-[#102E35] p-4 text-white shadow-xl shadow-black/40"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold">{t.job}</p>
                                            <p className="text-sm text-slate-400">{t.who}</p>
                                        </div>
                                        <span className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                                            <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                                            {t.status}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-400">{t.when}</p>
                                </motion.div>
                            </motion.li>
                        ))}
                    </motion.ul>
                </div>

                <p className="relative text-sm text-white/60">Free to join. Pick your role and start in a minute.</p>
            </section>

            {/* Form panel */}
            <main className="flex items-center justify-center px-6 py-12">
                <motion.form
                    onSubmit={handleRegister}
                    initial={reduce ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-sm space-y-6"
                >
                    <div>
                        <p className={`${display} mb-6 text-xl font-bold text-[#3DDBC0] lg:hidden`}>ServiceHub</p>
                        <h1 className={`${display} text-4xl font-bold text-white`}>Create your account</h1>
                        <p className="mt-2 text-slate-400">Tell us who you are to get started.</p>
                    </div>

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
                                Account created. Taking you to login.
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Role picker */}
                    <fieldset className="space-y-2">
                        <legend className={`${label} mb-2`}>I am a</legend>
                        <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-2xl border border-[#1F3F46] bg-[#0D2227] p-1">
                            {roles.map((r) => {
                                const active = formData.role === r.value;
                                return (
                                    <button
                                        key={r.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => setFormData((p) => ({ ...p, role: r.value }))}
                                        className="relative rounded-xl px-3 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3DDBC0]"
                                    >
                                        {active && (
                                            <motion.span
                                                layoutId="role-pill"
                                                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                                                className="absolute inset-0 rounded-xl bg-[#3DDBC0]"
                                            />
                                        )}
                                        <span className={`relative block text-sm font-semibold ${active ? "text-[#04181C]" : "text-white"}`}>
                                            {r.title}
                                        </span>
                                        <span className={`relative block text-xs ${active ? "text-[#04181C]/70" : "text-slate-400"}`}>
                                            {r.hint}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>

                    <div className="space-y-2">
                        <label htmlFor="name" className={label}>Full name</label>
                        <input
                            id="name"
                            name="name"
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            className={field}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className={label}>Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={field}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className={label}>Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className={`${field} pr-16`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-pressed={showPassword}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm font-medium text-slate-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3DDBC0]"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading || success}
                        whileHover={reduce || loading ? undefined : { y: -2 }}
                        whileTap={reduce || loading ? undefined : { scale: 0.98 }}
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#3DDBC0] px-4 py-3.5 font-semibold text-[#04181C] shadow-lg shadow-[#3DDBC0]/20 transition-colors hover:bg-[#6AEAD3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading && (
                            <motion.span
                                aria-hidden
                                className="h-4 w-4 rounded-full border-2 border-[#04181C]/30 border-t-[#04181C]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                        {loading ? "Creating account" : "Create account"}
                    </motion.button>

                    <p className="text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-[#3DDBC0] hover:underline">
                            Log in
                        </Link>
                    </p>
                </motion.form>
            </main>
        </div>
    );
}