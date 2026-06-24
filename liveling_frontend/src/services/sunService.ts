export interface SunTimes {
  sunrise: Date
  sunset: Date
}

export async function getSunTimes(lat: number, lon: number): Promise<SunTimes | null> {
  try {
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`,
    )
    const data = await res.json()
    return {
      sunrise: new Date(data.results.sunrise),
      sunset: new Date(data.results.sunset),
    }
  } catch {
    return null
  }
}

export function getPreciseTimeOfDay(
  sunrise: Date,
  sunset: Date,
): 'morning' | 'afternoon' | 'evening' | 'night' {
  const now = Date.now()
  const rise = sunrise.getTime()
  const set = sunset.getTime()
  const mid = (rise + set) / 2

  if (now < rise) {
    return 'night'
  }
  if (now < mid) {
    return 'morning'
  }
  if (now < set) {
    return 'afternoon'
  }
  if (now < set + 2 * 3600000) {
    return 'evening'
  }
  return 'night'
}
