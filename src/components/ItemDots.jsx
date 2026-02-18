import React from 'react'
import '../styles/ItemDots.css'

const ItemDots = ({ items }) => {
  return (
    <div className="item-dots">
      {items.map(item => (
        <button
          key={item.id}
          className="item-dot"
          style={{ left: item.position.x, top: item.position.y }}
        >
          <div className="dot-inner" />
        </button>
      ))}
    </div>
  )
}

export default ItemDots
