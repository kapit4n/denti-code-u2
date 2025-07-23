import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Welcome to Denti-Code</h1>
        <p className="text-lg mb-8 text-gray-600">Your modern dental practice assistant.</p>
        <div className="space-x-4">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
            Login
          </Link>
          <Link href="/dashboard" className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
