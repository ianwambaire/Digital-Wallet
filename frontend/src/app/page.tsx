export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Digital Wallet
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          A simple wallet application where users can register, log in,
          deposit money, transfer funds, and view transaction history.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/login"
                className="rounded-lg bg-black px-6 py-3 text-white transition hover:opacity-90"
              >
                Login
              </a>

              <a
                href="/register"
                className="rounded-lg border border-black px-6 py-3 transition hover:bg-black hover:text-white"
              >
                Register
              </a>
            </div>
      </div>
    </main>
  );
}