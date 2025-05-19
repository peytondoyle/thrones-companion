'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function AuthBanner() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: origin + '/' },
    });
    if (error) {
      alert(error.message);
    } else {
      alert('✨ Check your email for a magic link!');
    }
  };

  const handleDevLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      setUser({ id: 'dev-user', email: 'dev@local.dev' } as User);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail('');
  };

  return (
    <div
      className="
        mb-4
        flex items-center justify-between
        bg-gray-100 rounded
        h-20 px-4
      "
    >
      {/* left side */}
      <div className="flex items-center gap-2 w-96 h-full">
        {user ? (
          <span className="text-gray-700 whitespace-nowrap flex items-center h-full">
            Logged in as <strong className="ml-1">{user.email}</strong>
          </span>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 border px-2 py-1 rounded h-9"
            />
          </>
        )}
      </div>

      {/* right side */}
      <div className="flex items-center gap-2 justify-end h-full min-w-[260px]">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 whitespace-nowrap h-9 w-[96px]"
          >
            Log out
          </button>
        ) : (
          <>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 whitespace-nowrap h-9"
            >
              Send Magic Link
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={handleDevLogin}
                className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600 whitespace-nowrap h-9 w-[96px]"
              >
                DEV Login
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}