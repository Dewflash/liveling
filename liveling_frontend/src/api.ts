import type {
  ForestDesignUnlock,
  RPGCombatResult,
  RPGEquipResult,
  RPGItem,
  RPGHarvestResult,
  RPGState,
  RPGTickResult,
  ForestSessionItem,
  ForestState,
  ShopItemType,
  TaskCategory,
  TaskCompletionResult,
  TaskItem,
  UserProfile,
} from './types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8000/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const data = await response.json()
      detail = data.detail ?? detail
    } catch {
      // Keep generic fallback detail when response body is not JSON.
    }
    throw new Error(detail)
  }

  return (await response.json()) as T
}

export async function createUser(username: string): Promise<UserProfile> {
  return request<UserProfile>('/users', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export async function getProfile(userId: string): Promise<UserProfile> {
  return request<UserProfile>(`/users/${userId}/profile`)
}

export async function getProfileByUsername(username: string): Promise<UserProfile> {
  return request<UserProfile>(`/users/by-username/${encodeURIComponent(username)}/profile`)
}

export async function getTasksByUser(userId: string): Promise<TaskItem[]> {
  return request<TaskItem[]>(`/tasks/user/${userId}`)
}

export async function createTask(payload: {
  user_id: string
  title: string
  category: TaskCategory
  custom_category?: string
  difficulty: number
}): Promise<TaskItem> {
  return request<TaskItem>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function completeTask(taskId: string): Promise<TaskCompletionResult> {
  return request<TaskCompletionResult>(`/tasks/${taskId}/complete`, {
    method: 'POST',
  })
}

export async function buyFromShop(payload: {
  user_id: string
  item_type: ShopItemType
  amount: number
}): Promise<{ status: string; item: string; cost: number; amount_purchased: number }> {
  return request('/shop/buy', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getForestState(userId: string): Promise<ForestState> {
  return request<ForestState>(`/forest/${userId}/state`)
}

export async function completeForestSession(payload: {
  user_id: string
  species_id: string
  species_name: string
  focus_minutes: number
  design_id: string
}): Promise<ForestSessionItem> {
  return request<ForestSessionItem>('/forest/session/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function unlockForestDesign(payload: {
  user_id: string
  design_id: string
  cost_essence: number
}): Promise<ForestDesignUnlock> {
  return request<ForestDesignUnlock>('/forest/designs/unlock', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getRPGState(userId: string): Promise<RPGState> {
  return request<RPGState>(`/rpg/${userId}/state`)
}

export async function harvestRPGNode(payload: {
  user_id: string
  node_type: string
  quantity?: number
}): Promise<RPGHarvestResult> {
  return request<RPGHarvestResult>('/rpg/harvest', {
    method: 'POST',
    body: JSON.stringify({ ...payload, quantity: payload.quantity ?? 1 }),
  })
}

export async function tickRPG(payload: { user_id: string }): Promise<RPGTickResult> {
  return request<RPGTickResult>('/rpg/tick', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function combatRPG(payload: {
  user_id: string
  enemy_tier?: string
}): Promise<RPGCombatResult> {
  return request<RPGCombatResult>('/rpg/combat', {
    method: 'POST',
    body: JSON.stringify({
      user_id: payload.user_id,
      enemy_tier: payload.enemy_tier ?? 'normal',
    }),
  })
}

export async function getRPGInventory(userId: string): Promise<RPGItem[]> {
  return request<RPGItem[]>(`/rpg/${userId}/inventory`)
}

export async function equipRPGItem(payload: {
  user_id: string
  item_id: string
}): Promise<RPGEquipResult> {
  return request<RPGEquipResult>('/rpg/equip', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
