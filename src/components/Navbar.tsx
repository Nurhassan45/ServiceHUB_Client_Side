"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
// import { useAuth } from "@/context/AuthContext";

// Fonts load from Google Fonts via the @import line in globals.css.
const display = "font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif]";
const body = "font-['DM_Sans',ui-sans-serif,system-ui,sans-serif]";

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const reduce = useReducedMotion();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        router.push("/login");
    };

    const links = [
    
        { href: "/", label: "Home" },
        { href: "/technicians", label: "Technicians" },
        { href: "/services", label: "Services" },
        ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ];

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    const focus =
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DDBC0]";

    const authArea = !loading && (
        <>
            {user ? (
                <>
                    <div className="flex items-center gap-3">
                        <span
                            aria-hidden
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3DDBC0] text-sm font-bold text-[#04181C]"
                        >
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                        <span className="leading-tight">
                            <span className="block text-sm font-medium text-white">{user.name}</span>
                            <span className="block text-xs capitalize text-slate-400">{user.role}</span>
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300 ${focus}`}
                    >
                        Log out
                    </button>
                </>
            ) : (
                <>
                    <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white ${focus}`}
                    >
                        Log in
                    </Link>
                    <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                        <Link
                            href="/register"
                            onClick={() => setMenuOpen(false)}
                            className={`block rounded-xl bg-[#3DDBC0] px-4 py-2 text-center text-sm font-semibold text-[#04181C] shadow-lg shadow-[#3DDBC0]/20 transition-colors hover:bg-[#6AEAD3] ${focus}`}
                        >
                            Create account
                        </Link>
                    </motion.div>
                </>
            )}
        </>
    );

    return (
        <header className={`${body} sticky top-0 z-50 border-b border-white/10 bg-[#061418]/80 backdrop-blur-md`}>
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
                <Link href="/" className={`${display} text-2xl font-bold text-white ${focus} rounded`}>
                    Service<span className="text-[#3DDBC0]">Hub</span>
                </Link>

                {/* Desktop */}
                <div className="hidden items-center gap-8 md:flex">
                    <ul className="flex items-center gap-1">
                        {links.map((l) => {
                            const active = isActive(l.href);
                            return (
                                <li key={l.href}>
                                    <Link
                                        href={l.href}
                                        aria-current={active ? "page" : undefined}
                                        className={`relative block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                            active ? "text-white" : "text-slate-400 hover:text-white"
                                        } ${focus}`}
                                    >
                                        {active && (
                                            <motion.span
                                                layoutId="nav-pill"
                                                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                                                className="absolute inset-0 rounded-lg bg-white/10"
                                            />
                                        )}
                                        <span className="relative">{l.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="flex items-center gap-4">{authArea}</div>
                </div>

                {/* Mobile toggle */}
                <button
                    className={`flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg md:hidden ${focus}`}
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    <motion.span
                        animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                        className="block h-0.5 w-6 rounded bg-white"
                    />
                    <motion.span
                        animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                        className="block h-0.5 w-6 rounded bg-white"
                    />
                </button>
            </nav>

            {/* Mobile panel */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={reduce ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden border-t border-white/10 bg-[#061418] md:hidden"
                    >
                        <div className="flex flex-col gap-1 px-6 py-5">
                            {links.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setMenuOpen(false)}
                                    aria-current={isActive(l.href) ? "page" : undefined}
                                    className={`rounded-lg px-3 py-3 text-base font-medium ${
                                        isActive(l.href) ? "bg-white/10 text-white" : "text-slate-300"
                                    } ${focus}`}
                                >
                                    {l.label}
                                </Link>
                            ))}
                            <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-5">{authArea}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}