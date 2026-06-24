import type { TaskItem } from '../types'
import '../styles/widgets/MissionPriorities.css'

interface MissionPrioritiesProps {
  missions: TaskItem[]
  onEdit?: (taskId: string) => void
  onAdd?: () => void
  onComplete?: (taskId: string) => void
}

const currencyMap: Record<string, { icon: string; color: string }> = {
  HEALTH: { icon: '⚔️', color: '#ff6b6b' },
  SOCIAL: { icon: '🌳', color: '#2f9e44' },
  WORK: { icon: '💰', color: '#f08c00' },
  CUSTOM: { icon: '✨', color: '#da77f2' },
}

export function MissionPriorities({
  missions,
  onEdit,
  onAdd,
  onComplete,
}: MissionPrioritiesProps) {
  const topMissions = missions
    .filter((m) => !m.is_completed)
    .slice(0, 3)

  const getCurrencyIcon = (category: string) => {
    return currencyMap[category] || currencyMap.CUSTOM
  }

  return (
    <div className="mission-priorities">
      <div className="priorities-header">
        <h3>Top 3 Priorities</h3>
        {onAdd && (
          <button className="quick-add-btn" onClick={onAdd} title="Add mission">
            +
          </button>
        )}
      </div>

      <div className="priorities-list">
        {topMissions.length === 0 ? (
          <p className="empty-priorities">No active missions. Add one to get started!</p>
        ) : (
          topMissions.map((mission, idx) => {
            const currency = getCurrencyIcon(mission.category)
            return (
              <div key={mission.id} className="priority-item">
                <div className="priority-number">{idx + 1}</div>
                <div className="priority-info">
                  <h4>{mission.title}</h4>
                  <div className="priority-meta">
                    <span className="currency-reward" style={{ color: currency.color }}>
                      {currency.icon}
                    </span>
                    <span className="xp-reward">+50 XP</span>
                    <span className="difficulty">d{mission.difficulty}</span>
                  </div>
                </div>
                <div className="priority-actions">
                  {onComplete && (
                    <button
                      className="action-btn complete"
                      onClick={() => onComplete(mission.id)}
                      title="Complete mission"
                    >
                      ✓
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(mission.id)}
                      title="Edit mission"
                    >
                      ✎
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
