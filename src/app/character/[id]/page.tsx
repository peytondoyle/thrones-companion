'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import characters from '../../data/characters.json';
import houses from '../../data/houses.json';

type Character = (typeof characters)[number];
type House = (typeof houses)[number];

export default function CharacterPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const searchParams = useSearchParams();
  const currentChapter = parseInt(searchParams.get('currentChapter') || '0', 10);
  const timestamp = searchParams.get('timestamp') || '';

  const [character, setCharacter] = useState<Character | null>(null);
  const [house, setHouse] = useState<House | null>(null);

  useEffect(() => {
    const foundChar = characters.find((c) => c.id === id);
    setCharacter(foundChar || null);

    if (foundChar?.house) {
      const match = houses.find((h) => h.name === foundChar.house);
      setHouse(match || null);
    }
  }, [id]);

  if (!character) {
    return <div className="p-6 text-xl">Character not found.</div>;
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
      <p className="text-lg mb-4">{character.description}</p>

      {house && (
        <p className="mb-2">
          <strong>House:</strong>{' '}
          <a
            href={'/house/${house.id}'}
            className="text-green-600 hover:underline"
          >
            {house.name}
          </a>
        </p>
      )}

      <p className="text-sm text-gray-600 italic">
        First seen in chapter {character.firstSeenChapter}
      </p>

      {currentChapter > 0 && (
        <div className="mt-6">
          <a
            href={'/?timestamp=${encodeURIComponent(timestamp)}'}
            className="text-purple-600 hover:underline"
          >
            ← Return to Chapter {currentChapter}
          </a>
        </div>
      )}
    </main>
  );
}