export type TaskCategory = 'HEALTH' | 'SOCIAL' | 'WORK' | 'CUSTOM'
export type PageType = 'home' | 'missions' | 'forest' | 'game' | 'shop' | 'profile'

export interface UserProfile {
  id: string
  username: string
  total_xp: number
  vitality: number
  essence: number
  credits: number
  custom_wallet: number
  current_level: number
}

export interface TaskItem {
  id: string
  user_id: string
  title: string
  category: TaskCategory
  custom_category?: string | null
  difficulty: number
  is_completed: boolean
  created_at?: string | null
  completed_at?: string | null
}

export interface TaskCompletionResult {
  task_id: string
  user_id: string
  reward_xp: number
  applied_multiplier: number
  synergy_activated: boolean
  new_level: number
}

export type ShopItemType = 'BUY_TREE_ESSENCE' | 'BUY_SWORD_STATS' | 'BUY_STAR_POINTS'

export interface ForestSessionItem {
  id: string
  user_id: string
  species_id: string
  species_name: string
  focus_minutes: number
  reward_xp: number
  reward_essence: number
  design_id: string
  source: string
  completed_at: string
}

export interface ForestState {
  unlocked_design_ids: string[]
  sessions: ForestSessionItem[]
}

export interface ForestDesignUnlock {
  id: string
  user_id: string
  design_id: string
  cost_essence: number
  unlocked_at: string
}

export interface RPGState {
  id: string
  user_id: string
  wood: number
  iron_ore: number
  relic_shards: number
  gear_score: number
  trees_chopped: number
  last_active_at: string
}

export interface RPGHarvestResult {
  state: RPGState
  credits_gained: number
  shards_gained: number
  wood_gained: number
}

export interface RPGTickResult {
  state: RPGState
  afk_minutes: number
  credits_gained: number
  shards_gained: number
  wood_gained: number
}

export interface RPGCombatResult {
  state: RPGState
  enemy_tier: string
  credits_gained: number
  shards_gained: number
  dropped_item?: RPGItem | null
}

export interface RPGItem {
  id: string
  user_id: string
  item_name: string
  slot: string
  rarity: string
  affix: string
  power: number
  is_equipped: boolean
  created_at: string
}

export interface RPGEquipResult {
  state: RPGState
  equipped_item: RPGItem
}
