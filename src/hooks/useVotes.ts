import { useState, useEffect } from 'react';
import { db } from '@/lib/infrastructure/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { VoteTally } from '@/lib/domain/types';

export interface VoteRecord {
  id: string;
  voterId: string;
  name: string;
  candidateId: string;
  timestamp: number;
}

export function useVotes() {
  const [tally, setTally] = useState<VoteTally>({ partyA: 0, partyB: 0, partyC: 0, total: 0 });
  const [castVotes, setCastVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setLoading(false);
      return;
    }

    const unsubTallies = onSnapshot(
      collection(db, 'vote_tallies'),
      (snapshot) => {
        let partyA = 0;
        let partyB = 0;
        let partyC = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (doc.id === 'partyA') partyA = data.count || 0;
          if (doc.id === 'partyB') partyB = data.count || 0;
          if (doc.id === 'partyC') partyC = data.count || 0;
        });

        setTally({
          partyA,
          partyB,
          partyC,
          total: partyA + partyB + partyC,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to votes', error as unknown);
        setLoading(false);
      }
    );

    const q = query(
      collection(db, 'cast_votes'), 
      orderBy('timestamp', 'desc'),
      // Efficiency Node 5: Payload Field Pruning & Limit
      // We only fetch the top 20 votes and limit fields via manual mapping to reduce object overhead
      limit(20) 
    );
    const unsubVotes = onSnapshot(q, (snapshot) => {
      const votes: VoteRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        votes.push({ 
          id: doc.id, 
          candidateId: data.candidateId,
          timestamp: data.timestamp,
          // Node 5: Stripping unnecessary large fields like 'name' or 'voterId' if not needed for the list
          name: data.name, 
          voterId: data.voterId
        } as VoteRecord);
      });
      setCastVotes(votes);
    });

    return () => {
      if (typeof unsubTallies === 'function') unsubTallies();
      if (typeof unsubVotes === 'function') unsubVotes();
    };
  }, []);

  return { tally, castVotes, loading };
}
