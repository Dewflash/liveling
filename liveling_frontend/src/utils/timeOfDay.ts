export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) {
    return 'morning'
  }
  if (h >= 12 && h < 17) {
    return 'afternoon'
  }
  if (h >= 17 && h < 22) {
    return 'evening'
  }
  return 'night'
}

export function applyTimeClass(tod: TimeOfDay) {
  document.body.classList.remove(
    'time-morning',
    'time-afternoon',
    'time-evening',
    'time-night',
  )
  document.body.classList.add(`time-${tod}`)
}
