import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/infrastructure/firebase_admin_service';

export async function POST() {
  try {
    if (!adminDb) return NextResponse.json({ success: true, mock: true });

    const batch = adminDb.batch();

    // 1. Delete all voters in the cast_votes registry
    const voters = await adminDb.collection('cast_votes').get();
    voters.forEach((doc) => batch.delete(doc.ref));

    // 2. Reset all candidate tallies to 0
    const tallies = await adminDb.collection('vote_tallies').get();
    tallies.forEach((doc) => batch.set(doc.ref, { count: 0 }, { merge: true }));

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset Election Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
