import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">Multi-Bank CRM System</h1>
        <p className="text-xl text-gray-600 mb-8">Manage users across all three banks</p>
        <Link
          href="/admin"
          className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
        >
          Go to Admin Panel
        </Link>
      </div>
    </div>
  );
}
