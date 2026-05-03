
import { BigQuery, RowMetadata } from '@google-cloud/bigquery';

let bigquery: BigQuery | null = null;
try {
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    bigquery = new BigQuery({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
  }
} catch (error: unknown) {
  console.warn('BigQuery initialization failed. Falling back to mock data.', error);
}

const DATASET_ID = 'voteiq_analytics';
const TABLE_ID = 'voting_demographics';

export interface VotingTrendRow {
  readonly hour: string;
  readonly votes: number;
}

/**
 * Simulates logging anonymized vote analytics to Google Cloud BigQuery.
 */
export async function logVoteAnalytics(visitorId: string): Promise<boolean> {
  const row: RowMetadata = {
    anonymized_id: visitorId,
    voted_at: BigQuery.timestamp(new Date()),
    browser_type: 'Unknown',
  };

  if (!bigquery) {
    return true;
  }

  try {
    await bigquery.dataset(DATASET_ID).table(TABLE_ID).insert([row]);
    return true;
  } catch (error: unknown) {
    console.error('Error inserting into BigQuery:', error);
    return true;
  }
}

/**
 * Simulates retrieving aggregated data from BigQuery for the Dashboard.
 */
export async function getVotingTrends(): Promise<VotingTrendRow[]> {
  const mockData: VotingTrendRow[] = [
    { hour: '08:00', votes: 120 },
    { hour: '09:00', votes: 340 },
    { hour: '10:00', votes: 510 },
    { hour: '11:00', votes: 890 },
    { hour: '12:00', votes: 1050 },
  ];

  if (!bigquery) {
    return mockData;
  }

  try {
    const query = `
      SELECT FORMAT_TIMESTAMP('%H:00', voted_at) as hour, COUNT(*) as votes
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET_ID}.${TABLE_ID}\`
      GROUP BY hour
      ORDER BY hour ASC
      LIMIT 10
    `;
    const [job] = await bigquery.createQueryJob({ query });
    const [rows] = await job.getQueryResults();
     
    return rows as VotingTrendRow[];
  } catch (error: unknown) {
    console.error('Error querying BigQuery:', error);
    return [
      { hour: '08:00', votes: 120 },
      { hour: '09:00', votes: 340 },
      { hour: '10:00', votes: 510 },
    ];
  }
}
