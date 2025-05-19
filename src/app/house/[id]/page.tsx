'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import houses from '../../data/houses.json';
import characters from '../../data/characters.json';
import chapters from '../../data/chapters.json';
import metadata from '../../data/chaptersMetadata.json';
import type { User } from '@supabase/supabase-js';

// Combined enriched chapter type
type Chapter = (typeof chapters)[number];
type Meta = (typeof metadata)[number];
type Enriched = Chapter & Omit<Meta, 'id'>;
type House = (typeof houses)[number];

export default function HousePage() {
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const [house, setHouse] = useState<House | null>(null);
  const [firstMention, setFirstMention] = useState<Enriched | null>(null);

  // Find house and earliest chapter
  useEffect(() => {
    const h = houses.find((h) => h.id === id) || null;
    setHouse(h);

    if (h) {
      // get all firstSeenChapter numbers of notable members
      const seenChapters = h.notableMembers
        .map((name) => characters.find((c) => c.name === name)?.firstSeenChapter)
        .filter((n): n is number => typeof n === 'number');

      if (seenChapters.length) {
        const earliestNum = Math.min(...seenChapters);
        // find enriched chapter
        const enriched = chapters
          .map((ch) => ({
            ...ch,
            ...(metadata.find((m) => m.id === ch.id) || {}),
          })) as Enriched[];
        const first = enriched.find((ch) => ch.number === earliestNum) || null;
        setFirstMention(first);
      }
    }
  }, [id]);

  if (!house) {
    return <div className="p-6 text-xl">House not found.</div>;
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="rounded-xl p-6 mb-4 bg-gray-800 text-white">
        <h1 className="text-3xl font-bold">{house.name}</h1>
        <p className="italic text-lg">{house.motto}</p>
      </div>

      <ul className="text-base space-y-2 mb-6">
        <li><strong>Region:</strong> {house.region}</li>
        <li><strong>Seat:</strong> {house.seat}</li>
        {house.sigil && (
          <li>
            <strong>Sigil:</strong>{' '}
            <img src={house.sigil} alt={`${house.name} sigil`} className="h-12 mt-1 inline-block" />
          </li>
        )}
      </ul>

      {firstMention && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold">First Mention</h2>
          <p className="mt-1">
            Chapter {firstMention.number}: <strong>{firstMention.title}</strong>
          </p>
          <p><strong>POV:</strong> {firstMention.pov}</p>
          <p><strong>Location:</strong> {firstMention.location}</p>
          <p className="italic text-gray-600 mt-1">{firstMention.summary}</p>
          <Link
            href={`/?timestamp=${firstMention.startTime}&currentChapter=${firstMention.number}`}
            className="text-purple-600 hover:underline mt-2 inline-block"
          >
            ↳ Go to Chapter
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Notable Members</h2>
        <ul className="list-disc ml-6 space-y-1">
          {house.notableMembers.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}