import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

import { AudioManager } from '../audio/AudioManager'
import type { ShopItemType } from '../types'
import '../styles/ShopPage.css'

interface ShopPageProps {
  onBuy: (itemData: {
    item_type: ShopItemType
    amount: number
  }) => void
  hasUser: boolean
  busy: boolean
}

export function ShopPage({ onBuy, hasUser, busy }: ShopPageProps) {
  const [shopType, setShopType] = useState<ShopItemType>('BUY_TREE_ESSENCE')
  const [amount, setAmount] = useState(50)

  const rateMap: Record<ShopItemType, number> = {
    BUY_TREE_ESSENCE: 2,
    BUY_SWORD_STATS: 3,
    BUY_STAR_POINTS: 4,
  }

  const labelMap: Record<ShopItemType, string> = {
    BUY_TREE_ESSENCE: 'Tree Essence',
    BUY_SWORD_STATS: 'Sword Stats Points',
    BUY_STAR_POINTS: 'Star Points',
  }

  const estimatedCost = amount * rateMap[shopType]

  useEffect(() => {
    AudioManager.playZone('shop')
  }, [])

  const handleBuy = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!hasUser || amount <= 0) {
      AudioManager.playSfx('error')
      return
    }
    AudioManager.playSfx('button_click')
    onBuy({
      item_type: shopType,
      amount,
    })
  }

  const offers: Array<{ type: ShopItemType; icon: string; title: string; rate: string }> = [
    { type: 'BUY_TREE_ESSENCE', icon: '🌳', title: 'Tree Essence', rate: '2 coins each' },
    { type: 'BUY_SWORD_STATS', icon: '⚔️', title: 'Sword Stats', rate: '3 coins each' },
    { type: 'BUY_STAR_POINTS', icon: '⭐', title: 'Star Points', rate: '4 coins each' },
  ]

  return (
    <div className="page shop-page">
      <div className="shop-header">
        <p className="shop-kicker">Exchange Hub</p>
        <h1>Convert Coins Into Power</h1>
        <p>Spend coins (💰) to rebalance your build across essence, sword stats, and stars.</p>
      </div>

      <div className="shop-container">
        <div className="avatar-corner">
          <div className="avatar-display">
            <span className="avatar-emoji">😌</span>
            <p>Merchant's Corner</p>
          </div>
        </div>

        <div className="shop-offers" aria-label="Available offers">
          {offers.map((offer) => (
            <motion.button
              key={offer.type}
              type="button"
              className={`offer-card ${shopType === offer.type ? 'active' : ''}`}
              onClick={() => setShopType(offer.type)}
              disabled={busy || !hasUser}
              whileTap={{ scale: 0.95 }}
            >
              <span className="offer-icon">
                {offer.type === 'BUY_TREE_ESSENCE' && <i className="ra ra-oak" />}
                {offer.type === 'BUY_SWORD_STATS' && <i className="ra ra-sword" />}
                {offer.type === 'BUY_STAR_POINTS' && <i className="ra ra-star" />}
              </span>
              <span className="offer-title">{offer.title}</span>
              <span className="offer-rate">{offer.rate}</span>
            </motion.button>
          ))}
        </div>

        {hasUser && (
          <div className="purchase-section">
            <h2>Purchase</h2>
            <form onSubmit={handleBuy} className="shop-form">
              <div className="form-group">
                <label>Item</label>
                <select
                  value={shopType}
                  onChange={(e) => setShopType(e.target.value as ShopItemType)}
                  disabled={busy}
                >
                  <option value="BUY_TREE_ESSENCE">🌳 Buy Tree Essence (2 coins each)</option>
                  <option value="BUY_SWORD_STATS">⚔️ Buy Sword Stats (3 coins each)</option>
                  <option value="BUY_STAR_POINTS">⭐ Buy Star Points (4 coins each)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount To Buy</label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  disabled={busy}
                />
              </div>

              <p className="shop-hint">
                You will spend <strong>{estimatedCost} 💰</strong> to buy{' '}
                <strong>{amount} {labelMap[shopType]}</strong>.
              </p>

              <button type="submit" disabled={busy || !hasUser} className="purchase-btn">
                🛒 Purchase
              </button>
            </form>
          </div>
        )}

        {!hasUser && (
          <div className="empty-state">
            <p>Create a user first to access the shop</p>
          </div>
        )}
      </div>
    </div>
  )
}
