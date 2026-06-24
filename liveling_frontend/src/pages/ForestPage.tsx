import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type Phaser from 'phaser'

import { completeForestSession, getForestState, unlockForestDesign } from '../api'
import { AudioManager } from '../audio/AudioManager'
import { LeafParticles, RainParticles } from '../components'
import { EventBus, ForestGameConfig, PhaserGame } from '../game'
import type { PlantedTreeSprite } from '../game/types'
import { getWeather } from '../services/weatherService'
import type { UserProfile } from '../types'
import '../styles/ForestPage.css'

type ForestTab = 'focus' | 'grove' | 'store' | 'catalog'

type Species = {
  id: string
  name: string
  icon: string
  growMinutes: number
  mood: string
  designId: string
}

type TreeDesign = {
  id: string
  name: string
  costEssence: number
  sourceType: 'generated' | 'online' | 'local'
  sourceLabel: string
  imageUrl: string
  rarity: 'common' | 'rare' | 'epic'
}

const TREE_NAME_BY_ID: Record<number, string> = {
  1: 'Cedar',
  2: 'Flower Tree',
  3: 'Treehouse',
  4: 'Nest',
  5: 'Lemon Tree',
  6: 'Triplets',
  7: 'Flower Bush',
  8: 'Octopus',
  9: 'Cherry Blossom',
  10: 'Coconut Tree',
  11: 'Kitty',
  12: 'Flourishing Grass',
  13: 'Chinese Pine Tree',
  14: 'Ball Cactus',
  32: 'Earth Day Tree',
  33: 'Carnation',
  34: 'Apple Tree',
  35: 'Starry Tree',
  36: 'Cuckoo Clock',
  37: 'Moon Tree',
  38: 'Rainbow Flower',
  39: 'Ghost Mushroom',
  40: 'Blue Oak Tree',
  41: 'Oak Tree',
  42: 'Pink Oak Tree',
  43: 'Yellow Oak Tree',
  44: 'Purple Oak Tree',
  45: 'Cat-Tail Willow',
  46: 'Blue Flower',
  47: 'Star Coral',
  48: 'Black Forest Cake',
  49: 'Blueberry Cake',
  50: 'Cherry Cheese Cake',
  51: 'Chocolate Strawberry Cake',
  52: 'Lemon Cake',
  53: 'Matcha Azuki Cake',
  54: 'Strawberry Chiffon Cake',
  55: 'Tiramisu',
  56: '5th Anniversary Tree',
  57: 'Doggo Tree',
  58: "Bear's Paw",
  59: 'Starburst',
  60: 'Unicorn Tree',
  61: 'Space Tree',
  62: 'Celestial Tree',
  63: 'Weeping Willow',
  64: 'Four-Leaf Clover',
  65: 'Forest Spirit',
  66: '6th Anniversary Tree',
  67: 'Water Spirit',
  68: 'Sundae Tree',
  69: 'Lover Tree',
  70: 'Pear Tree House',
  71: 'Witch Mushroom',
  72: 'Lily Flower',
  73: 'Twilight Guardian',
  74: 'Tulips',
  75: 'Plum Blossom',
  76: 'Camellia',
  77: 'Luminie',
  78: '7th Anniversary Tree',
  79: 'Lavender',
  80: 'Rice',
  81: 'Statue of Tada',
  82: 'Golden Wings',
  83: 'Osmanthus',
  84: 'Cosmos',
  85: 'Wishing Tree',
  86: 'Lantern Flower',
  87: 'Narcissus',
  88: 'TinyTAN - j-hope (Buttercup)',
  89: 'TinyTAN - Jimin (Spirea)',
}

const PRIMARY_TREE_LIMIT = 45
const TREE_IDS = Array.from({ length: 89 }, (_, index) => index + 1)

function getTreeAssetPath(iconId: number): string {
  const fileName = `tree_${String(iconId).padStart(2, '0')}.svg`
  if (iconId <= PRIMARY_TREE_LIMIT) {
    return `/trees/forest-svg/${fileName}`
  }
  return `/trees/forest-svg-batch2/${fileName}`
}

function getTreeSourceLabel(iconId: number): string {
  return iconId <= PRIMARY_TREE_LIMIT ? 'Forest Trees SVG pack' : 'Forest Trees batch 2 SVG pack'
}

