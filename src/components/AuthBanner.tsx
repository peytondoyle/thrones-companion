'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function AuthBanner() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // 1) Fetch initial user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // 2) Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 3) Cleanup
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: origin + '/' },
    });
    if (error) alert(error.message);
    else alert('✨ Check your email for a magic link!');
  };

  const handleDevLogin = () => {
    // only in dev: impersonate a test user
    if (process.env.NODE_ENV === 'development') {
      setUser({ id: 'dev-user-id', email: 'dev@local.dev' } as User);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail('');
  };

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded">
      {user ? (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Logged in as <strong>{user.email}</strong>
          </p>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Real magic-link login */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Send Magic Link
          </button>

          {/* DEV Login for local testing */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleDevLogin}
              className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600"
            >
              DEV Login
            </button>
          )}
        </div>
      )}
    </div>
);
}