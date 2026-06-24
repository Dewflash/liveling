import '../styles/widgets/Reminders.css'
import { mockReminders } from '../mockData'

interface Reminder {
  id: string
  title: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

interface RemindersProps {
  reminders?: Reminder[]
  onAdd?: () => void
  onComplete?: (id: string) => void
}

export function Reminders({ reminders = mockReminders.user_1, onAdd, onComplete }: RemindersProps) {
  const activeReminders = reminders.filter((r) => !r.completed)
  const completedReminders = reminders.filter((r) => r.completed)

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ff6b6b'
      case 'medium':
        return '#ffa94d'
      case 'low':
        return '#51cf66'
      default:
        return '#868e96'
    }
  }

  const priorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  return (
    <div className="reminders-section">
      <div className="reminders-header">
        <h3>⏰ Reminders</h3>
        {onAdd && (
          <button className="quick-add-btn" onClick={onAdd} title="Add reminder">
            +
          </button>
        )}
      </div>

      <div className="reminders-list">
        {activeReminders.length === 0 && completedReminders.length === 0 ? (
          <p className="empty-reminders">No reminders set yet.</p>
        ) : (
          <>
            {activeReminders.map((reminder) => (
              <div key={reminder.id} className="reminder-item active">
                <div className="reminder-priority" style={{ color: priorityColor(reminder.priority) }}>
                  {priorityLabel(reminder.priority)}
                </div>
                <div className="reminder-content">
                  <p className="reminder-title">{reminder.title}</p>
                  <span className="reminder-date">{reminder.dueDate}</span>
                </div>
                {onComplete && (
                  <button
                    className="reminder-check"
                    onClick={() => onComplete(reminder.id)}
                    title="Mark complete"
                  >
                    ☐
                  </button>
                )}
              </div>
            ))}

            {completedReminders.length > 0 && (
              <div className="completed-reminders">
                <p className="completed-label">Completed ({completedReminders.length})</p>
                {completedReminders.slice(0, 2).map((reminder) => (
                  <div key={reminder.id} className="reminder-item completed">
                    <span className="completed-icon">✓</span>
                    <span className="reminder-title">{reminder.title}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
