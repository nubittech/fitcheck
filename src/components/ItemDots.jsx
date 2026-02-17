import React, { useState } from 'react'
import '../styles/ItemDots.css'

const ItemDots = ({ items }) => {
  const [activeItem, setActiveItem] = useState(null)

  return (
    <div className="item-dots">
      {items.map(item => (
        <div key={item.id}>
          <button
            className={`item-dot ${activeItem?.id === item.id ? 'active' : ''}`}
            style={{ left: item.position.x, top: item.position.y }}
            onClick={() => setActiveItem(activeItem?.id === item.id ? null : item)}
          >
            <div className="dot-inner"></div>
          </button>

          {activeItem?.id === item.id && (
            <div className="item-tooltip" style={{ left: item.position.x, top: item.position.y }}>
              <div className="tooltip-name">{item.name}</div>
              {item.brand && <div className="tooltip-brand">{item.brand}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ItemDots
