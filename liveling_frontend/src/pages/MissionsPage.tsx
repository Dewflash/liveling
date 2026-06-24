import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { cardPopVariants, missionCompleteExit } from '../animations/variants'
import { AudioManager } from '../audio/AudioManager'
import { FloatingReward } from '../components'
import { fetchTriviaQuestion } from '../services/triviaService'
import type { TaskCategory, TaskCompletionResult, TaskItem } from '../types'
import '../styles/MissionsPage.css'

interface MissionsPageProps {
  tasks: TaskItem[]
  onCreateTask: (taskData: {
    title: string
    category: TaskCategory
    custom_category?: string
    difficulty: number
  }) => Promise<TaskItem | undefined>
  onCompleteTask: (taskId: string) => void
  lastCompletion: TaskCompletionResult | null
  userId: string
  hasUser: boolean
  busy: boolean
}

export function MissionsPage({
  tasks,
  onCreateTask,
  onCompleteTask,
  lastCompletion,
  userId,
  hasUser,
  busy,
}: MissionsPageProps) {
  const [taskTitle, setTaskTitle] = useState('')
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('WORK')
  const [customCategory, setCustomCategory] = useState('')
  const [difficulty, setDifficulty] = useState(1)
  const [showFloatingReward, setShowFloatingReward] = useState(false)
  const [showTrivia, setShowTrivia] = useState(false)
  const [triviaBusy, setTriviaBusy] = useState(false)
  const [triviaMessage, setTriviaMessage] = useState('')
  const [triviaQuestion, setTriviaQuestion] = useState<{
    question: string
    correct_answer: string
    incorrect_answers: string[]
    difficulty: 'easy' | 'medium' | 'hard'
  } | null>(null)

  useEffect(() => {
    AudioManager.playZone('missions')
  }, [])

  useEffect(() => {
    if (!lastCompletion) {
      return
    }
    setShowFloatingReward(true)
  }, [lastCompletion])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    void onCreateTask({
      title: taskTitle.trim(),
      category: taskCategory,
      custom_category: taskCategory === 'CUSTOM' ? customCategory.trim() : undefined,
      difficulty,
    })

    setTaskTitle('')
    setCustomCategory('')
    setDifficulty(1)
  }

  const activeTasks = tasks.filter((t) => !t.is_completed)
  const completedTasks = tasks.filter((t) => t.is_completed)
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
  const categoryIcon: Record<TaskCategory, string> = {
    HEALTH: 'ra-heart',
    SOCIAL: 'ra-double-team',
    WORK: 'ra-crystal-ball',
    CUSTOM: 'ra-gem',
  }
  const categoryColor: Record<TaskCategory, string> = {
    HEALTH: 'var(--color-vitality)',
    SOCIAL: 'var(--color-custom)',
    WORK: 'var(--color-credits)',
    CUSTOM: 'var(--color-gold)',
  }
  const triviaAnswers = useMemo(() => {
    if (!triviaQuestion) {
      return []
    }
    const options = [...triviaQuestion.incorrect_answers, triviaQuestion.correct_answer]
    return options.sort(() => Math.random() - 0.5)
  }, [triviaQuestion])

  async function handleOpenTrivia() {
    setTriviaBusy(true)
    setTriviaMessage('')
    setShowTrivia(true)
    try {
      const question = await fetchTriviaQuestion('medium')
      if (!question) {
        setTriviaMessage('Unable to load challenge now.')
        return
      }
      setTriviaQuestion(question)
    } catch {
      setTriviaMessage('Unable to load challenge now.')
    } finally {
      setTriviaBusy(false)
    }
  }

  async function handleTriviaAnswer(answer: string) {
    if (!triviaQuestion || !userId || !hasUser) {
      return
    }

    if (answer !== triviaQuestion.correct_answer) {
      AudioManager.playSfx('error')
      setTriviaMessage('Wrong answer. Try another challenge.')
      return
    }

    setTriviaBusy(true)
    setTriviaMessage('Correct. Applying bonus mission...')

    try {
      const task = await onCreateTask({
        title: 'Daily Trivia Challenge',
        category: 'CUSTOM',
        custom_category: 'TRIVIA',
        difficulty: 2,
      })
      if (!task) {
        setTriviaMessage('Could not create challenge mission.')
        return
      }
      onCompleteTask(task.id)
      AudioManager.playSfx('mission_complete')
      setShowTrivia(false)
      setTriviaQuestion(null)
      setTriviaMessage('')
    } catch {
      AudioManager.playSfx('error')
      setTriviaMessage('Could not claim challenge reward.')
    } finally {
      setTriviaBusy(false)
    }
  }

  return (
    <div className="page missions-page">
      <div className="missions-header">
        <p className="missions-kicker">Mission Board</p>
        <h1>Turn goals into XP</h1>
        <p>Build your streak with focused tasks and convert consistency into progression.</p>
        <button
          type="button"
          className="create-mission-btn"
          style={{ marginTop: 12, maxWidth: 240 }}
          onClick={() => void handleOpenTrivia()}
          disabled={!hasUser || busy || triviaBusy}
        >
          Daily Challenge
        </button>
      </div>

      <AnimatePresence>
        {showFloatingReward && lastCompletion && (
          <FloatingReward
            amount={lastCompletion.reward_xp}
            type="xp"
            onDone={() => {
              setShowFloatingReward(false)
            }}
          />
        )}
      </AnimatePresence>

      <div className="missions-overview">
        <article>
          <span>Total</span>
          <strong>{tasks.length}</strong>
        </article>
        <article>
          <span>Active</span>
          <strong>{activeTasks.length}</strong>
        </article>
        <article>
          <span>Completed</span>
          <strong>{completedTasks.length}</strong>
        </article>
        <article>
          <span>Progress</span>
          <strong>{completionRate}%</strong>
        </article>
      </div>

      {hasUser && (
        <div className="create-mission-section">
          <h2>Create New Mission</h2>
          <form onSubmit={handleSubmit} className="mission-form">
            <div className="form-row">
              <input
                placeholder="Mission title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                disabled={busy}
              />
            </div>

            <div className="form-row">
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                disabled={busy}
              >
                <option value="HEALTH">⚔️ Health (Sword Stats + XP)</option>
                <option value="SOCIAL">🌳 Social (Tree Essence + XP)</option>
                <option value="WORK">💰 Work (Coins + XP)</option>
                <option value="CUSTOM">✨ Custom</option>
              </select>

              {taskCategory === 'CUSTOM' && (
                <input
                  placeholder="Category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  disabled={busy}
                />
              )}
            </div>

            <div className="form-row">
              <div className="difficulty-picker">
                <label>Difficulty</label>
                <div className="difficulty-buttons">
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`diff-btn ${difficulty === d ? 'active' : ''}`}
                      onClick={() => setDifficulty(d)}
                      disabled={busy}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={busy || !taskTitle.trim()} className="create-mission-btn">
              + Create Mission
            </button>
          </form>
        </div>
      )}

      {activeTasks.length > 0 && (
        <div className="missions-section">
          <h2>Active Missions ({activeTasks.length})</h2>
          <div className="mission-list">
            {activeTasks.map((task) => (
              <motion.div key={task.id} className="mission-card" variants={cardPopVariants} initial="initial" animate="animate" layout>
                <div className="mission-info">
                  <div className="mission-title">{task.title}</div>
                  <div className="mission-meta">
                    <span className="mission-category">
                      <i className={`ra ${categoryIcon[task.category]}`} style={{ color: categoryColor[task.category], marginRight: 6 }} />
                      {task.category}
                    </span>
                    <span className="mission-difficulty">
                      {[1, 2, 3].map((star) => (
                        <i
                          key={`${task.id}-star-${star}`}
                          className="ra ra-star"
                          style={{
                            color: star <= task.difficulty ? 'var(--color-gold)' : 'rgba(0, 0, 0, 0.25)',
                            marginRight: 4,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
                <button
                  className="complete-btn"
                  onClick={() => onCompleteTask(task.id)}
                  disabled={busy}
                  title="Complete mission"
                >
                  ✓
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="missions-section completed">
          <h2>Completed ({completedTasks.length})</h2>
          <div className="mission-list">
            {completedTasks.map((task) => (
              <motion.div key={task.id} className="mission-card completed" variants={missionCompleteExit} initial={false} animate={{ opacity: 1 }}>
                <div className="mission-info">
                  <div className="mission-title">{task.title}</div>
                  <div className="mission-meta">
                    <span className="mission-category">
                      <i className={`ra ${categoryIcon[task.category]}`} style={{ color: categoryColor[task.category], marginRight: 6 }} />
                      {task.category}
                    </span>
                  </div>
                </div>
                <span className="completed-badge">✓</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="empty-state">
          <p>No missions yet. Create one to get started!</p>
        </div>
      )}

      <AnimatePresence>
        {showTrivia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30,
            }}
          >
            <motion.div
              className="panel"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ width: 'min(680px, 90vw)', padding: '1rem 1.2rem' }}
            >
              <h2>Trivia Challenge</h2>
              {triviaBusy && <p>Loading challenge...</p>}
              {!triviaBusy && triviaQuestion && (
                <>
                  <p dangerouslySetInnerHTML={{ __html: triviaQuestion.question }} />
                  <div style={{ display: 'grid', gap: 8 }}>
                    {triviaAnswers.map((answer) => (
                      <button
                        key={answer}
                        type="button"
                        className="complete-btn"
                        style={{ width: '100%', padding: '0.7rem 0.8rem', textAlign: 'left' }}
                        onClick={() => void handleTriviaAnswer(answer)}
                      >
                        <span dangerouslySetInnerHTML={{ __html: answer }} />
                      </button>
                    ))}
                  </div>
                </>
              )}
              {triviaMessage && <p>{triviaMessage}</p>}
              <button
                type="button"
                className="create-mission-btn"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setShowTrivia(false)
                  setTriviaQuestion(null)
                  setTriviaMessage('')
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
