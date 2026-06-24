import '../styles/widgets/TaskProgress.css'

interface TaskProgressProps {
  completedTasks: number
  totalTasks: number
  onNavigate?: () => void
}

export function TaskProgress({ completedTasks, totalTasks, onNavigate }: TaskProgressProps) {
  const percent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="task-progress">
      <div className="progress-header">
        <h3>Today's Progress</h3>
        <span className="progress-counter">{completedTasks}/{totalTasks}</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
        </div>
        <span className="progress-percent">{Math.round(percent)}%</span>
      </div>
      <p className="progress-message">
        {completedTasks === totalTasks && totalTasks > 0
          ? '🎉 Great job! All tasks complete!'
          : `${totalTasks - completedTasks} task${totalTasks - completedTasks !== 1 ? 's' : ''} left today`}
      </p>
      {onNavigate && (
        <button className="goto-missions-btn" onClick={onNavigate}>
          View All Missions →
        </button>
      )}
    </div>
  )
}
