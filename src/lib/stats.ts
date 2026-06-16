export function continuousCheckins(dates: string[], today: string) {
  const set = new Set(dates);
  const cursor = new Date(`${today}T00:00:00`);
  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
