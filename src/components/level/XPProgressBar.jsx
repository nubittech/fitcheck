import React from 'react'

const XPProgressBar = ({ xp = 0, progress = 0, range = 100, percentage = 0, level = 1 }) => {
  return (
    <div className="xp-progress-wrap">
      <div className="xp-progress-labels">
        <span className="xp-progress-current">LVL {level}</span>
        <span className="xp-progress-xp">{progress} / {range} XP</span>
        <span className="xp-progress-next">LVL {level + 1}</span>
      </div>
      <div className="xp-progress-track">
        <div
          className="xp-progress-fill"
          style={{ width: `${Math.min(percentage * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default XPProgressBar
