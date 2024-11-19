import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <main className="text-center p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          NFT Based Patient Health Records
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          A secure decentralized platform for managing your health data.
        </p>
        <Link href="/sign-in">
          <button className="px-6 py-3 bg-blue-600 text-white font-medium text-lg rounded-md shadow-md hover:bg-blue-700 transition">
            Sign In
          </button>
        </Link>
      </main>

      <footer className="mt-auto py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} NFT Health Records. All rights reserved.
      </footer>
    </div>
  );
}
