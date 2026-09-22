"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, FileText, History, User, LogOut, ArrowRight } from "lucide-react";
import { getStoredUser, clearAuthSession } from "@/lib/auth";
import { UserProfile } from "@/types/resume";

export const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                CareerCraft AI
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full">
                Resume Analyzer
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Analyze
            </Link>
            <Link
              href="/history"
              className="flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <History className="w-4 h-4 mr-1.5 text-slate-400" />
              History
            </Link>
          </div>

          {/* Right Action / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg text-sm text-slate-200">
                  <User className="w-4 h-4 text-brand-400" />
                  <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 px-4 py-2 rounded-xl shadow-lg shadow-brand-600/20 transition-all hover:shadow-brand-600/40 hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
