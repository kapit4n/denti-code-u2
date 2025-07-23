'use client';
import React, { useState, useEffect } from 'react';
import { useLoginMutation } from '@/features/auth/authApiSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@denti-code.com');
  const [password, setPassword] = useState('Password123!');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const [login, { isLoading, error }] = useLoginMutation();

  useEffect(() => {
    if (error && 'data' in error) {
      const errorData = error.data as { message?: string };
      setErrorMessage(errorData.message || 'An unknown error occurred.');
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await login({ email, password }).unwrap();
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to login:', err);
      // Error message is set via the useEffect hook
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl px-8 pt-6 pb-8 mb-4">
          <h1 className="text-3xl text-center font-bold mb-8 text-gray-800">Sign In</h1>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******************"
              required
            />
          </div>
          {errorMessage && <p className="text-red-500 text-xs italic mb-4 text-center">{errorMessage}</p>}
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors duration-300"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
          <p className="text-center text-gray-500 text-xs mt-6">
            <Link href="/" className="text-blue-600 hover:underline">
              &larr; Back to Home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
