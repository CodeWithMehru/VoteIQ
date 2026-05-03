import { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy, limit } from '@/lib';
import { VoteTally } from '@/lib';
import type {
  QuerySnapshot,
  DocumentData,
  FirestoreError,
  Unsubscribe,
} from 'firebase/firestore';

export interface VoteRecord {
  readonly id: string;
  readonly voterId: string;
  readonly name: string;
  readonly candidateId: string;
  readonly timestamp: number;
}

interface UseVotesReturn {
  readonly tally: VoteTally;
  readonly castVotes: VoteRecord[];
  readonly loading: boolean;
}

export function useVotes(): UseVotesReturn {
  const [tally, setTally] = useState<VoteTally>({ partyA: 0, partyB: 0, partyC: 0, total: 0 });
  const [castVotes, setCastVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect((): (() => void) | undefined => {
    if (!db) {
      setLoading(false);
      return undefined;
    }

    const unsubTallies: Unsubscribe = onSnapshot(
      collection(db, 'vote_tallies'),
      (snapshot: QuerySnapshot<DocumentData>): void => {
        let partyA = 0;
        let partyB = 0;
        let partyC = 0;

        snapshot.forEach((doc): void => {
          const data = doc.data();
          if (doc.id === 'partyA') partyA = (data.count as number) || 0;
          if (doc.id === 'partyB') partyB = (data.count as number) || 0;
          if (doc.id === 'partyC') partyC = (data.count as number) || 0;
        });

        setTally({ partyA, partyB, partyC, total: partyA + partyB + partyC });
        setLoading(false);
      },
      (error: FirestoreError): void => {
        console.error('Error subscribing to votes', error);
        setLoading(false);
      }
    );

    const q = query(
      collection(db, 'cast_votes'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const unsubVotes: Unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>): void => {
      const votes: VoteRecord[] = [];
      snapshot.forEach((doc): void => {
        const data = doc.data();
        votes.push({
          id: doc.id,
          candidateId: (data.candidateId as string) || '',
          timestamp: (data.timestamp as number) || 0,
          name: (data.name as string) || '',
          voterId: (data.voterId as string) || '',
        } satisfies VoteRecord);
      });
      setCastVotes(votes);
    });

    return (): void => {
      unsubTallies();
      unsubVotes();
    };
  }, []);

  return { tally, castVotes, loading };
}
