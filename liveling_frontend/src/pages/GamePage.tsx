import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { combatRPG, equipRPGItem, getRPGInventory, getRPGState, tickRPG } from '../api'
import { AudioManager } from '../audio/AudioManager'
import { EventBus, PhaserGame, RPGGameConfig } from '../game'
import type { IRefPhaserGame } from '../game'
import type { PhaserInventoryItem } from '../game/types'
import { getRandomMonster } from '../services/dndService'
import type { RPGItem, RPGState, UserProfile } from '../types'
import '../styles/GamePage.css'

interface GamePageProps {
  profile: UserProfile | null
}

interface CombatSession {
  enemyTier: 'normal' | 'elite' | 'boss'
  enemyName: string
  enemyMaxHp: number
  enemyHp: number
}

function toInventoryItems(items: RPGItem[]): PhaserInventoryItem[] {
  return items.map((item, index) => ({
    id: item.id,
    name: item.item_name,
    slot: item.slot,
    rarity: item.rarity,
    power: item.power,
    affix: item.affix,
    equipped: item.is_equipped,
    iconFrame: index % 72,
  }))
}

export function GamePage({ profile }: GamePageProps) {
  const phaserRef = useRef<IRefPhaserGame>(null)
  const [rpgState, setRpgState] = useState<RPGState | null>(null)
  const [inventory, setInventory] = useState<RPGItem[]>([])
  const [statusMessage, setStatusMessage] = useState('')
  const [afkRewards, setAfkRewards] = useState<{ minutes: number; wood: number; credits: number; shards: number } | null>(null)
  const [combatSession, setCombatSession] = useState<CombatSession | null>(null)

  useEffect(() => {
    AudioManager.playZone('rpg_explore')
  }, [])

  useEffect(() => {
    if (!profile) {
      setRpgState(null)
      setInventory([])
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const tick = await tickRPG({ user_id: profile.id })
        if (cancelled) return

        setRpgState(tick.state)
        if (tick.afk_minutes > 0) {
          setAfkRewards({
            minutes: tick.afk_minutes,
            wood: tick.wood_gained,
            credits: tick.credits_gained,
            shards: tick.shards_gained,
          })
          AudioManager.playSfx('harvest')
        }

        const [state, items] = await Promise.all([getRPGState(profile.id), getRPGInventory(profile.id)])
        if (cancelled) return
        setRpgState(state)
        setInventory(items)
        EventBus.emit('hud-update', {
          hp: 100,
          maxHp: 100,
          wood: state.wood,
          iron: state.iron_ore,
          shards: state.relic_shards,
          gear: state.gear_score,
        })
      } catch (error) {
        if (!cancelled) setStatusMessage((error as Error).message)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [profile])

  useEffect(() => {
    if (!profile) return

    const onSfx = (name: string) => AudioManager.playSfx(name as never)
    const onRequestInventory = () => EventBus.emit('inventory-data', toInventoryItems(inventory))

    const onEquipRequest = async ({ itemId }: { itemId: string }) => {
      try {
        const result = await equipRPGItem({ user_id: profile.id, item_id: itemId })
        setRpgState(result.state)
        const updated = await getRPGInventory(profile.id)
        setInventory(updated)
        EventBus.emit('inventory-data', toInventoryItems(updated))
      } catch (error) {
        setStatusMessage((error as Error).message)
      }
    }

    const onStartCombat = async ({ enemyTier }: { enemyTier: 'normal' | 'elite' | 'boss' }) => {
      const monster = await getRandomMonster(enemyTier)
      const enemyName = monster?.name ?? 'Wild Stalker'
      const enemyMaxHp = enemyTier === 'boss' ? 120 : enemyTier === 'elite' ? 70 : 40
      setCombatSession({ enemyTier, enemyName, enemyHp: enemyMaxHp, enemyMaxHp })
      AudioManager.setRpgIntensity('combat')
    }

    const onCombatAction = async ({ action, enemyTier }: { action: string; enemyTier: 'normal' | 'elite' | 'boss' }) => {
      if (!profile) return
      if (action === 'flee') {
        setCombatSession(null)
        AudioManager.setRpgIntensity('explore')
        return
      }
      if (!combatSession) return

      try {
        const result = await combatRPG({ user_id: profile.id, enemy_tier: enemyTier })
        const damage = Math.max(6, Math.floor((rpgState?.gear_score ?? 1) * 0.55 + Math.random() * 8))
        const nextHp = Math.max(0, combatSession.enemyHp - damage)
        const victory = nextHp <= 0
        setCombatSession(victory ? null : { ...combatSession, enemyHp: nextHp })
        EventBus.emit('combat-result', {
          damage,
          isCrit: damage > 12,
          enemyHpPct: nextHp / combatSession.enemyMaxHp,
          log: victory ? `Victory! +${result.credits_gained} credits` : `${combatSession.enemyName} takes ${damage} damage.`,
          victory,
        })
        setRpgState(result.state)
        if (victory) AudioManager.setRpgIntensity('explore')
      } catch (error) {
        setStatusMessage((error as Error).message)
      }
    }

    EventBus.on('sfx', onSfx)
    EventBus.on('request-inventory', onRequestInventory)
    EventBus.on('equip-request', onEquipRequest)
    EventBus.on('start-combat', onStartCombat)
    EventBus.on('combat-action', onCombatAction)

    return () => {
      EventBus.off('sfx', onSfx)
      EventBus.off('request-inventory', onRequestInventory)
      EventBus.off('equip-request', onEquipRequest)
      EventBus.off('start-combat', onStartCombat)
      EventBus.off('combat-action', onCombatAction)
    }
  }, [combatSession, inventory, profile, rpgState])

  const equippedCount = useMemo(() => inventory.filter((item) => item.is_equipped).length, [inventory])

  return (
    <div className="page game-page">
      <header className="game-header">
        <h1>Adventure Grounds</h1>
        <p>Phaser-powered world exploration, combat, and inventory overlays are active.</p>
      </header>
      <div className="game-container">
        <section className="game-arena">
          {profile ? (
            <PhaserGame ref={phaserRef} config={RPGGameConfig} style={{ width: '100%', height: '440px', borderRadius: 10 }} />
          ) : (
            <div className="rpg-canvas" style={{ display: 'grid', placeItems: 'center', color: '#f3e2c8' }}>Create a user to enter the RPG world.</div>
          )}
        </section>
        <aside className="rpg-sidebar">
          <div className="stat-row"><span>Wood</span><strong>{rpgState?.wood ?? 0}</strong></div>
          <div className="stat-row"><span>Iron Ore</span><strong>{rpgState?.iron_ore ?? 0}</strong></div>
          <div className="stat-row"><span>Relic Shards</span><strong>{rpgState?.relic_shards ?? 0}</strong></div>
          <div className="stat-row"><span>Gear Score</span><strong>{rpgState?.gear_score ?? 1}</strong></div>
          <div className="stat-row"><span>Equipped Items</span><strong>{equippedCount}</strong></div>
          {statusMessage && <p className="game-hint">{statusMessage}</p>}
        </aside>
      </div>
      <AnimatePresence>
        {afkRewards && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 200, damping: 25 }} style={{ position: 'fixed', top: 84, right: 18, zIndex: 1600, minWidth: 260, padding: '14px 16px', borderRadius: 12, background: 'var(--panel-bg)', border: '1px solid var(--color-gold)', boxShadow: 'var(--shadow-soft)' }}>
            <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--font-heading)', color: 'var(--color-gold)' }}>While you were away...</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>{afkRewards.minutes} min AFK rewards</p>
            <p style={{ margin: '8px 0 0', color: 'var(--text-primary)', fontSize: 13 }}>+{afkRewards.wood} wood, +{afkRewards.credits} credits, +{afkRewards.shards} shards</p>
            <button type="button" style={{ marginTop: 10 }} onClick={() => setAfkRewards(null)}>Nice</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