const treeDesigns: TreeDesign[] = TREE_IDS.map((iconId, index) => {
  const rarity: TreeDesign['rarity'] = index < 10 ? 'common' : index < 20 ? 'rare' : 'epic'
  const costEssence = index === 0 ? 0 : rarity === 'common' ? 35 + index * 2 : rarity === 'rare' ? 95 + index * 2 : 145 + index * 2

  return {
    id: `tree-${iconId}`,
    name: TREE_NAME_BY_ID[iconId] ?? `Forest Tree ${iconId}`,
    costEssence,
    sourceType: 'local',
    sourceLabel: getTreeSourceLabel(iconId),
    imageUrl: getTreeAssetPath(iconId),
    rarity,
  }
})

const designIds = new Set(treeDesigns.map((design) => design.id))

const legacyDesignIdMap: Record<string, string> = {
  'oak-original': 'tree-41',
  'pine-original': 'tree-13',
  'maple-original': 'tree-34',
  'bonsai-online': 'tree-12',
  'bonsai-breeze': 'tree-12',
  'cedar-online': 'tree-1',
  'cedar-mist': 'tree-1',
  'custom-tree': 'tree-2',
}

const speciesDefaultDesignId: Record<string, string> = {
  oak: 'tree-41',
  pine: 'tree-13',
  maple: 'tree-34',
  bamboo: 'tree-12',
  birch: 'tree-42',
  cedar: 'tree-1',
}

function resolveTreeDesignId(designId?: string, speciesId?: string): string {
  if (designId) {
    if (designIds.has(designId)) {
      return designId
    }

    const legacyId = legacyDesignIdMap[designId]
    if (legacyId && designIds.has(legacyId)) {
      return legacyId
    }
  }

  if (speciesId) {
    const speciesDesignId = speciesDefaultDesignId[speciesId]
    if (speciesDesignId && designIds.has(speciesDesignId)) {
      return speciesDesignId
    }
  }

  return treeDesigns[0].id
}

function resolveTreeDesignBySession(designId?: string, speciesId?: string): TreeDesign {
  const resolvedDesignId = resolveTreeDesignId(designId, speciesId)
  return treeDesigns.find((design) => design.id === resolvedDesignId) ?? treeDesigns[0]
}

function buildDefaultUnlockedDesignIds(profile: UserProfile | null): string[] {
  if (!profile) {
    return [treeDesigns[0].id]
  }

  const unlockCount = Math.max(1, Math.ceil(treeDesigns.length * 0.5))
  return treeDesigns.slice(0, unlockCount).map((design) => design.id)
}

function normalizeUnlockedDesignIds(ids: string[], profile: UserProfile | null): string[] {
  const baseline = buildDefaultUnlockedDesignIds(profile)
  return Array.from(new Set([...baseline, ...ids])).filter((id) => designIds.has(id))
}

type PlantedTree = {
  id: string
  speciesId: string
  icon: string
  name: string
  focusMinutes: number
  plantedAt: string
  designId: string
  designUrl: string
}

function normalizeSessionName(rawName: string, speciesId: string, designName: string): string {
  const trimmed = rawName.trim()
  const lower = trimmed.toLowerCase()

  if (trimmed && lower !== 'tree' && lower !== 'trees') {
    return trimmed
  }

  const speciesLabelById: Record<string, string> = {
    oak: 'Oak Sprout',
    pine: 'Pine Whisper',
    maple: 'Maple Ember',
    bamboo: 'Bamboo Pulse',
  }

  const speciesLabel = speciesLabelById[speciesId] ?? 'Forest Sprout'
  return `${speciesLabel} (${designName})`
}

interface ForestPageProps {
  profile: UserProfile | null
  onSpendEssence?: (amount: number) => Promise<void> | void
  onForestSessionComplete?: (reward: { xp: number; essence: number }) => Promise<void> | void
}

