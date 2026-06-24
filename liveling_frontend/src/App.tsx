import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  buyFromShop,
  completeTask,
  createTask,
  createUser,
  getProfileByUsername,
  getProfile,
  getTasksByUser,
} from './api'
import { AudioManager } from './audio/AudioManager'
import type {
  PageType,
  ShopItemType,
  TaskCategory,
  TaskCompletionResult,
  TaskItem,
  UserProfile,
} from './types'
import { AppShell, LoadingScreen, PageWrapper, SynergyOverlay } from './components'
import { HomePage, MissionsPage, ForestPage, GamePage, ShopPage, ProfilePage, Navigation } from './pages'
import type { HomePageSettings } from './pages/SettingsPage'
import './App.css'

const defaultHomeSettings: HomePageSettings = {
  showXpBar: true,
  showCurrencies: true,
  showNewsFeed: true,
  showPriorities: true,
  showNotes: true,
  showReminders: true,
  showStats: true,
  showTaskProgress: true,
  newsPosition: 1,
  prioritiesPosition: 2,
  notesPosition: 3,
  remindersPosition: 4,
  statsPosition: 5,
  taskProgressPosition: 6,
}

function App() {
  // Page routing
  const [currentPage, setCurrentPage] = useState<PageType>('home')

  // User state
  const [usernameInput, setUsernameInput] = useState('')
  const [userId, setUserId] = useState(localStorage.getItem('liveling_user_id') ?? '')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [completionRewards, setCompletionRewards] = useState<Record<string, number>>({})

  // Home settings
  const [homeSettings, setHomeSettings] = useState<HomePageSettings>(() => {
    const saved = localStorage.getItem('liveling_home_settings')
    return saved ? JSON.parse(saved) : defaultHomeSettings
  })

  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [showSynergyOverlay, setShowSynergyOverlay] = useState(false)
  const [appReady, setAppReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [lastCompletion, setLastCompletion] = useState<TaskCompletionResult | null>(null)

  const hasUser = useMemo(() => Boolean(userId && profile), [userId, profile])

  useEffect(() => {
    // Music now plays from shop zone, not home
    const unlock = () => {
      AudioManager.unlock()
    }

    if (localStorage.getItem('liveling_audio_unlocked') === '1') {
      AudioManager.unlock()
    }

    document.addEventListener('click', unlock, { once: true })
    document.addEventListener('pointerdown', unlock, { once: true })
    document.addEventListener('touchend', unlock, { once: true })
    document.addEventListener('keydown', unlock, { once: true })
    document.addEventListener('wheel', unlock, { once: true })

    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('touchend', unlock)
      document.removeEventListener('keydown', unlock)
      document.removeEventListener('wheel', unlock)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const runBoot = async () => {
      setLoadProgress(25)
      await new Promise((resolve) => window.setTimeout(resolve, 150))
      if (!mounted) return
      setLoadProgress(55)
      await new Promise((resolve) => window.setTimeout(resolve, 150))
      if (!mounted) return
      setLoadProgress(85)
      await new Promise((resolve) => window.setTimeout(resolve, 200))
      if (!mounted) return
      setLoadProgress(100)
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      if (!mounted) return
      setAppReady(true)
    }

    void runBoot()

    return () => {
      mounted = false
    }
  }, [])

  // Attempt to restore a saved user session; clear invalid IDs so auth form is usable.
  useEffect(() => {
    if (!userId) {
      return
    }

    let isCancelled = false

    const restoreSession = async () => {
      try {
        const [latest, savedTasks] = await Promise.all([
          getProfile(userId),
          getTasksByUser(userId),
        ])
        if (isCancelled) {
          return
        }
        setProfile(latest)
        setTasks(savedTasks)
        setCompletionRewards(() => {
          const rewards: Record<string, number> = {}
          for (const task of savedTasks) {
            if (task.is_completed) {
              rewards[task.id] = 50 * task.difficulty
            }
          }
          return rewards
        })
      } catch {
        if (isCancelled) {
          return
        }
        localStorage.removeItem('liveling_user_id')
        setUserId('')
        setProfile(null)
        setMessage('Saved user could not be loaded. Please create a new user.')
      } finally {
        // No-op: background restore should not lock form interactions.
      }
    }

    void restoreSession()

    return () => {
      isCancelled = true
    }
  }, [userId])

  // User creation
  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!usernameInput.trim()) {
      setMessage('Enter a username first.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const created = await createUser(usernameInput.trim())
      setUserId(created.id)
      localStorage.setItem('liveling_user_id', created.id)
      setProfile(created)
      const savedTasks = await getTasksByUser(created.id)
      setTasks(savedTasks)
      setCompletionRewards(() => {
        const rewards: Record<string, number> = {}
        for (const task of savedTasks) {
          if (task.is_completed) {
            rewards[task.id] = 50 * task.difficulty
          }
        }
        return rewards
      })
      setUsernameInput('')
      setMessage(`User created: ${created.username}`)
    } catch (error) {
      const rawMessage = (error as Error).message
      if (rawMessage.toLowerCase().includes('username already exists')) {
        try {
          const existing = await getProfileByUsername(usernameInput.trim())
          const savedTasks = await getTasksByUser(existing.id)
          setUserId(existing.id)
          localStorage.setItem('liveling_user_id', existing.id)
          setProfile(existing)
          setTasks(savedTasks)
          setCompletionRewards(() => {
            const rewards: Record<string, number> = {}
            for (const task of savedTasks) {
              if (task.is_completed) {
                rewards[task.id] = 50 * task.difficulty
              }
            }
            return rewards
          })
          setUsernameInput('')
          setMessage(`Welcome back, ${existing.username}! Loaded your saved missions.`)
        } catch {
          setMessage(rawMessage)
        }
      } else {
        setMessage(rawMessage)
      }
    } finally {
      setBusy(false)
    }
  }

  // Profile refresh
  async function handleRefreshProfile(options?: { silent?: boolean }) {
    if (!userId) {
      setMessage('Create or load a user first.')
      return
    }
    const silent = options?.silent ?? false
    setBusy(true)
    if (!silent) {
      setMessage('')
    }
    try {
      const [latest, savedTasks] = await Promise.all([
        getProfile(userId),
        getTasksByUser(userId),
      ])
      setProfile(latest)
      setTasks(savedTasks)
      if (!silent) {
        setMessage('Profile refreshed.')
      }
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Task creation
  async function handleCreateTask(taskData: {
    title: string
    category: TaskCategory
    custom_category?: string
    difficulty: number
  }): Promise<TaskItem | undefined> {
    if (!userId) {
      setMessage('Create a user first.')
      return undefined
    }

    setBusy(true)
    setMessage('')
    try {
      const created = await createTask({
        user_id: userId,
        title: taskData.title,
        category: taskData.category,
        custom_category: taskData.custom_category,
        difficulty: taskData.difficulty,
      })
      setTasks((prev) => [created, ...prev])
      setMessage('Mission created!')
      return created
    } catch (error) {
      setMessage((error as Error).message)
      return undefined
    } finally {
      setBusy(false)
    }
  }

  // Task completion
  async function handleCompleteTask(taskId: string) {
    setBusy(true)
    setMessage('')
    try {
      const result = await completeTask(taskId)
      const previousLevel = profile?.current_level ?? 1
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, is_completed: true, completed_at: new Date().toISOString() }
            : task,
        ),
      )
      setCompletionRewards((prev) => ({ ...prev, [taskId]: result.reward_xp }))
      setLastCompletion(result)
      AudioManager.playSfx('mission_complete')
      AudioManager.playSfx('xp_gain')
      if (result.new_level > previousLevel) {
        AudioManager.playSfx('level_up')
      }
      if (result.synergy_activated) {
        setShowSynergyOverlay(true)
      }
      await handleRefreshProfile()
      setMessage(`Mission complete! +${result.reward_xp} XP`)
    } catch (error) {
      AudioManager.playSfx('error')
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Shop purchase
  async function handleBuy(itemData: {
    item_type: ShopItemType
    amount: number
  }) {
    if (!userId) {
      setMessage('Create a user first.')
      return
    }

    setBusy(true)
    setMessage('')
    try {
      await buyFromShop({
        user_id: userId,
        item_type: itemData.item_type,
        amount: itemData.amount,
      })
      AudioManager.playSfx('purchase')
      await handleRefreshProfile()
      setMessage('Purchase successful!')
    } catch (error) {
      AudioManager.playSfx('error')
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // User switch
  function handleSwitchUser() {
    localStorage.removeItem('liveling_user_id')
    setUserId('')
    setProfile(null)
    setTasks([])
    setCompletionRewards({})
    setMessage('User cleared.')
  }

  async function handleForestSpendEssence(amount: number) {
    await handleRefreshProfile({ silent: true })
    setMessage(`Purchased tree design for ${amount} tree essence.`)
  }

  async function handleForestSessionComplete(reward: { xp: number; essence: number }) {
    await handleRefreshProfile({ silent: true })
    setMessage(`Focus session complete! +${reward.xp} XP, +${reward.essence} Tree Essence`)
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            profile={profile}
            tasks={tasks}
            onRefreshProfile={handleRefreshProfile}
            onNavigateToMissions={() => setCurrentPage('missions')}
            settings={homeSettings}
          />
        )
      case 'missions':
        return (
          <MissionsPage
            tasks={tasks}
            onCreateTask={handleCreateTask}
            onCompleteTask={handleCompleteTask}
            lastCompletion={lastCompletion}
            userId={userId}
            hasUser={hasUser}
            busy={busy}
          />
        )
      case 'forest':
        return (
          <ForestPage
            profile={profile}
            onSpendEssence={handleForestSpendEssence}
            onForestSessionComplete={handleForestSessionComplete}
          />
        )
      case 'game':
        return <GamePage profile={profile} />
      case 'shop':
        return (
          <ShopPage onBuy={handleBuy} hasUser={hasUser} busy={busy} />
        )
      case 'profile':
        return (
          <ProfilePage
            profile={profile}
            tasks={tasks}
            completionRewards={completionRewards}
            settings={homeSettings}
            onSaveSettings={(newSettings) => {
              setHomeSettings(newSettings)
              localStorage.setItem('liveling_home_settings', JSON.stringify(newSettings))
              setMessage('Settings saved!')
            }}
            onLogout={handleSwitchUser}
          />
        )
      default:
        return (
          <HomePage
            profile={profile}
            tasks={tasks}
            onRefreshProfile={handleRefreshProfile}
            onNavigateToMissions={() => setCurrentPage('missions')}
            settings={homeSettings}
          />
        )
    }
  }

  return (
    !appReady ? (
      <LoadingScreen progress={loadProgress} />
    ) : (
    <AppShell>
      <div className="app-container">
        {/* Auth Panel - Always visible at top */}
        {!hasUser && (
          <div className="auth-panel">
            <div className="auth-container">
              <h2>Welcome to Liveling</h2>
              <form onSubmit={handleCreateUser} className="auth-form">
                <input
                  placeholder="Choose a username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  disabled={busy}
                />
                <button type="submit" disabled={busy}>
                  Create Account
                </button>
              </form>
              {message && <p className="auth-message">{message}</p>}
            </div>
          </div>
        )}

        {/* User Header - Visible when logged in */}
        {hasUser && profile && (
          <div className="user-header">
            <div className="user-info">
              <span className="username">{profile.username}</span>
              <span className="level-badge">Lvl {profile.current_level}</span>
            </div>
            <div className="quick-stats">
              <span title="Total XP"><i className="ra ra-star" /> {profile.total_xp}</span>
              <span title="Tree Essence"><i className="ra ra-oak" /> {profile.essence}</span>
              <span title="Sword Stats Points"><i className="ra ra-sword" /> {profile.vitality}</span>
              <span title="Coins"><i className="ra ra-coins" /> {profile.credits}</span>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="page-container">
          <PageWrapper pageKey={currentPage}>{renderPage()}</PageWrapper>
        </main>

        {/* Status message */}
        {message && (
          <div className={`status-message ${message.includes('error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Bottom Navigation */}
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      <SynergyOverlay
        show={showSynergyOverlay}
        onDone={() => {
          setShowSynergyOverlay(false)
        }}
      />
    </AppShell>
    )
  )
}

export default App
