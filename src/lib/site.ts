export const CAREER_START = new Date(2017, 5, 1)

export function fullYearsSince(start: Date, now = new Date()): number {
  const years = now.getFullYear() - start.getFullYear()
  return now.getMonth() < start.getMonth() ? years - 1 : years
}

// Evaluated at build time, so the number advances with each deploy
export const experienceYears = fullYearsSince(CAREER_START)
