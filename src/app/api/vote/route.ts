import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { publishVoteCastEvent } from '@/lib/pubsub';
import { logVoteAnalytics } from '@/lib/bigquery';

export async function POST(request: Request) {
  try {
    const { candidateId, visitorId, voterId, name } = await request.json();

    if (!candidateId || !visitorId || !voterId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const timestamp = new Date().getTime();
    
    // Estonian Double Envelope Simulation
    const innerEnvelopeEncrypted = Buffer.from(`vote:${candidateId}:${timestamp}`).toString('base64');
    const verificationHash = Buffer.from(`verify:${visitorId}:${innerEnvelopeEncrypted}`).toString('hex').substring(0, 16).toUpperCase();

    if (!adminDb) {
      // Offline / Mock mode
      await publishVoteCastEvent(visitorId, candidateId);
      await logVoteAnalytics(visitorId);
      
      return NextResponse.json({ 
        success: true, 
        receipt: `MOCK-${verificationHash}`,
        verificationHash 
      });
    }

    const castVoteRef = adminDb.collection('cast_votes').doc(voterId);
    const tallyRef = adminDb.collection('vote_tallies').doc(candidateId);

    await adminDb.runTransaction(async (transaction) => {
      // 1. ALL READS FIRST
      const castVoteDoc = await transaction.get(castVoteRef);
      
      if (castVoteDoc.exists) {
        throw new Error("ALREADY_VOTED");
      }

      const tallyDoc = await transaction.get(tallyRef);

      // 2. ALL WRITES SECOND
      // Record who voted for whom
      transaction.set(castVoteRef, {
        voterId,
        name,
        candidateId,
        timestamp,
        verificationHash
      });

      // Increment new tally
      const newCount = tallyDoc.exists ? (tallyDoc.data()?.count || 0) + 1 : 1;
      transaction.set(tallyRef, { count: newCount }, { merge: true });
    });

    // 2. Trigger Google Cloud Services (Pub/Sub & BigQuery)
    await Promise.all([
      publishVoteCastEvent(visitorId, candidateId),
      logVoteAnalytics(visitorId)
    ]);

    return NextResponse.json({ 
      success: true, 
      receipt: `TXN-${verificationHash}`,
      verificationHash
    });

  } catch (error: any) {
    console.error('Vote API Error:', error);
    
    if (error?.message === 'ALREADY_VOTED') {
      return NextResponse.json({ error: "ALREADY_VOTED", message: "This Voter ID has already claimed a vote." }, { status: 403 });
    }
    
    if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('PERMISSION_DENIED') || error?.message?.includes('SERVICE_DISABLED')) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}
