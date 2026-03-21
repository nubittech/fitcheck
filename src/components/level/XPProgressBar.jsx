import React from 'react'
import '../../styles/Profile.css'

const XPProgressBar = ({ xp = 0, progress = 0, range = 100, percentage = 0, level = 1 }) => {
  return (
    <div className="xp-progress-v2-container">
      <div className="xp-progress-v2-header">
        <span className="xp-v2-label">PROGRESS TO LV. {level + 1}</span>
        <span className="xp-v2-value">{progress} / {range} XP</span>
      </div>
      <div className="xp-progress-v2-track">
        <div
          className="xp-progress-v2-fill"
          style={{ width: `${Math.min(percentage * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default XPProgressBar
