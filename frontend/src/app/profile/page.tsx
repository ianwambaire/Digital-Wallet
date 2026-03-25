"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [userRes, walletRes] = await Promise.all([
          fetch(`${API_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/wallet`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!userRes.ok || !walletRes.ok) {
          throw new Error("Failed to load profile");
        }

        const userData = await userRes.json();
        const walletData = await walletRes.json();

        setUser(userData);
        setName(userData.name);
        setBalance(walletData.balance);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const initials = useMemo(() => {
    return user?.name ? getInitials(user.name) : "U";
  }, [user]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function handleSaveProfile() {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (user) {
      setUser({ ...user, name: name.trim() });
      setSuccessMessage("Profile updated locally.");
      setEditing(false);
      setTimeout(() => setSuccessMessage(""), 2500);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              View your account details and wallet summary.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              Home
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
                {initials}
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {loading ? "Loading..." : user?.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{user?.email}</p>

              <div className="mt-6 w-full rounded-xl bg-blue-50 p-4 text-left">
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  KES {balance?.toFixed(2) ?? "0.00"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>

            {loading ? (
              <p className="mt-4 text-gray-500">Loading...</p>
            ) : (
              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!editing}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-black disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={
                      user?.created_at
                        ? new Intl.DateTimeFormat("en-KE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "Africa/Nairobi",
                          }).format(new Date(user.created_at))
                        : ""
                    }
                    disabled
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none disabled:bg-gray-100"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                      >
                        Save Changes
                      </button>

                      <button
                        onClick={() => {
                          setEditing(false);
                          setName(user?.name ?? "");
                        }}
                        className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}