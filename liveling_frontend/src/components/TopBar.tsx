
import type { UserProfile } from '../types'
import { XpBar } from './XpBar'
import '../styles/widgets/TopBar.css'

interface TopBarProps {
  profile: UserProfile | null
}

export function TopBar({ profile }: TopBarProps) {
  const maxXP = 1000 // Example max XP per level
  const levelXp = profile ? profile.total_xp % maxXP : 0
  const xpPercent = profile ? (levelXp / maxXP) * 100 : 0

  return (
    <div className="top-bar">
      <div className="xp-section">
        <div className="xp-info">
          <span className="xp-label">Level {profile?.current_level || 0}</span>
          <span className="xp-value">{profile?.total_xp || 0} XP</span>
        </div>
        <div className="xp-bar-container">
          <XpBar current={levelXp} max={maxXP} />
          <span className="xp-percent">{Math.round(xpPercent)}%</span>
        </div>
      </div>

      <div className="currencies-section">
        <div className="currency-item essence">
          <span className="currency-icon"><i className="ra ra-oak" /></span>
          <span className="currency-value stat">{profile?.essence || 0}</span>
        </div>
        <div className="currency-item vitality">
          <span className="currency-icon"><i className="ra ra-sword" /></span>
          <span className="currency-value stat">{profile?.vitality || 0}</span>
        </div>
        <div className="currency-item credits">
          <span className="currency-icon"><i className="ra ra-coins" /></span>
          <span className="currency-value stat">{profile?.credits || 0}</span>
        </div>
        <div className="currency-item custom">
          <span className="currency-icon"><i className="ra ra-gem" /></span>
          <span className="currency-value stat">{profile?.custom_wallet || 0}</span>
        </div>
      </div>
    </div>
  )
}
