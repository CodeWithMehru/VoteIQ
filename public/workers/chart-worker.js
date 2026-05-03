/**
 * Singularity Node 2: OffscreenCanvas Chart Worker
 * Offloads all rendering cycles from the main thread.
 */

self.onmessage = (event) => {
  const { canvas, tally } = event.data;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  const parties = [
    { name: 'Party A', votes: tally.partyA, color: '#2563eb' },
    { name: 'Party B', votes: tally.partyB, color: '#10b981' },
    { name: 'Party C', votes: tally.partyC, color: '#f59e0b' },
  ];

  const total = tally.total || 1;
  const barHeight = 40;
  const gap = 20;

  parties.forEach((p, i) => {
    const y = i * (barHeight + gap) + 10;
    const barWidth = (p.votes / total) * (width - 40);

    // Draw background
    ctx.fillStyle = '#f3f4f6';
    ctx.roundRect(20, y, width - 40, barHeight, 8);
    ctx.fill();

    // Draw value
    ctx.fillStyle = p.color;
    ctx.roundRect(20, y, barWidth, barHeight, 8);
    ctx.fill();

    // Draw text
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${p.name}: ${p.votes}`, 30, y + 25);
  });
};