const speciesList: Species[] = [
  { id: 'oak', name: 'Oak Sprout', icon: '🌳', growMinutes: 25, mood: 'steady', designId: 'tree-41' },
  { id: 'pine', name: 'Pine Whisper', icon: '🌲', growMinutes: 35, mood: 'deep', designId: 'tree-13' },
  { id: 'maple', name: 'Maple Ember', icon: '🍁', growMinutes: 20, mood: 'warm', designId: 'tree-34' },
  { id: 'bamboo', name: 'Bamboo Pulse', icon: '🎍', growMinutes: 15, mood: 'quick', designId: 'tree-12' },
]

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function ForestPage({ profile, onSpendEssence, onForestSessionComplete }: ForestPageProps) {
  const userScope = profile?.id ?? 'guest'
  const unlockedKey = `liveling_forest_unlocked_${userScope}`
  const plantedKey = `liveling_forest_planted_${userScope}`

  const [activeTab, setActiveTab] = useState<ForestTab>('focus')
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(speciesList[0].id)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(speciesList[0].growMinutes * 60)
  const [forestBusy, setForestBusy] = useState(false)
  const [forestMessage, setForestMessage] = useState('')
  const [isRaining, setIsRaining] = useState(false)
  const [plantedTrees, setPlantedTrees] = useState<PlantedTree[]>(() => {
    const raw = localStorage.getItem(plantedKey)
    if (!raw) {
      return []
    }
    try {
      return JSON.parse(raw) as PlantedTree[]
    } catch {
      return []
    }
  })
  const [unlockedDesignIds, setUnlockedDesignIds] = useState<string[]>(() => {
    const raw = localStorage.getItem(unlockedKey)
    if (!raw) {
      return buildDefaultUnlockedDesignIds(profile)
    }
    try {
      return normalizeUnlockedDesignIds(JSON.parse(raw) as string[], profile)
    } catch {
      return buildDefaultUnlockedDesignIds(profile)
    }
  })

  const selectedSpecies = useMemo(() => {
    return speciesList.find((species) => species.id === selectedSpeciesId) ?? speciesList[0]
  }, [selectedSpeciesId])
  const groveSceneRef = useRef<Phaser.Scene | null>(null)
  const groveSyncedSceneRef = useRef<Phaser.Scene | null>(null)
  const groveSyncedDataKeyRef = useRef('')

  const selectedDesign = useMemo(() => {
    return resolveTreeDesignBySession(selectedSpecies.designId, selectedSpecies.id)
  }, [selectedSpecies.designId])

  const spendableEssence = profile?.essence ?? 0

  useEffect(() => {
    let cancelled = false

    const loadWeatherAndAudio = async () => {
      const weather = await getWeather()
      if (cancelled) {
        return
      }
      const rain = Boolean(weather?.isRaining)
      setIsRaining(rain)
      AudioManager.playZone(rain ? 'forest_rain' : 'forest')
    }

    void loadWeatherAndAudio()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!profile) {
      return
    }

    let cancelled = false
    const loadForestState = async () => {
      setForestBusy(true)
      setForestMessage('')
      try {
        const state = await getForestState(profile.id)
        if (cancelled) {
          return
        }

        const sessions: PlantedTree[] = state.sessions.map((session) => {
          const matchedDesign = resolveTreeDesignBySession(session.design_id, session.species_id)
          const matchedSpecies = speciesList.find((species) => species.id === session.species_id)
          return {
            id: session.id,
            speciesId: session.species_id,
            icon: matchedSpecies?.icon ?? '🌱',
            name: normalizeSessionName(session.species_name, session.species_id, matchedDesign.name),
            focusMinutes: session.focus_minutes,
            plantedAt: session.completed_at,
            designId: session.design_id,
            designUrl: matchedDesign.imageUrl,
          }
        })

        setPlantedTrees(sessions)
        setUnlockedDesignIds(normalizeUnlockedDesignIds(state.unlocked_design_ids, profile))
      } catch (error) {
        if (!cancelled) {
          setForestMessage((error as Error).message)
        }
      } finally {
        if (!cancelled) {
          setForestBusy(false)
        }
      }
    }

    void loadForestState()

    return () => {
      cancelled = true
    }
  }, [profile])

  const totalSeconds = selectedSpecies.growMinutes * 60
  const elapsedSeconds = totalSeconds - remainingSeconds
  const progressPercent = Math.max(0, Math.min(100, (elapsedSeconds / totalSeconds) * 100))

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [isRunning])

  useEffect(() => {
    setRemainingSeconds(selectedSpecies.growMinutes * 60)
    setIsRunning(false)
  }, [selectedSpecies])

  useEffect(() => {
    localStorage.setItem(plantedKey, JSON.stringify(plantedTrees))
  }, [plantedKey, plantedTrees])

  useEffect(() => {
    localStorage.setItem(unlockedKey, JSON.stringify(unlockedDesignIds))
  }, [unlockedDesignIds, unlockedKey])

  useEffect(() => {
    if (remainingSeconds !== 0) {
      return
    }

    const completeSession = async () => {
      setForestBusy(true)
      setForestMessage('')
      try {
        if (profile) {
          const session = await completeForestSession({
            user_id: profile.id,
            species_id: selectedSpecies.id,
            species_name: selectedSpecies.name,
            focus_minutes: selectedSpecies.growMinutes,
            design_id: selectedDesign.id,
          })

          const tree: PlantedTree = {
            id: session.id,
            speciesId: session.species_id,
            icon: selectedSpecies.icon,
            name: session.species_name,
            focusMinutes: session.focus_minutes,
            plantedAt: session.completed_at,
            designId: session.design_id,
            designUrl: selectedDesign.imageUrl,
          }

          setPlantedTrees((prev) => [tree, ...prev].slice(0, 24))
          AudioManager.playSfx('forest_session_complete')
          await onForestSessionComplete?.({ xp: session.reward_xp, essence: session.reward_essence })
        } else {
          const rewardXp = Math.max(20, selectedSpecies.growMinutes * 2)
          const rewardEssence = Math.max(5, Math.round(selectedSpecies.growMinutes / 3))
          const newTree: PlantedTree = {
            id: `${Date.now()}`,
            speciesId: selectedSpecies.id,
            icon: selectedSpecies.icon,
            name: selectedSpecies.name,
            focusMinutes: selectedSpecies.growMinutes,
            plantedAt: new Date().toISOString(),
            designId: selectedDesign.id,
            designUrl: selectedDesign.imageUrl,
          }
          setPlantedTrees((prev) => [newTree, ...prev].slice(0, 24))
          AudioManager.playSfx('forest_session_complete')
          await onForestSessionComplete?.({ xp: rewardXp, essence: rewardEssence })
        }
      } catch (error) {
        AudioManager.playSfx('error')
        setForestMessage((error as Error).message)
      } finally {
        setRemainingSeconds(selectedSpecies.growMinutes * 60)
        setForestBusy(false)
      }
    }

    void completeSession()
  }, [
    onForestSessionComplete,
    profile,
    remainingSeconds,
    selectedDesign.id,
    selectedDesign.imageUrl,
    selectedSpecies,
  ])

  const growthPhase = progressPercent < 34 ? 'Seedling' : progressPercent < 67 ? 'Growing' : 'Blooming'

  const groveTrees = useMemo(() => {
    return [...plantedTrees].sort((a, b) => {
      const aTs = new Date(a.plantedAt).getTime()
      const bTs = new Date(b.plantedAt).getTime()
      return bTs - aTs
    })
  }, [plantedTrees])

  const maxVisibleTrees = 84

  const grovePhaserTrees = useMemo<PlantedTreeSprite[]>(() => {
    const visibleTrees = groveTrees.slice(0, maxVisibleTrees)
    const rowCount = Math.max(1, Math.ceil(visibleTrees.length / 8) - 1)
    return visibleTrees.map((tree, index) => {
      const col = index % 8
      const row = Math.floor(index / 8)
      const depth = rowCount === 0 ? 0 : row / rowCount
      const columnSpacing = 100 + depth * 24
      const rowSpacing = 104 + depth * 14
      const perspectiveShift = depth * 72
      const growthStage = tree.focusMinutes >= 35 ? 4 : tree.focusMinutes >= 25 ? 3 : tree.focusMinutes >= 15 ? 2 : 1
      return {
        id: tree.id,
        species: tree.speciesId,
        growthStage,
        x: 72 + perspectiveShift + col * columnSpacing + Math.sin(index * 1.6) * 18,
        y: 140 + row * rowSpacing + Math.cos(index * 1.2) * 14,
        iconUrl: tree.designUrl,
        label: tree.name,
      }
    })
  }, [groveTrees])

  const groveTreesDataKey = useMemo(() => {
    return grovePhaserTrees
      .map((tree) => `${tree.id}:${tree.species}:${tree.growthStage}:${Math.round(tree.x)}:${Math.round(tree.y)}`)
      .join('|')
  }, [grovePhaserTrees])

  const syncGroveSceneTrees = useCallback(
    (scene: Phaser.Scene) => {
      if (scene.scene.key !== 'ForestGroveScene') {
        return
      }

      const sameScene = groveSyncedSceneRef.current === scene
      const sameData = groveSyncedDataKeyRef.current === groveTreesDataKey
      if (sameScene && sameData) {
        return
      }

      groveSyncedSceneRef.current = scene
      groveSyncedDataKeyRef.current = groveTreesDataKey
      scene.scene.restart({ trees: grovePhaserTrees })
    },
    [grovePhaserTrees, groveTreesDataKey],
  )

  useEffect(() => {
    if (activeTab !== 'grove') {
      return
    }

    const scene = groveSceneRef.current
    if (!scene) {
      return
    }

    syncGroveSceneTrees(scene)
  }, [activeTab, syncGroveSceneTrees])

  const streakDays = useMemo(() => {
    const today = new Date()
    const recentDays = new Set(
      plantedTrees.map((tree) => new Date(tree.plantedAt).toDateString()),
    )

    let streak = 0
    for (let offset = 0; offset < 30; offset += 1) {
      const date = new Date(today)
      date.setDate(today.getDate() - offset)
      if (!recentDays.has(date.toDateString())) {
        break
      }
      streak += 1
    }
    return streak
  }, [plantedTrees])

  useEffect(() => {
    const onSfx = (name: string) => {
      AudioManager.playSfx(name as never)
    }

    EventBus.on('sfx', onSfx)
    return () => {
      EventBus.off('sfx', onSfx)
    }
  }, [])

  const buyDesign = (design: TreeDesign) => {
    if (unlockedDesignIds.includes(design.id)) {
      return
    }
    if (!profile || spendableEssence < design.costEssence) {
      return
    }

    const unlock = async () => {
      setForestBusy(true)
      setForestMessage('')
      try {
        await unlockForestDesign({
          user_id: profile.id,
          design_id: design.id,
          cost_essence: design.costEssence,
        })
        setUnlockedDesignIds((prev) => [...prev, design.id])
        AudioManager.playSfx('unlock')
        await onSpendEssence?.(design.costEssence)
      } catch (error) {
        AudioManager.playSfx('error')
        setForestMessage((error as Error).message)
      } finally {
        setForestBusy(false)
      }
    }

    void unlock()
  }

  const tabItems: Array<{ id: ForestTab; label: string; icon: string }> = [
    { id: 'focus', label: 'Focus', icon: '⏱️' },
    { id: 'grove', label: 'Grove', icon: '🌱' },
    { id: 'store', label: 'Store', icon: '🛒' },
    { id: 'catalog', label: 'Designs', icon: '🎨' },
  ]

  return (
    <div className="page forest-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <LeafParticles />
      {isRaining && <RainParticles />}
      <div className="forest-header">
        <p className="forest-kicker">Forest Sanctuary</p>
        <h1>Grow Focus Into Living Progress</h1>
        <p>Cycle through focus runs, expand your grove, and unlock design upgrades with tree essence.</p>
        {isRaining && (
          <p style={{ color: 'var(--color-essence)', marginTop: 8 }}>
            Rainy day: +10% essence bonus hint active
          </p>
        )}
      </div>

      <nav className="forest-sub-ribbon" aria-label="Forest section navigation">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            className={`forest-sub-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="forest-wallet">Tree Essence Balance: {spendableEssence} 🌳</div>
      {forestMessage && <p className="forest-message">{forestMessage}</p>}

      <div className="forest-layout">
        {activeTab === 'focus' && (
          <>
            <section className="focus-card">
          <div className="focus-card-top">
            <div>
              <h2>Current Plant</h2>
              <p>{selectedSpecies.name} · {selectedSpecies.growMinutes} min focus</p>
            </div>
            <div className="selected-species-icon">{selectedSpecies.icon}</div>
          </div>

          <div className="current-design">
            <img src={selectedDesign.imageUrl} alt={selectedDesign.name} className={isRunning ? 'tree-sway' : ''} />
            <div>
              <strong>{selectedDesign.name}</strong>
              <p>{selectedDesign.sourceLabel}</p>
            </div>
          </div>

          <div className="timer-ring-wrap" aria-label="Focus progress">
            <div
              className="timer-ring"
              style={{ '--progress': `${progressPercent}%` } as CSSProperties}
            >
              <div className="timer-core">
                <span className={`timer-clock ${isRunning ? 'pulse' : ''}`}>{formatClock(remainingSeconds)}</span>
                <span className="growth-phase">{growthPhase}</span>
              </div>
            </div>
          </div>

          <div className="focus-actions">
            <button
              className="forest-btn primary"
              onClick={() => {
                setIsRunning(true)
                AudioManager.playSfx('forest_session_start')
              }}
              disabled={isRunning}
            >
              Start
            </button>
            <button className="forest-btn" onClick={() => setIsRunning(false)} disabled={!isRunning}>
              Pause
            </button>
            <button
              className="forest-btn"
              onClick={() => {
                setIsRunning(false)
                setRemainingSeconds(selectedSpecies.growMinutes * 60)
              }}
            >
              Reset
            </button>
          </div>
            </section>

            <section className="species-card">
          <h2>Choose Species</h2>
          <div className="species-grid">
            {speciesList.map((species) => (
              <button
                key={species.id}
                className={`species-tile ${selectedSpeciesId === species.id ? 'active' : ''}`}
                onClick={() => setSelectedSpeciesId(species.id)}
              >
                <span className="species-icon">{species.icon}</span>
                <span className="species-name">{species.name}</span>
                <span className="species-meta">{species.growMinutes}m · {species.mood}</span>
              </button>
            ))}
          </div>
            </section>
          </>
        )}

        {activeTab === 'grove' && (
          <section className="grove-card full-width">
            <div className="grove-head">
              <h2>Your Grove</h2>
              <span>{plantedTrees.length} trees</span>
            </div>
            {plantedTrees.length === 0 && <p className="grove-empty">No trees yet. Finish your first focus session.</p>}
            {plantedTrees.length > 0 && (
              <div style={{ width: '100%', height: 460, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
                <PhaserGame
                  config={ForestGameConfig}
                  style={{ width: '100%', height: '100%' }}
                  currentActiveScene={(scene) => {
                    groveSceneRef.current = scene
                    syncGroveSceneTrees(scene)
                  }}
                />
              </div>
            )}
            <p className="forest-section-note" style={{ marginTop: 10 }}>
              Grove rendering now uses your SVG tree variants.
            </p>
          </section>
        )}

        {activeTab === 'store' && (
          <section className="insights-card full-width">
            <h2>Forest Store</h2>
            <p className="forest-section-note">
              Spend essence to unlock alternate tree designs and diversify your grove style.
            </p>
            <div className="design-store-grid">
              {treeDesigns.map((design) => {
                const unlocked = unlockedDesignIds.includes(design.id)
                const canBuy = spendableEssence >= design.costEssence
                return (
                  <article key={design.id} className="design-card">
                    <span className={`design-badge ${unlocked ? 'owned' : canBuy ? 'buyable' : 'locked'}`}>
                      {unlocked ? 'Unlocked' : canBuy ? 'Buy' : 'Locked'}
                    </span>
                    <img src={design.imageUrl} alt={design.name} className="design-thumb" />
                    <div className="design-meta">
                      <h3>{design.name}</h3>
                      <p>{design.sourceLabel}</p>
                      <p>Rarity: {design.rarity}</p>
                      <p>Cost: {design.costEssence} 🌳</p>
                    </div>
                    <button
                      className="forest-btn primary"
                      onClick={() => buyDesign(design)}
                      disabled={forestBusy || unlocked || !canBuy}
                    >
                      {unlocked ? 'Owned' : 'Buy'}
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {activeTab === 'catalog' && (
          <section className="insights-card full-width">
            <h2>Tree Design Catalog</h2>
            <p className="forest-section-note">
              Generated and online sources are tracked per design for future asset management.
            </p>
            <div className="design-store-grid">
              {treeDesigns.map((design) => (
                <article key={design.id} className="design-card">
                  <span className={`design-badge ${unlockedDesignIds.includes(design.id) ? 'owned' : 'locked'}`}>
                    {unlockedDesignIds.includes(design.id) ? 'Unlocked' : 'Locked'}
                  </span>
                  <img src={design.imageUrl} alt={design.name} className="design-thumb" />
                  <div className="design-meta">
                    <h3>{design.name}</h3>
                    <p>Source Type: {design.sourceType}</p>
                    <p>Source: {design.sourceLabel}</p>
                    <p>Status: {unlockedDesignIds.includes(design.id) ? 'Unlocked' : 'Locked'}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="insights-card">
          <h2>Focus Insights</h2>
          <div className="insights-grid">
            <div className="insight-box">
              <span className="insight-label">Focus Streak</span>
              <span className="insight-value">{streakDays} days</span>
            </div>
            <div className="insight-box">
              <span className="insight-label">Total Minutes</span>
              <span className="insight-value">
                {plantedTrees.reduce((sum, tree) => sum + tree.focusMinutes, 0)}
              </span>
            </div>
            <div className="insight-box">
              <span className="insight-label">Session Status</span>
              <span className="insight-value">{isRunning ? 'Planting' : 'Idle'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
