
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

type NavItem = {
    label: string;
    href: string;
    icon: string;
};

const navigation: Record<string, NavItem[]> = {
    customer: [
        { label: "Dashboard", href: "/dashboard/bookings", icon: "⌂" },
        { label: "Browse Services", href: "/services", icon: "◇" },
        { label: "Find Technicians", href: "/technicians", icon: "♙" },
        { label: "My Bookings", href: "/dashboard/bookings", icon: "▤" },
        { label: "My Reviews", href: "/dashboard/reviews", icon: "☆" },
    ],

    technician: [
        { label: "Assigned Bookings", href: "/dashboard/assigned-bookings", icon: "▤" },
        { label: "My Profile", href: "/dashboard/technician/profile", icon: "♙" },
    ],

    admin: [
        { label: "Manage Services", href: "/dashboard/admin/services", icon: "◇" },
        { label: "Manage Bookings", href: "/dashboard/admin/bookings", icon: "▤" },
        { label: "Manage Technicians", href: "/dashboard/admin/technicians", icon: "♙" },
    ],
};

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const roleHome: Record<string, string> = {
        customer: "/dashboard/bookings",
        technician: "/dashboard/technician",
        admin: "/dashboard/admin",
    };

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        const restrictedRoutes = [
            { prefix: "/dashboard/admin", role: "admin" },
            { prefix: "/dashboard/assigned-bookings", role: "technician" },
            { prefix: "/dashboard/technician", role: "technician" },
            { prefix: "/dashboard/bookings", role: "customer" },
            { prefix: "/dashboard/reviews", role: "customer" },
        ];

        const restrictedRoute = restrictedRoutes.find(
            (route) =>
                pathname === route.prefix ||
                pathname.startsWith(`${route.prefix}/`)
        );

        if (restrictedRoute && user.role !== restrictedRoute.role) {
            router.replace(roleHome[user.role]);
        }
    }, [loading, user, pathname, router]);

    const handleLogout = () => {
        logout();
        router.replace("/login");
    };

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#061418]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#24434A] border-t-[#3DDBC0]" />
            </div>
        );
    }

    const navItems = navigation[user.role] ?? [];

    const isActive = (href: string) => {
        if (href === "/services" || href === "/technicians") {
            return pathname === href || pathname.startsWith(`${href}/`);
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <div className="min-h-screen bg-[#061418] text-white">

            {/* Mobile Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0A2228] px-5 py-4 lg:hidden">
                <Link href={roleHome[user.role]} className="text-xl font-black">
                    Service<span className="text-[#3DDBC0]">Hub</span>
                </Link>

                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm"
                >
                    {mobileMenuOpen ? "Close ✕" : "Menu ☰"}
                </button>
            </header>

            <div className="flex min-h-screen">

                {/* Sidebar */}
                <aside
                    className={`
                        fixed inset-y-0 left-0 z-40 flex w-72 flex-col
                        border-r border-white/10 bg-[#0A2228]
                        transition-transform duration-300
                        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
                        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
                >
                    {/* Logo */}
                    <div className="border-b border-white/10 px-7 py-7">
                        <Link
                            href={roleHome[user.role]}
                            className="text-2xl font-black tracking-tight"
                        >
                            Service<span className="text-[#3DDBC0]">Hub</span>
                        </Link>

                        <p className="mt-2 text-xs text-slate-400">
                            Home Service Management
                        </p>
                    </div>

                    {/* User Info */}
                    <div className="mx-5 mt-6 rounded-2xl border border-white/10 bg-[#061418] p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3DDBC0]/15 font-bold text-[#3DDBC0]">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold">
                                    {user.name}
                                </p>
                                <p className="text-xs capitalize text-[#3DDBC0]">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto px-5 py-7">
                        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Main Navigation
                        </p>

                        {navItems.map((item) => {
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-4 rounded-xl px-4 py-3
                                        text-sm font-medium transition-all
                                        ${
                                            active
                                                ? "bg-[#3DDBC0] text-[#04181C] shadow-lg shadow-[#3DDBC0]/10"
                                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                                        }
                                    `}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="space-y-3 border-t border-white/10 p-5">
                        <Link
                            href="/"
                            className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                            ← Back to Website
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full rounded-xl border border-red-400/20 px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-400/10"
                        >
                            ↪ Logout
                        </button>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {mobileMenuOpen && (
                    <button
                        aria-label="Close navigation menu"
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 z-30 bg-black/60 lg:hidden"
                    />
                )}

                {/* Main Content */}
                <main className="min-w-0 flex-1">
                    <div className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
