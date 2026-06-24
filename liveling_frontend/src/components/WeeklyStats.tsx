import '../styles/widgets/WeeklyStats.css'
import { mockWeeklyStats } from '../mockData'

interface DayStats {
  day: string
  xp: number
  essenceGained: number
  vitalityGained: number
  creditsGained: number
}

interface WeeklyStatsProps {
  stats?: DayStats[]
}

export function WeeklyStats({ stats = mockWeeklyStats }: WeeklyStatsProps) {
  const maxXP = Math.max(...stats.map((s) => s.xp), 200)
  const totalXP = stats.reduce((sum, s) => sum + s.xp, 0)
  const totalEssence = stats.reduce((sum, s) => sum + s.essenceGained, 0)

  return (
    <div className="weekly-stats">
      <div className="stats-header">
        <h3>📊 This Week</h3>
        <div className="stats-summary">
          <span className="summary-item">
            <span className="summary-label">Total XP:</span>
            <span className="summary-value">{totalXP}</span>
          </span>
          <span className="summary-item">
            <span className="summary-label">Essence:</span>
            <span className="summary-value">+{totalEssence}</span>
          </span>
        </div>
      </div>

      <div className="chart-container">
        <div className="bars-container">
          {stats.map((day) => (
            <div key={day.day} className="bar-group">
              <div className="bar-wrapper">
                <div
                  className="bar xp-bar"
                  style={{ height: `${(day.xp / maxXP) * 100}%` }}
                  title={`${day.xp} XP`}
                ></div>
              </div>
              <span className="bar-label">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="currency-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-icon">💎</span>
          <span className="breakdown-label">Essence Gained</span>
          <span className="breakdown-value">+{totalEssence}</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-icon">❤️</span>
          <span className="breakdown-label">Vitality Gained</span>
          <span className="breakdown-value">+{stats.reduce((sum, s) => sum + s.vitalityGained, 0)}</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-icon">💰</span>
          <span className="breakdown-label">Credits Gained</span>
          <span className="breakdown-value">+{stats.reduce((sum, s) => sum + s.creditsGained, 0)}</span>
        </div>
      </div>
    </div>
  )
}
