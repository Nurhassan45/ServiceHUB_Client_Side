"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { useAuth } from "../../../context/AuthContext";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700"] });
const body = DM_Sans({ subsets: ["latin"] });

const tickets = [
    { job: "Kitchen sink leak", who: "Rahim, plumber", when: "Tomorrow, 10:00", status: "Confirmed", dot: "bg-emerald-500", tilt: -2.5, shift: "ml-0" },
    { job: "AC servicing", who: "Nadia, technician", when: "Friday, 14:30", status: "On the way", dot: "bg-amber-400", tilt: 1.5, shift: "ml-10" },
    { job: "Living room repaint", who: "Karim and team", when: "Next week", status: "Quote ready", dot: "bg-sky-400", tilt: -1, shift: "ml-4" },
];

const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};
const drop = {
    hidden: { opacity: 0, y: -28, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 160, damping: 16 } },
};

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const reduce = useReducedMotion();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            await login(email, password);

            router.push("/");
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const field =
        "w-full rounded-xl border border-[#1F3F46] bg-[#0D2227] px-4 py-3.5 text-white " +
        "placeholder:text-slate-500 outline-none transition " +
        "focus:border-[#3DDBC0] focus:ring-4 focus:ring-[#3DDBC0]/15";

    return (
        <div className={`${body.className} grid min-h-screen bg-[#061418] lg:grid-cols-2`}>
            {/* Brand panel: the one memorable moment */}
            <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0A2228] p-14 text-white lg:flex">
                <div className="absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#3DDBC0]/20 blur-3xl" aria-hidden />
                <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#3DDBC0]/5 blur-3xl" aria-hidden />

                <p className={`${display.className} relative text-2xl font-bold`}>ServiceHub</p>

                <div className="relative">
                    <motion.h2
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`${display.className} max-w-md text-5xl font-bold leading-[1.05]`}
                    >
                        Book trusted help. Follow every job.
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

                <p className="relative text-sm text-white/60">Plumbers, electricians, cleaners and more, all in one place.</p>
            </section>

            {/* Form panel */}
            <main className="flex items-center justify-center px-6 py-12">
                <motion.form
                    onSubmit={handleLogin}
                    initial={reduce ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-sm space-y-6"
                >
                    <div>
                        <p className={`${display.className} mb-6 text-xl font-bold text-[#3DDBC0] lg:hidden`}>ServiceHub</p>
                        <h1 className={`${display.className} text-4xl font-bold text-white`}>Welcome back</h1>
                        <p className="mt-2 text-slate-400">Log in to manage your bookings.</p>
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
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className={field}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <Link href="/forgot-password" className="text-sm text-[#3DDBC0] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
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
                        disabled={loading}
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
                        {loading ? "Logging in" : "Log in"}
                    </motion.button>

                    <p className="text-center text-sm text-slate-400">
                        New to ServiceHub?{" "}
                        <Link href="/register" className="font-medium text-[#3DDBC0] hover:underline">
                            Create an account
                        </Link>
                    </p>
                </motion.form>
            </main>
        </div>
    );
}