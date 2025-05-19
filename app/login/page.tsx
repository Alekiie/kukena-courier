"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockClosedIcon,
  UserCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className=" h-[100%] w-[100%] bg-gradient-to-br from-slate-500 to-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 mx-4"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-2 rounded-full bg-gradient-to-br from-slate-800 to-slate-600">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Kettno Courier
            </h1>
            <p className="text-slate-500">Global Logistics Solutions</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100"
              >
                <LockClosedIcon className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <UserCircleIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Username"
                />
              </div>

              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="text-center">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Forgot Password?
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
