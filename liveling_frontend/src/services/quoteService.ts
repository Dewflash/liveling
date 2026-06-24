export interface Quote {
  content: string
  author: string
}

export async function fetchDailyQuote(): Promise<Quote | null> {
  const cacheKey = 'liveling_daily_quote'
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached) as Quote
    } catch {
      // Ignore invalid cache and fetch a new quote.
    }
  }

  try {
    const res = await fetch(
      'https://api.quotable.io/random?tags=inspirational,motivational&maxLength=120',
    )
    const data = await res.json()
    const payload = { content: data.content as string, author: data.author as string }
    sessionStorage.setItem(cacheKey, JSON.stringify(payload))
    return payload
  } catch {
    return null
  }
}
