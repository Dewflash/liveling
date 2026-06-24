export interface WeatherState {
  isRaining: boolean
  tempC: number
  weatherCode: number
  description: string
}

function interpretCode(code: number): { isRaining: boolean; description: string } {
  if ([0].includes(code)) {
    return { isRaining: false, description: 'Clear sky' }
  }
  if ([1, 2, 3].includes(code)) {
    return { isRaining: false, description: 'Partly cloudy' }
  }
  if (code >= 51 && code <= 67) {
    return { isRaining: true, description: 'Drizzle / rain' }
  }
  if (code >= 71 && code <= 77) {
    return { isRaining: false, description: 'Snow' }
  }
  if (code >= 80 && code <= 82) {
    return { isRaining: true, description: 'Rain showers' }
  }
  if (code >= 95 && code <= 99) {
    return { isRaining: true, description: 'Thunderstorm' }
  }
  return { isRaining: false, description: 'Overcast' }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherState> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
  const res = await fetch(url)
  const data = await res.json()
  const code = data.current.weather_code as number
  const tempC = data.current.temperature_2m as number
  const { isRaining, description } = interpretCode(code)
  return { isRaining, tempC, weatherCode: code, description }
}

export async function getWeather(): Promise<WeatherState | null> {
  const cacheKey = 'liveling_weather_cache'
  const raw = sessionStorage.getItem(cacheKey)
  if (raw) {
    try {
      const cached = JSON.parse(raw) as { ts: number; payload: WeatherState }
      if (Date.now() - cached.ts < 10 * 60 * 1000) {
        return cached.payload
      }
    } catch {
      // Ignore invalid cache and fetch fresh values.
    }
  }

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
    })
    const payload = await fetchWeather(pos.coords.latitude, pos.coords.longitude)
    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), payload }))
    return payload
  } catch {
    const payload = await fetchWeather(1.35, 103.82)
    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), payload }))
    return payload
  }
}
