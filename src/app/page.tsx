'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import chapters from './data/chapters.json';
import characters from './data/characters.json';
import houses from './data/houses.json';
import AuthBanner from '@/components/AuthBanner';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const searchParams = useSearchParams();
  const [timestamp, setTimestamp] = useState('');
  const [currentChapter, setCurrentChapter] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  // Load logged-in user's progress
  useEffect(() => {
    const loadUserAndProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('progress')
          .select('timestamp, chapter')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setTimestamp(data.timestamp);
          setCurrentChapter(data.chapter);
        }
      }
    };

    loadUserAndProgress();
  }, []);

  // Auto-sync from URL if ?timestamp=hh:mm:ss is present
  useEffect(() => {
    const fromUrl = searchParams.get('timestamp');
    if (fromUrl) {
      setTimestamp(fromUrl);

      const [h, m, s] = fromUrl.split(':').map(Number);
      const totalSeconds = h * 3600 + m * 60 + s;

      const matched = chapters.find((ch) => {
        const [sh, sm, ss] = ch.startTime.split(':').map(Number);
        const [eh, em, es] = ch.endTime.split(':').map(Number);
        const start = sh * 3600 + sm * 60 + ss;
        const end = eh * 3600 + em * 60 + es;
        return totalSeconds >= start && totalSeconds <= end;
      });

      if (matched) {
        setCurrentChapter(matched.number);
      }
    }
  }, [searchParams]);

  const handleSync = async () => {
    const [h, m, s] = timestamp.split(':').map(Number);
    const totalSeconds = h * 3600 + m * 60 + s;

    const matched = chapters.find((ch) => {
      const [sh, sm, ss] = ch.startTime.split(':').map(Number);
      const [eh, em, es] = ch.endTime.split(':').map(Number);
      const start = sh * 3600 + sm * 60 + ss;
      const end = eh * 3600 + em * 60 + es;
      return totalSeconds >= start && totalSeconds <= end;
    });

    const matchedChapter = matched?.number ?? null;
    setCurrentChapter(matchedChapter);

    if (user && matchedChapter !== null) {
      await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          timestamp,
          chapter: matchedChapter
        });
    }
  };

  const unlockedCharacters = characters.filter(
    (char) => currentChapter && char.firstSeenChapter <= currentChapter
  );

  return (
    <main className="p-6 max-w-xl mx-auto">
      <AuthBanner />
      <h1 className="text-3xl font-bold mb-4">Thrones Companion</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Current Audiobook Timestamp (hh:mm:ss):</label>
        <input
          type="text"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          placeholder="e.g. 00:15:00"
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={handleSync}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Sync Chapter
        </button>
      </div>

      {currentChapter && (
        <>
          <h2 className="text-xl font-semibold mt-6">📘 Chapter {currentChapter}</h2>
          <ul className="list-disc ml-6 mt-2">
            {chapters.find((ch) => ch.number === currentChapter)?.characters.map((char) => {
              const match = characters.find((c) => c.name === char);
              return (
                <li key={char}>
                  {match ? (
                    <Link
                      href={`/character/${match.id}?currentChapter=${currentChapter}&timestamp=${encodeURIComponent(timestamp)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {char}
                    </Link>
                  ) : (
                    char
                  )}
                </li>
              );
            })}
          </ul>

          <h3 className="text-lg font-semibold mt-6">🏠 Houses in this Chapter:</h3>
          <ul className="list-disc ml-6 mt-2">
            {chapters.find((ch) => ch.number === currentChapter)?.houses.map((house) => {
              const match = houses.find((h) => h.name === house);
              return (
                <li key={house}>
                  {match ? (
                    <Link
                      href={`/house/${match.id}`}
                      className="text-green-600 hover:underline"
                    >
                      {house}
                    </Link>
                  ) : (
                    house
                  )}
                </li>
              );
            })}
          </ul>

          <h3 className="text-lg font-semibold mt-6">🎭 Characters You've Met So Far:</h3>
          <ul className="list-disc ml-6 mt-2">
            {unlockedCharacters.map((char) => (
              <li key={char.name}>
                <Link
                  href={`/character/${char.id}?currentChapter=${currentChapter}&timestamp=${encodeURIComponent(timestamp)}`}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {char.name}
                </Link>{' '}
                – {char.description}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}