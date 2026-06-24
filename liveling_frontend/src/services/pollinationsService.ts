const BASE = 'https://image.pollinations.ai/prompt'

function buildUrl(
  prompt: string,
  opts: { width?: number; height?: number; seed?: number; model?: string } = {},
): string {
  const { width = 512, height = 512, seed, model = 'flux' } = opts
  const encoded = encodeURIComponent(prompt)
  let url = `${BASE}/${encoded}?width=${width}&height=${height}&model=${model}&nologo=true`
  if (seed !== undefined) {
    url += `&seed=${seed}`
  }
  return url
}

function stableSeeded(id: string | number): number {
  const s = String(id)
  let hash = 0
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash << 5) - hash + s.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 999999
}

export const PollinationsService = {
  userPortrait(username: string): string {
    return buildUrl(
      `fantasy RPG character portrait, ${username}, painterly style, warm lighting, detailed face, circular frame, no background`,
      { width: 256, height: 256, seed: stableSeeded(username) },
    )
  },

  forestTree(treeId: number, species = 'oak'): string {
    const stage = ['tiny sapling', 'young tree', 'mature tree', 'ancient mighty tree']
    const s = stage[Math.min(treeId % 4, 3)]
    return buildUrl(`${s} ${species}, pixel art style, top-down RPG, lush green, transparent background`, {
      width: 128,
      height: 128,
      seed: stableSeeded(`tree_${treeId}`),
    })
  },

  enemyPortrait(monsterName: string, tier: 'normal' | 'elite' | 'boss'): string {
    const tierDesc = {
      normal: 'weak, small',
      elite: 'dangerous, glowing eyes',
      boss: 'enormous, terrifying, dramatic',
    }
    return buildUrl(
      `${monsterName} ${tierDesc[tier]}, fantasy RPG monster, pixel art, dark background, intimidating`,
      { width: 200, height: 200, seed: stableSeeded(monsterName) },
    )
  },

  zoneBackground(zone: 'forest' | 'dungeon' | 'village' | 'mountain'): string {
    const prompts = {
      forest: 'enchanted forest RPG background, warm dappled light, painterly, Studio Ghibli style, wide',
      dungeon: 'dark stone dungeon RPG background, torchlight, mysterious, wide',
      village: 'cozy RPG village background, daytime, warm, detailed buildings, wide',
      mountain: 'dramatic mountain RPG background, misty peaks, fantasy, wide',
    }
    return buildUrl(prompts[zone], {
      width: 1280,
      height: 720,
      seed: stableSeeded(zone),
      model: 'flux',
    })
  },

  legendaryItemIcon(itemName: string): string {
    return buildUrl(
      `${itemName}, legendary RPG item icon, glowing, intricate detail, dark background, game icon style`,
      { width: 64, height: 64, seed: stableSeeded(itemName) },
    )
  },

  splashArt(theme = 'liveling'): string {
    return buildUrl(
      'epic fantasy RPG title screen art, hero standing in enchanted forest, warm golden light, painterly, cinematic, Studio Ghibli inspired',
      { width: 1280, height: 720, seed: stableSeeded(theme) },
    )
  },
}
