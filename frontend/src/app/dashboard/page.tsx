"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

type Transaction = {
  id: number;
  sender_id: number | null;
  receiver_id: number | null;
  sender_name: string | null;
  receiver_name: string | null;
  sender_email: string | null;
  receiver_email: string | null;
  transaction_type: string;
  amount: number;
  created_at: string;
};

function parseUtcDate(value: string) {
  return new Date(value.endsWith("Z") || value.includes("+") ? value : `${value}Z`);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Nairobi",
  }).format(parseUtcDate(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(parseUtcDate(value));
}

export default function DashboardPage() {
  const router = useRouter();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [recipientEmail, setRecipientEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [walletRes, transactionsRes] = await Promise.all([
          fetch(`${API_URL}/wallet`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/transactions`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!walletRes.ok || !transactionsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const walletData = await walletRes.json();
        const transactionsData = await transactionsRes.json();

        setBalance(walletData.balance);
        setTransactions(transactionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  async function refreshTransactions(token: string) {
    const transactionsRes = await fetch(`${API_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (transactionsRes.ok) {
      const transactionsData = await transactionsRes.json();
      setTransactions(transactionsData);
    }
  }

  async function handleDeposit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setDepositLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      setDepositLoading(false);
      return;
    }

    if (Number(depositAmount) <= 0) {
      setError("Amount must be greater than 0");
      setDepositLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/wallet/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(depositAmount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Deposit failed");
      }

      setBalance(data.new_balance);
      setDepositAmount("");
      setSuccessMessage("Deposit successful.");
      await refreshTransactions(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDepositLoading(false);
    }
  }

  async function handleTransfer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setTransferLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      setTransferLoading(false);
      return;
    }

    if (Number(transferAmount) <= 0) {
      setError("Amount must be greater than 0");
      setTransferLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/wallet/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          amount: Number(transferAmount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Transfer failed");
      }

      setBalance(data.sender_new_balance);
      setRecipientEmail("");
      setTransferAmount("");
      setSuccessMessage("Transfer successful.");
      await refreshTransactions(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setTransferLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const stats = useMemo(() => {
    const deposits = transactions
      .filter((t) => t.transaction_type === "deposit")
      .reduce((sum, t) => sum + t.amount, 0);

    const transfers = transactions
      .filter((t) => t.transaction_type === "transfer")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTransactions: transactions.length,
      totalDeposits: deposits,
      totalTransfers: transfers,
    };
  }, [transactions]);

  const recentChartData = transactions.slice(0, 5).reverse();
  const maxAmount =
    recentChartData.length > 0
      ? Math.max(...recentChartData.map((t) => t.amount))
      : 1;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your wallet, deposits, transfers, and transaction history.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/profile"
              className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white shadow-sm">
          <h2 className="text-lg font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-blue-100">
            Deposit money, transfer funds, and track your wallet activity in one place.
          </p>
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Current Balance</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {loading ? "Loading..." : `KES ${balance?.toFixed(2) ?? "0.00"}`}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {stats.totalTransactions}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Deposits</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              KES {stats.totalDeposits.toFixed(2)}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Transfers</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              KES {stats.totalTransfers.toFixed(2)}
            </p>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Deposit Money</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add funds to your wallet balance.
            </p>

            <form onSubmit={handleDeposit} className="mt-5 space-y-4">
              <input
                type="number"
                inputMode="decimal"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="no-spinner w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-black"
                required
              />

              <button
                type="submit"
                disabled={depositLoading}
                className="w-full rounded-lg bg-black px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {depositLoading ? "Processing..." : "Deposit"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Transfer Money</h2>
            <p className="mt-1 text-sm text-gray-500">
              Send funds securely to another wallet user.
            </p>

            <form onSubmit={handleTransfer} className="mt-5 space-y-4">
              <input
                type="email"
                placeholder="Recipient email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-black"
                required
              />

              <input
                type="number"
                inputMode="decimal"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="no-spinner w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-black"
                required
              />

              <button
                type="submit"
                disabled={transferLoading}
                className="w-full rounded-lg bg-black px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {transferLoading ? "Processing..." : "Transfer"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity Chart</h2>
            <p className="mt-1 text-sm text-gray-500">
              A simple view of your latest transaction amounts.
            </p>

            <div className="mt-6 flex h-48 items-end gap-3">
              {recentChartData.length === 0 ? (
                <p className="text-sm text-gray-500">No activity yet.</p>
              ) : (
                recentChartData.map((transaction) => (
                  <div key={transaction.id} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-blue-600"
                      style={{
                        height: `${Math.max((transaction.amount / maxAmount) * 140, 12)}px`,
                      }}
                    />
                    <span className="text-xs text-gray-500">
                      {formatTime(transaction.created_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review all wallet activity with people and times.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr className="border-b text-sm text-gray-700">
                    <td className="px-4 py-3">
                      No transactions yet. Start by depositing money.
                    </td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b text-sm text-gray-700">
                      <td className="px-4 py-3">
                        {transaction.transaction_type === "deposit"
                          ? "Deposit"
                          : transaction.transaction_type === "transfer"
                          ? "Transfer"
                          : transaction.transaction_type}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        KES {transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.sender_name
                          ? `${transaction.sender_name} (${transaction.sender_email})`
                          : "System"}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.receiver_name
                          ? `${transaction.receiver_name} (${transaction.receiver_email})`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">{formatDate(transaction.created_at)}</td>
                      <td className="px-4 py-3">{formatTime(transaction.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}