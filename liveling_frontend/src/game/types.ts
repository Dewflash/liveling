export interface PhaserInventoryItem {
  id: string
  name: string
  slot: string
  rarity: string
  power: number
  affix: string
  equipped: boolean
  iconFrame: number
}

export interface PhaserCombatPayload {
  enemyId: string
  enemyType: string
  enemyTier: 'normal' | 'elite' | 'boss'
  enemyHp: number
  enemyMaxHp: number
}

export interface PlantedTreeSprite {
  id: string | number
  species: string
  growthStage: number
  x: number
  y: number
  iconUrl?: string
  label?: string
}
