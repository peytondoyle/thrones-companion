'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import houses from '../../data/houses.json';
import characters from '../../data/characters.json';

type House = (typeof houses)[number];

export default function HousePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [house, setHouse] = useState<House | null>(null);

  useEffect(() => {
    const match = houses.find((h) => h.id === id);
    setHouse(match || null);
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

      <ul className="text-base space-y-2">
        <li><strong>Region:</strong> {house.region}</li>
        <li><strong>Seat:</strong> {house.seat}</li>
        {house.sigil && (
          <li>
            <strong>Sigil:</strong>{' '}
            <img src={house.sigil} alt={`${house.name} sigil`} className="h-12 mt-1" />
          </li>
        )}
      </ul>

      <div className="mt-6">
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