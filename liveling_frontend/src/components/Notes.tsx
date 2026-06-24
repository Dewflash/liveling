import { useState } from 'react'
import '../styles/widgets/Notes.css'
import { mockNotes } from '../mockData'

interface Note {
  id: string
  content: string
  timestamp: string
}

interface NotesProps {
  notes?: Note[]
  onAdd?: () => void
  onDelete?: (id: string) => void
}

export function Notes({ notes = mockNotes.user_1, onAdd, onDelete }: NotesProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h3>📝 Notes</h3>
        {onAdd && (
          <button className="quick-add-btn" onClick={onAdd} title="Add note">
            +
          </button>
        )}
      </div>

      <div className={`notes-container ${expanded ? 'expanded' : 'collapsed'}`}>
        {notes.length === 0 ? (
          <p className="empty-notes">No notes yet. Start writing!</p>
        ) : (
          <div className="notes-grid">
            {notes.slice(0, expanded ? notes.length : 3).map((note) => (
              <div key={note.id} className="note-card">
                <p className="note-content">{note.content}</p>
                <div className="note-footer">
                  <span className="note-time">{note.timestamp}</span>
                  {onDelete && (
                    <button
                      className="note-delete"
                      onClick={() => onDelete(note.id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notes.length > 3 && (
        <button
          className="notes-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '− Collapse' : `+ Show ${notes.length - 3} more`}
        </button>
      )}
    </div>
  )
}
