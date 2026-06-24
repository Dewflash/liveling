import { useMemo, useState } from 'react'

import { AudioManager } from '../audio/AudioManager'
import { getAvatarUrl } from '../services/avatarService'
import type { TaskCategory, TaskItem, UserProfile } from '../types'
import { SettingsPage } from './SettingsPage'
import type { HomePageSettings } from './SettingsPage'
import '../styles/ProfilePage.css'

type MissionEventType = 'MISSION_CREATED' | 'MISSION_COMPLETED' | 'RPG_HARVEST' | 'FOREST_SESSION'
type MissionLogSource = 'LIVELING' | 'EXTERNAL_API' | 'RPG' | 'FOREST'

interface MissionLogEntry {
  id: string
  missionId: string
  missionTitle: string
  missionType: TaskCategory
  eventType: MissionEventType
  timestamp?: string | null
  pointsGranted: number
  rewardType: 'sword_stats' | 'tree_essence' | 'coins' | 'star_points'
  source: MissionLogSource
}

interface ProfilePageProps {
  profile: UserProfile | null
  tasks: TaskItem[]
  completionRewards: Record<string, number>
  settings: HomePageSettings
  onSaveSettings: (settings: HomePageSettings) => void
  onLogout: () => void
}

function rewardTypeByCategory(category: TaskCategory): MissionLogEntry['rewardType'] {
  if (category === 'HEALTH') {
    return 'sword_stats'
  }
  if (category === 'SOCIAL') {
    return 'tree_essence'
  }
  if (category === 'WORK') {
    return 'coins'
  }
  return 'star_points'
}

function rewardLabel(reward: MissionLogEntry['rewardType']): string {
  const labels: Record<MissionLogEntry['rewardType'], string> = {
    sword_stats: 'Sword Stats',
    tree_essence: 'Tree Essence',
    coins: 'Coins',
    star_points: 'Star Points',
  }
  return labels[reward]
}

function formatTime(value?: string | null): string {
  if (!value) {
    return 'No timestamp'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export function ProfilePage({
  profile,
  tasks,
  completionRewards,
  settings,
  onSaveSettings,
  onLogout,
}: ProfilePageProps) {
  const [audioLevels, setAudioLevels] = useState(AudioManager.getVolumes())

  const logEntries = useMemo(() => {
    const entries: MissionLogEntry[] = []

    for (const task of tasks) {
      entries.push({
        id: `${task.id}-created`,
        missionId: task.id,
        missionTitle: task.title,
        missionType: task.category,
        eventType: 'MISSION_CREATED',
        timestamp: task.created_at,
        pointsGranted: 0,
        rewardType: rewardTypeByCategory(task.category),
        source: 'LIVELING',
      })

      if (task.is_completed) {
        const fallbackReward = 50 * task.difficulty
        entries.push({
          id: `${task.id}-completed`,
          missionId: task.id,
          missionTitle: task.title,
          missionType: task.category,
          eventType: 'MISSION_COMPLETED',
          timestamp: task.completed_at,
          pointsGranted: completionRewards[task.id] ?? fallbackReward,
          rewardType: rewardTypeByCategory(task.category),
          source: 'LIVELING',
        })
      }
    }

    return entries.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeB - timeA
    })
  }, [completionRewards, tasks])

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <p className="profile-kicker">Account Console</p>
        <h1>Profile, Logs, and Preferences</h1>
        <p>Track your history, inspect reward flow, and control your Liveling dashboard experience.</p>
      </div>

      {!profile && (
        <div className="profile-empty-state">
          <p>Create or load a user to view logs and settings.</p>
        </div>
      )}

      {profile && (
        <>
          <section className="profile-overview">
            <article>
              <span>Level</span>
              <strong>{profile.current_level}</strong>
            </article>
            <article>
              <span>Total XP</span>
              <strong>{profile.total_xp}</strong>
            </article>
            <article>
              <span>Activity Entries</span>
              <strong>{logEntries.length}</strong>
            </article>
            <article>
              <span>Completed Missions</span>
              <strong>{tasks.filter((task) => task.is_completed).length}</strong>
            </article>
          </section>

          <section className="profile-card">
            <h2>Account</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <img
                src={getAvatarUrl(profile.username, 'adventurer')}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '2px solid var(--color-gold)',
                  background: 'var(--panel-bg)',
                }}
                alt="Profile avatar"
              />
              <div>
                <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 22 }}>
                  <i className="ra ra-crown" style={{ color: 'var(--color-gold)', marginRight: 8 }} />
                  Level {profile.current_level}
                </p>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>{profile.total_xp} total XP</p>
              </div>
            </div>
            <div className="profile-account-grid">
              <p><strong>User:</strong> {profile.username}</p>
              <p><strong>Tree Essence:</strong> {profile.essence}</p>
              <p><strong>Sword Stats:</strong> {profile.vitality}</p>
              <p><strong>Coins:</strong> {profile.credits}</p>
              <p><strong>Star Points:</strong> {profile.custom_wallet}</p>
            </div>
            <div className="profile-actions">
              <button className="logout-btn" onClick={onLogout}>Log Out</button>
            </div>
          </section>

          <section className="profile-card">
            <h2>Audio Mix</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <label>
                Master Volume: {Math.round(audioLevels.master * 100)}%
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioLevels.master}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    AudioManager.setMasterVolume(value)
                    setAudioLevels((prev) => ({ ...prev, master: value }))
                  }}
                  style={{ width: '100%' }}
                />
              </label>
              <label>
                Music Volume: {Math.round(audioLevels.music * 100)}%
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioLevels.music}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    AudioManager.setMusicVolume(value)
                    setAudioLevels((prev) => ({ ...prev, music: value }))
                  }}
                  style={{ width: '100%' }}
                />
              </label>
              <label>
                SFX Volume: {Math.round(audioLevels.sfx * 100)}%
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audioLevels.sfx}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    AudioManager.setSfxVolume(value)
                    setAudioLevels((prev) => ({ ...prev, sfx: value }))
                  }}
                  style={{ width: '100%' }}
                />
              </label>
            </div>
          </section>

          <section className="profile-card">
            <h2>Activity Log (Typed Events)</h2>
            <p className="log-hint">
              Event type, mission type, timestamps, reward points, and source are structured to support
              future multi-app API integrations.
            </p>

            {logEntries.length === 0 ? (
              <p className="empty-log">No mission activity yet. Create and complete missions to build your log.</p>
            ) : (
              <div className="log-table">
                <div className="log-row log-header-row">
                  <span>Event</span>
                  <span>Mission</span>
                  <span>Type</span>
                  <span>Reward</span>
                  <span>Points</span>
                  <span>Time</span>
                  <span>Source</span>
                </div>
                {logEntries.map((entry) => (
                  <div key={entry.id} className="log-row">
                    <span className="event-chip">{entry.eventType}</span>
                    <span className="log-cell" data-label="Mission">{entry.missionTitle}</span>
                    <span className="log-cell" data-label="Type">{entry.missionType}</span>
                    <span className="log-cell" data-label="Reward">{rewardLabel(entry.rewardType)}</span>
                    <span className="log-cell" data-label="Points">{entry.pointsGranted}</span>
                    <span className="log-cell" data-label="Time">{formatTime(entry.timestamp)}</span>
                    <span className="log-cell" data-label="Source">{entry.source}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="profile-card settings-host">
            <SettingsPage settings={settings} onSave={onSaveSettings} />
          </section>
        </>
      )}
    </div>
  )
}
