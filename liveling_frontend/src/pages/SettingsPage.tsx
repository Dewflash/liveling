import { useState } from 'react'
import '../styles/SettingsPage.css'

export interface HomePageSettings {
  showXpBar: boolean
  showCurrencies: boolean
  showNewsFeed: boolean
  showPriorities: boolean
  showNotes: boolean
  showReminders: boolean
  showStats: boolean
  showTaskProgress: boolean
  newsPosition: number
  prioritiesPosition: number
  notesPosition: number
  remindersPosition: number
  statsPosition: number
  taskProgressPosition: number
}

interface SettingsPageProps {
  settings: HomePageSettings
  onSave: (settings: HomePageSettings) => void
  onCancel?: () => void
}

const defaultSettings: HomePageSettings = {
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

export function SettingsPage({ settings = defaultSettings, onSave, onCancel }: SettingsPageProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleToggle = (key: keyof HomePageSettings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePositionChange = (key: keyof HomePageSettings, value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    onSave(localSettings)
  }

  return (
    <div className="page settings-page">
      <div className="settings-header">
        <h1>⚙️ Customize Your Home</h1>
        <p>Choose which widgets to display and their order</p>
      </div>

      <div className="settings-container">
        <section className="settings-section">
          <h2>Visibility</h2>
          <div className="settings-group">
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={localSettings.showXpBar}
                onChange={() => handleToggle('showXpBar')}
              />
              <span className="toggle-label">XP Bar & Currencies</span>
            </label>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={localSettings.showTaskProgress}
                onChange={() => handleToggle('showTaskProgress')}
              />
              <span className="toggle-label">Today's Task Progress</span>
            </label>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={localSettings.showNewsFeed}
                onChange={() => handleToggle('showNewsFeed')}
              />
              <span className="toggle-label">News Feed</span>
            </label>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={localSettings.showPriorities}
                onChange={() => handleToggle('showPriorities')}
              />
              <span className="toggle-label">Top 3 Priorities</span>
            </label>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={localSettings.showNotes}
                onChange={() => handleToggle('showNotes')}
              />
              <span className="toggle-label">Notes</span>
            </label>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={localSettings.showReminders}
                onChange={() => handleToggle('showReminders')}
              />
              <span className="toggle-label">Reminders</span>
            </label>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={localSettings.showStats}
                onChange={() => handleToggle('showStats')}
              />
              <span className="toggle-label">Weekly Statistics</span>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Widget Order</h2>
          <div className="settings-group">
            {localSettings.showNewsFeed && (
              <div className="setting-order">
                <label>News Feed Position</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={localSettings.newsPosition}
                  onChange={(e) =>
                    handlePositionChange('newsPosition', parseInt(e.target.value))
                  }
                />
              </div>
            )}
            {localSettings.showPriorities && (
              <div className="setting-order">
                <label>Top 3 Priorities Position</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={localSettings.prioritiesPosition}
                  onChange={(e) =>
                    handlePositionChange('prioritiesPosition', parseInt(e.target.value))
                  }
                />
              </div>
            )}
            {localSettings.showNotes && (
              <div className="setting-order">
                <label>Notes Position</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={localSettings.notesPosition}
                  onChange={(e) =>
                    handlePositionChange('notesPosition', parseInt(e.target.value))
                  }
                />
              </div>
            )}
            {localSettings.showReminders && (
              <div className="setting-order">
                <label>Reminders Position</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={localSettings.remindersPosition}
                  onChange={(e) =>
                    handlePositionChange('remindersPosition', parseInt(e.target.value))
                  }
                />
              </div>
            )}
            {localSettings.showStats && (
              <div className="setting-order">
                <label>Statistics Position</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={localSettings.statsPosition}
                  onChange={(e) =>
                    handlePositionChange('statsPosition', parseInt(e.target.value))
                  }
                />
              </div>
            )}
          </div>
        </section>

        <div className="settings-actions">
          <button className="save-btn" onClick={handleSave}>
            💾 Save Settings
          </button>
          {onCancel && (
            <button className="cancel-btn" onClick={onCancel}>
              ✕ Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
