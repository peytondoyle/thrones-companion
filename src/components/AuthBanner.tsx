'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';


export default function AuthBanner() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email
    });
    if (error) alert(error.message);
    else alert('Check your email for a magic link!');
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
        </div>
      )}
    </div>
  );
}