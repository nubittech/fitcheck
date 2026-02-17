import React, { useState } from 'react'
import OutfitCard from './components/OutfitCard'
import BottomNav from './components/BottomNav'
import './styles/App.css'

const MOCK_OUTFITS = [
  {
    id: 1,
    user: { name: 'Elif_Y', age: 24, location: 'Istanbul, TR', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', isPremium: false },
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1080',
    caption: 'Just a casual Tuesday look. Vintage find with my favorite denim. 🔥',
    items: [
      { id: 1, name: 'Vintage Leather Jacket', brand: 'Vintage Shop', location: 'Beyoglu', votes: { up: 342, down: 12 }, position: { x: '50%', y: '35%' } },
      { id: 2, name: 'High-waist Denim', brand: 'Zara', location: 'Zorlu AVM', votes: { up: 287, down: 8 }, position: { x: '50%', y: '65%' } }
    ],
    comments: [
      { id: 1, user: 'Ayse_23', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', text: 'Ceket muhtesem! 😍', timestamp: '2s once' },
      { id: 2, user: 'Merve', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', text: 'Nereden buldun bu ceketi? 🔥', timestamp: '5dk once' }
    ],
    stats: { views: 234, likes: 89, commentsCount: 24 },
    isBoosted: false
  },
  {
    id: 2,
    user: { name: 'Zeynep', age: 27, location: 'Ankara, TR', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', isPremium: true },
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1080',
    caption: 'Minimalist vibes for the weekend ✨',
    items: [
      { id: 1, name: 'Oversized Blazer', brand: 'Mango', votes: { up: 421, down: 5 }, position: { x: '50%', y: '40%' } },
      { id: 2, name: 'White Crop Top', brand: 'H&M', votes: { up: 312, down: 15 }, position: { x: '50%', y: '58%' } }
    ],
    comments: [],
    stats: { views: 567, likes: 142, commentsCount: 38 },
    isBoosted: true
  },
  {
    id: 3,
    user: { name: 'Selin', age: 22, location: 'Izmir, TR', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', isPremium: false },
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1080',
    caption: 'Street style essentials 🌃',
    items: [
      { id: 1, name: 'Graphic Hoodie', brand: 'Pull&Bear', votes: { up: 234, down: 18 }, position: { x: '50%', y: '45%' } },
      { id: 2, name: 'Cargo Pants', brand: 'Bershka', votes: { up: 198, down: 22 }, position: { x: '50%', y: '68%' } }
    ],
    comments: [],
    stats: { views: 189, likes: 67, commentsCount: 12 },
    isBoosted: false
  }
]

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('home')
  const [outfits, setOutfits] = useState(MOCK_OUTFITS)

  const handleNext = () => {
    if (currentIndex < outfits.length - 1) setCurrentIndex(prev => prev + 1)
  }
  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }
  const handleLike = () => {
    setOutfits(prev => prev.map(o =>
      o.id === outfits[currentIndex].id
        ? { ...o, stats: { ...o.stats, likes: o.stats.likes + 1 } }
        : o
    ))
  }

  return (
    <div className="app">
      <OutfitCard
        outfit={outfits[currentIndex]}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleNext}
        onLike={handleLike}
      />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
