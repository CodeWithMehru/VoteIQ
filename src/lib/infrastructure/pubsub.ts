import { PubSub } from '@google-cloud/pubsub';

let pubsub: PubSub | null = null;
try {
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    pubsub = new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
  }
} catch (error) {
  console.warn('Pub/Sub initialization failed. Falling back to mock data.', error);
}

const TOPIC_NAME = 'vote-cast-events';

/**
 * Simulates publishing a vote cast event to Google Cloud Pub/Sub.
 * In a real application, this would trigger downstream analytics or notifications.
 */
export async function publishVoteCastEvent(visitorId: string, candidateId: string) {
  const data = JSON.stringify({ visitorId, candidateId, timestamp: Date.now() });

  if (!pubsub) {
    return true;
  }

  try {
    const dataBuffer = Buffer.from(data);
    await pubsub.topic(TOPIC_NAME).publishMessage({ data: dataBuffer });
    return true;
  } catch (error) {
    console.error(`Received error while publishing to Pub/Sub:`, error);
    // Fallback to mock for hackathon constraints if credentials aren't fully set up
    return true;
  }
}
