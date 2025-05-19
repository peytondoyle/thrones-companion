'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import characters from '../../data/characters.json';
import houses from '../../data/houses.json';
import chapters from '../../data/chapters.json';
import metadata from '../../data/chaptersMetadata.json';
import type { User } from '@supabase/supabase-js';

// Types for our JSON imports
type Character = (typeof characters)[number];
type House = (typeof houses)[number];
type Chapter = (typeof chapters)[number];
type ChapterMeta = (typeof metadata)[number];

type EnrichedChapter = Chapter & ChapterMeta;

export default function CharacterPage() {
  // grab route & query parameters
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const searchParams = useSearchParams();
  const currentChapter = Number(searchParams.get('currentChapter') ?? 0);
  const timestamp = searchParams.get('timestamp') ?? '';

  // component state
  const [character, setCharacter] = useState<Character | null>(null);
  const [house, setHouse] = useState<House | null>(null);
  const [firstSeen, setFirstSeen] = useState<EnrichedChapter | null>(null);

  useEffect(() => {
    // 1) find character record
    const found = characters.find((c) => c.id === id) || null;
    setCharacter(found);

    // 2) lookup house if present
    if (found?.house) {
      const h = houses.find((h) => h.name === found.house) || null;
      setHouse(h);
    } else {
      setHouse(null);
    }

    // 3) enrich with first-seen chapter metadata
    if (found && typeof found.firstSeenChapter === 'number') {
      const ch = chapters.find((c) => c.number === found.firstSeenChapter);
      const meta = ch ? metadata.find((m) => m.id === ch.id) : undefined;
      if (ch && meta) {
        // merge Chapter + Meta into one object
        setFirstSeen({ ...ch, ...meta });
      } else {
        setFirstSeen(null);
      }
    }
  }, [id]);

  // if no character, show fallback
  if (!character) {
    return <div className="p-6 text-xl">Character not found.</div>;
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      {/* Name & Description */}
      <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
      <p className="text-lg mb-4">{character.description}</p>

      {/* House link */}
      {house && (
        <p className="mb-2">
          <strong>House:</strong>{' '}
          <Link href={`/house/${house.id}`} className="text-green-600 hover:underline">
            {house.name}
          </Link>
        </p>
      )}

      {/* First Seen Chapter Metadata */}
      {firstSeen && (
        <section className="mt-4 text-sm text-gray-700 space-y-1">
          <p>
            <strong>First Seen:</strong> Chapter {firstSeen.number} – {firstSeen.title}
          </p>
          {firstSeen.pov && (
            <p>
              <strong>POV:</strong> {firstSeen.pov}
            </p>
          )}
          {firstSeen.location && (
            <p>
              <strong>Location:</strong> {firstSeen.location}
            </p>
          )}
          {firstSeen.summary && (
            <p className="italic text-gray-600">{firstSeen.summary}</p>
          )}
        </section>
      )}

      {/* Back to chapter link */}
      {currentChapter > 0 && (
        <div className="mt-6">
          <Link
            href={`/?timestamp=${encodeURIComponent(timestamp)}&currentChapter=${currentChapter}`}
            className="text-purple-600 hover:underline"
          >
            ← Return to Chapter {currentChapter}
          </Link>
        </div>
      )}
    </main>
  );
}
