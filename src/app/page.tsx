// app/page.tsx
import { Suspense } from 'react';
import PageInner from './PageInner';

export const dynamic = 'force-dynamic'; // ensure no static prerender
                                   
export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <PageInner />
    </Suspense>
  );
}