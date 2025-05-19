'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import chapters from './data/chapters.json';
import metadata from './data/chaptersMetadata.json';
import characters from './data/characters.json';
import houses from './data/houses.json';
import AuthBanner from '@/components/AuthBanner';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// type Chapter = (typeof chapters)[number];
type Meta = (typeof metadata)[number];

export default function PageInner() {
  const searchParams = useSearchParams();
  const [timestamp, setTimestamp] = useState('');
  const [currentChapter, setCurrentChapter] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Enrich chapters with metadata, including the numeric chapter
  const enriched = chapters.map((ch) => ({
    ...ch,
    ...(metadata.find((m) => m.id === ch.id) || {}) as Omit<Meta, 'id'>,
  }));

  // Load user & saved progress
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from('progress')
          .select('timestamp, chapter')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setTimestamp(data.timestamp);
              setCurrentChapter(data.chapter);
            }
          });
      }
    });
  }, []);

  // Auto‐sync from ?timestamp=...
  useEffect(() => {
    const fromUrl = searchParams.get('timestamp');
    if (fromUrl) {
      setTimestamp(fromUrl);
      const matched = findChapterByTimestamp(fromUrl);
      if (matched) setCurrentChapter(matched.number);
    }
  }, [searchParams]);

  // find helper
  const findChapterByTimestamp = (time: string) => {
    const [h, m, s] = time.split(':').map(Number);
    const total = h * 3600 + m * 60 + s;
    return enriched.find((ch) => {
      const [sh, sm, ss] = ch.startTime.split(':').map(Number);
      const [eh, em, es] = ch.endTime.split(':').map(Number);
      const start = sh * 3600 + sm * 60 + ss;
      const end = eh * 3600 + em * 60 + es;
      return total >= start && total <= end;
    });
  };

  // Sync button
  const handleSync = async () => {
    const matched = findChapterByTimestamp(timestamp);
    const chap = matched?.number ?? null;
    setCurrentChapter(chap);
    if (user && chap !== null) {
      await supabase
        .from('progress')
        .upsert({ user_id: user.id, timestamp, chapter: chap });
    }
  };

  // unlocked characters so far
  const unlocked = characters.filter(
    (c) => currentChapter !== null && c.firstSeenChapter <= currentChapter
  );

  // active chapter
  const active = currentChapter
    ? enriched.find((ch) => ch.number === currentChapter)
    : null;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <AuthBanner />

      <h1 className="text-3xl font-bold mb-4">Thrones Companion</h1>

      {/* Timestamp input */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">
          Current Audiobook Timestamp (hh:mm:ss):
        </label>
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

      {/* Active chapter display */}
      {active && (
        <>
          <h2 className="text-xl font-semibold mt-6">{active.title}</h2>
          {active.location && (
            <p className="text-sm italic text-gray-600 mb-2">{active.location}</p>
          )}
          {active.summary && <p className="mb-4">{active.summary}</p>}

          {active.pov && (
            <>
              <h3 className="text-lg font-semibold mt-4">POV Character:</h3>
              <ul className="list-disc ml-6 mt-2">
                <li>{active.pov}</li>
              </ul>
            </>
          )}

          {active.houses?.length ? (
            <>
              <h3 className="text-lg font-semibold mt-6">Houses in this Chapter:</h3>
              <ul className="list-disc ml-6 mt-2">
                {active.houses.map((houseName) => {
                  const h = houses.find((x) => x.name === houseName);
                  return (
                    <li key={houseName}>
                      {h ? (
                        <Link href={`/house/${h.id}`} className="text-green-600 hover:underline">
                          {houseName}
                        </Link>
                      ) : (
                        houseName
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          <h3 className="text-lg font-semibold mt-6">
            Characters You&apos;ve Met So Far:
          </h3>
          <ul className="list-disc ml-6 mt-2">
            {unlocked.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/character/${c.id}?currentChapter=${currentChapter}&timestamp=${encodeURIComponent(
                    timestamp
                  )}`}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {c.name}
                </Link>{' '}
                – {c.description}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}