export interface DndMonster {
  name: string
  type: string
  challenge_rating: number
  desc?: string
}

const BASE = 'https://www.dnd5eapi.co/api'

export async function fetchMonster(index: string): Promise<DndMonster | null> {
  try {
    const res = await fetch(`${BASE}/2014/monsters/${index}`)
    return (await res.json()) as DndMonster
  } catch {
    return null
  }
}

export async function fetchMonsterList(): Promise<string[]> {
  const cacheKey = 'dnd_monsters'
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached) as string[]
    } catch {
      // Ignore invalid cache.
    }
  }

  const res = await fetch(`${BASE}/2014/monsters`)
  const data = await res.json()
  const indices = (data.results as Array<{ index: string }>).map((r) => r.index)
  sessionStorage.setItem(cacheKey, JSON.stringify(indices))
  return indices
}

export async function getRandomMonster(
  tier: 'normal' | 'elite' | 'boss',
): Promise<DndMonster | null> {
  const crByTier: Record<'normal' | 'elite' | 'boss', string> = {
    normal: '1',
    elite: '5',
    boss: '10',
  }

  try {
    const res = await fetch(`${BASE}/2014/monsters?challenge_rating=${crByTier[tier]}`)
    const data = await res.json()
    const eligible = (data.results as Array<{ index: string }> | undefined)?.slice(0, 20) ?? []
    if (!eligible.length) {
      return null
    }
    const pick = eligible[Math.floor(Math.random() * eligible.length)]
    return fetchMonster(pick.index)
  } catch {
    return null
  }
}

export async function getRandomItemName(slot: string): Promise<string | null> {
  const categories: Record<string, string> = {
    weapon: 'weapon',
    armor: 'armor',
    ring: 'adventuring-gear',
    helm: 'adventuring-gear',
    artifact: 'adventuring-gear',
  }

  try {
    const category = categories[slot] ?? 'adventuring-gear'
    const res = await fetch(`${BASE}/2014/equipment-categories/${category}`)
    const data = await res.json()
    const equipment = data.equipment as Array<{ name: string }> | undefined
    if (!equipment?.length) {
      return null
    }
    const pick = equipment[Math.floor(Math.random() * equipment.length)]
    return pick.name
  } catch {
    return null
  }
}
