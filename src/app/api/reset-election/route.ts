import { NextResponse } from 'next/server';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/infrastructure/firebase_admin_service';

export async function POST(): Promise<NextResponse> {
  try {
    if (!adminDb) return NextResponse.json({ success: true, mock: true });

    const batch = adminDb.batch();

    // 1. Delete all voters in the cast_votes registry
    const voters = await adminDb.collection('cast_votes').get();
    voters.forEach((doc: QueryDocumentSnapshot) => batch.delete(doc.ref));

    // 2. Reset all candidate tallies to 0
    const tallies = await adminDb.collection('vote_tallies').get();
    tallies.forEach((doc: QueryDocumentSnapshot) => batch.set(doc.ref, { count: 0 }, { merge: true }));

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Reset Election Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
