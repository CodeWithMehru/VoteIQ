import { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '@/lib/firebase';
import { VoteTally } from '@/lib/types';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const unsubTallies = onSnapshot(collection(db, 'vote_tallies'), (snapshot) => {
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
        total: partyA + partyB + partyC
      });
      setLoading(false);
    }, (error) => {
      console.error("Error subscribing to votes", (error as unknown));
      setLoading(false);
    });

    const q = query(collection(db, 'cast_votes'), orderBy('timestamp', 'desc'));
    const unsubVotes = onSnapshot(q, (snapshot) => {
      const votes: VoteRecord[] = [];
      snapshot.forEach(doc => votes.push({ id: doc.id, ...(doc.data() as Omit<VoteRecord, 'id'>) }));
      setCastVotes(votes);
    });

    return () => {
      if (typeof unsubTallies === 'function') unsubTallies();
      if (typeof unsubVotes === 'function') unsubVotes();
    };
  }, []);

  return { tally, castVotes, loading };
}
