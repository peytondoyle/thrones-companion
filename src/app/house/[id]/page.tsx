'use client';

import { useEffect, useState } from 'react';
import { useParams }           from 'next/navigation';
import Link                    from 'next/link';
import houses                  from '../../data/houses.json';
import characters              from '../../data/characters.json';
import chapters                from '../../data/chapters.json';
import metadata                from '../../data/chaptersMetadata.json';

type Chapter    = (typeof chapters)[number];
type Meta       = (typeof metadata)[number];
type Enriched   = Chapter & Omit<Meta,'id'>;
type House      = (typeof houses)[number];

export default function HousePage() {
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';

  const [house, setHouse]             = useState<House|null>(null);
  const [firstMention, setFirstMention] = useState<Enriched|null>(null);

  useEffect(() => {
    // 1) find the house
    const h = houses.find((h) => h.id === id) || null;
    setHouse(h);

    if (h) {
      // 2) collect all firstSeenChapter numbers for its notableMembers
      const seen = h.notableMembers
        .map((nm) => characters.find((c) => c.name === nm)?.firstSeenChapter)
        .filter((n): n is number => typeof n === 'number');

      if (seen.length) {
        const earliestNum = Math.min(...seen);

        // 3) build enriched chapters once
        const enriched = (chapters.map((ch) => ({
          ...ch,
          ...(metadata.find((m) => m.id === ch.id) || {}),
        })) as Enriched[]);

        // 4) pick the one matching earliestNum
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
      {/* ——— Gradient header using the house’s own colors ——— */}
      <div
        className="rounded-xl p-6 mb-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${house.colors[0]}, ${house.colors[1]})`
        }}
      >
        <h1 className="text-3xl font-bold">{house.name}</h1>
        <p className="italic text-lg">{house.motto}</p>
      </div>

      {/* Basic house info */}
      <ul className="text-base space-y-2 mb-6">
        <li><strong>Region:</strong> {house.region}</li>
        <li><strong>Seat:</strong> {house.seat}</li>
        {house.sigil && (
          <li>
            <strong>Sigil:</strong>{' '}
            <img
              src={house.sigil}
              alt={`${house.name} sigil`}
              className="h-12 inline-block mt-1"
            />
          </li>
        )}
      </ul>

      {/* First mention details */}
      {firstMention && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold">First Mention</h2>
          <p className="mt-1">
            Chapter {firstMention.number}: <strong>{firstMention.title}</strong>
          </p>
          <p><strong>POV:</strong> {firstMention.pov}</p>
          <p><strong>Location:</strong> {firstMention.location}</p>
          <p className="italic text-gray-600 mt-1">
            {firstMention.summary}
          </p>
          <Link
            href={`/?timestamp=${firstMention.startTime}&currentChapter=${firstMention.number}`}
            className="text-purple-600 hover:underline inline-block mt-2"
          >
            ↳ Go to Chapter
          </Link>
        </div>
      )}

      {/* Notable members list */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Notable Members</h2>
        <ul className="list-disc ml-6 space-y-1">
          {house.notableMembers.map((nm) => (
            <li key={nm}>{nm}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}