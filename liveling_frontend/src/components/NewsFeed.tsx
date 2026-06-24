import '../styles/widgets/NewsFeed.css'
import { mockNewsItems } from '../mockData'

interface NewsItem {
  id: string
  type: 'daily' | 'follow'
  username?: string
  message: string
  timestamp: string
  icon?: string
}

interface NewsFeedProps {
  items?: NewsItem[]
  onAdd?: () => void
}

export function NewsFeed({ items = mockNewsItems, onAdd }: NewsFeedProps) {
  return (
    <div className="news-feed">
      <div className="news-header">
        <h3>Your Feed</h3>
        {onAdd && (
          <button className="quick-add-btn" onClick={onAdd} title="Add news">
            +
          </button>
        )}
      </div>

      <div className="news-list">
        {items.length === 0 ? (
          <p className="empty-feed">No news yet. Follow friends to see their progress!</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`news-item ${item.type}`}>
              <span className="news-icon">{item.icon || '📰'}</span>
              <div className="news-content">
                {item.type === 'follow' && (
                  <span className="news-username">{item.username}</span>
                )}
                <p className="news-message">{item.message}</p>
                <span className="news-time">{item.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
