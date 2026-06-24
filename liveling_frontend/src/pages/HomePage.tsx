import type { UserProfile, TaskItem } from '../types'
import { useEffect, useState } from 'react'

import { AudioManager } from '../audio/AudioManager'
import { TopBar } from '../components/TopBar'
import { TaskProgress } from '../components/TaskProgress'
import { NewsFeed } from '../components/NewsFeed'
import { MissionPriorities } from '../components/MissionPriorities'
import { Notes } from '../components/Notes'
import { Reminders } from '../components/Reminders'
import { WeeklyStats } from '../components/WeeklyStats'
import type { HomePageSettings } from './SettingsPage'
import { mockNewsItems, mockNotes, mockReminders, mockWeeklyStats } from '../mockData'
import { fetchDailyQuote, type Quote } from '../services/quoteService'
import { getPreciseTimeOfDay, getSunTimes } from '../services/sunService'
import { getWeather, type WeatherState } from '../services/weatherService'
import { applyTimeClass, getTimeOfDay } from '../utils/timeOfDay'
import '../styles/HomePage.css'

interface HomePageProps {
  profile: UserProfile | null
  tasks: TaskItem[]
  onRefreshProfile: () => void
  onNavigateToMissions?: () => void
  settings: HomePageSettings
}

export function HomePage({
  profile,
  tasks,
  onRefreshProfile,
  onNavigateToMissions,
  settings,
}: HomePageProps) {
  const [weather, setWeather] = useState<WeatherState | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)

  // Enable music button handler
  const handleEnableMusic = () => {
    AudioManager.unlock()
    AudioManager.playZone('shop')
  }

  useEffect(() => {
    let cancelled = false
    const loadAmbientData = async () => {
      let tod = getTimeOfDay()
      try {
        const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            reject,
            { timeout: 5000 },
          )
        })
        const sun = await getSunTimes(coords.latitude, coords.longitude)
        if (sun) {
          tod = getPreciseTimeOfDay(sun.sunrise, sun.sunset)
        }
      } catch {
        // Fall back to local-hour based time classes.
      }

      applyTimeClass(tod)

      const [w, q] = await Promise.all([getWeather(), fetchDailyQuote()])
      if (cancelled) {
        return
      }
      setWeather(w)
      setQuote(q)
    }

    void loadAmbientData()
    return () => {
      cancelled = true
    }
  }, [])

  // Use mock notes/reminders for demo, real tasks if available
  const completedTasks = tasks.filter((t) => t.is_completed).length
  const totalTasks = tasks.length
  
  // Get mock data for current user (or defaults)
  const currentUserMockNotes = profile ? mockNotes.user_1 : []
  const currentUserMockReminders = profile ? mockReminders.user_1 : []

  // Build widget list based on settings
  const widgets = []

  if (settings.showNewsFeed) {
    widgets.push({ type: 'news', position: settings.newsPosition })
  }
  if (settings.showPriorities) {
    widgets.push({ type: 'priorities', position: settings.prioritiesPosition })
  }
  if (settings.showNotes) {
    widgets.push({ type: 'notes', position: settings.notesPosition })
  }
  if (settings.showReminders) {
    widgets.push({ type: 'reminders', position: settings.remindersPosition })
  }
  if (settings.showStats) {
    widgets.push({ type: 'stats', position: settings.statsPosition })
  }
  if (settings.showTaskProgress) {
    widgets.push({ type: 'progress', position: settings.taskProgressPosition })
  }

  // Sort by position
  widgets.sort((a, b) => a.position - b.position)

  return (
    <div className="page home-page">
      {/* Top Bar */}
      {settings.showXpBar && (
        <div className="home-top-bar">
          <TopBar profile={profile} />
        </div>
      )}

      {/* Main Content */}
      {profile ? (
        <div className="home-content">
          <section className="home-hero">
            <div>
              <p className="home-kicker">Daily Command Center</p>
              <h1>Welcome back, {profile.username}</h1>
              <p className="home-subtitle">
                Keep momentum going with missions, focus sessions, and your evolving character build.
              </p>
              {weather && (
                <div
                  className="panel"
                  style={{ marginTop: 12, padding: '0.4rem 0.7rem', display: 'inline-flex', alignItems: 'center', gap: 10 }}
                >
                  <i className={`ra ${weather.isRaining ? 'ra-raindrop' : 'ra-sun'}`} style={{ color: 'var(--color-gold)', fontSize: 18 }} />
                  <span className="stat" style={{ fontSize: 13 }}>{weather.tempC}degC</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{weather.description}</span>
                  {weather.isRaining && (
                    <span style={{ color: 'var(--color-essence)', fontSize: 12 }}>
                      +Forest bonus active
                    </span>
                  )}
                </div>
              )}
              {quote && (
                <blockquote
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                    borderLeft: '3px solid var(--color-gold)',
                    paddingLeft: 12,
                    margin: '12px 0 0',
                    maxWidth: 560,
                  }}
                >
                  "{quote.content}"
                  <footer
                    style={{
                      fontFamily: 'var(--font-stat)',
                      fontSize: 12,
                      marginTop: 4,
                      color: 'var(--text-muted)',
                    }}
                  >
                    - {quote.author}
                  </footer>
                </blockquote>
              )}
            </div>
            <div className="home-hero-actions">
              <button type="button" onClick={() => onNavigateToMissions?.()}>
                Start Next Mission
              </button>
              <button type="button" className="ghost" onClick={onRefreshProfile}>
                Refresh Stats
              </button>
              <button
                type="button"
                className="ghost"
                onClick={handleEnableMusic}
              >
                Enable Music
              </button>
            </div>
          </section>

          {widgets.map((widget) => (
            <div key={widget.type} className={`widget-item ${widget.type}`}>
              {widget.type === 'progress' && (
                <TaskProgress
                  completedTasks={completedTasks}
                  totalTasks={totalTasks}
                  onNavigate={onNavigateToMissions}
                />
              )}
              {widget.type === 'news' && <NewsFeed items={mockNewsItems} />}
              {widget.type === 'priorities' && (
                <MissionPriorities
                  missions={tasks.length > 0 ? tasks : []}
                  onAdd={onNavigateToMissions}
                />
              )}
              {widget.type === 'notes' && <Notes notes={currentUserMockNotes} />}
              {widget.type === 'reminders' && <Reminders reminders={currentUserMockReminders} />}
              {widget.type === 'stats' && <WeeklyStats stats={mockWeeklyStats} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Create a user to get started</p>
        </div>
      )}
    </div>
  )
}
