/** Seconds from session start to now (or completion). */
export function elapsedSecSince(startedAt, endAt = new Date()) {
  const start = startedAt instanceof Date ? startedAt : new Date(startedAt);
  const end = endAt instanceof Date ? endAt : new Date(endAt);
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 1000));
}
