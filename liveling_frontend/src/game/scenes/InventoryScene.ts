import Phaser from 'phaser'
import { EventBus } from '../EventBus'
import type { PhaserInventoryItem } from '../types'

export class InventoryScene extends Phaser.Scene {
  private items: PhaserInventoryItem[] = []
  private itemContainer: Phaser.GameObjects.Container | null = null

  constructor() {
    super({ key: 'InventoryScene', active: false })
  }

  create() {
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, 0x000000, 0.72).setOrigin(0).setScrollFactor(0)

    const panelW = Math.min(560, width - 40)
    const panelH = Math.min(430, height - 60)
    const panelX = width / 2
    const panelY = height / 2

    this.add
      .rectangle(panelX, panelY, panelW, panelH, 0x1a120a, 0.98)
      .setStrokeStyle(2, 0xc9a84c)
      .setScrollFactor(0)

    this.add
      .text(panelX, panelY - panelH / 2 + 20, 'Inventory', {
        fontSize: '18px',
        color: '#c9a84c',
        fontFamily: 'Cinzel',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)

    const closeBtn = this.add
      .text(panelX + panelW / 2 - 16, panelY - panelH / 2 + 16, '✕', {
        fontSize: '16px',
        color: '#cc8844',
        fontFamily: 'JetBrains Mono',
      })
      .setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' })
      .setOrigin(0.5)

    closeBtn.on('pointerdown', () => this.closeInventory())

    this.input.keyboard!.once('keydown-ESC', () => this.closeInventory())
    this.input.keyboard!.once('keydown-I', () => this.closeInventory())

    EventBus.on('inventory-data', (items: PhaserInventoryItem[]) => {
      this.items = items
      this.renderItems(panelX - panelW / 2 + 38, panelY - panelH / 2 + 74)
    })

    EventBus.emit('request-inventory')
  }

  private renderItems(startX: number, startY: number) {
    this.itemContainer?.destroy(true)
    this.itemContainer = this.add.container(0, 0)

    const cell = 48
    const cols = 8

    this.items.forEach((item, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = startX + col * cell
      const y = startY + row * cell

      const rarity = this.rarityColor(item.rarity)
      const bg = this.add
        .rectangle(x, y, 40, 40, item.equipped ? 0x2a3a1a : 0x1a1208)
        .setStrokeStyle(1, rarity)
        .setOrigin(0.5)
        .setInteractive({ cursor: 'pointer' })

      const iconBg = this.add.circle(x, y, 11, rarity, 0.25).setStrokeStyle(1, rarity)
      const icon = this.add
        .text(x, y, item.slot.slice(0, 1).toUpperCase(), {
          fontSize: '9px',
          color: '#f2eadf',
          fontFamily: 'JetBrains Mono',
        })
        .setOrigin(0.5)
      const power = this.add
        .text(x + 14, y + 14, String(item.power), {
          fontSize: '7px',
          color: '#e8c96a',
          fontFamily: 'JetBrains Mono',
        })
        .setOrigin(1, 1)

      bg.on('pointerdown', () => {
        EventBus.emit('equip-request', { itemId: item.id })
        EventBus.emit('sfx', 'equip')
      })

      this.itemContainer?.add([bg, iconBg, icon, power])
    })
  }

  private rarityColor(rarity: string): number {
    const map: Record<string, number> = {
      common: 0x9a9a9a,
      uncommon: 0x3a9a3a,
      rare: 0x3a5aaa,
      epic: 0x8a2aaa,
      legendary: 0xc9a84c,
    }
    return map[rarity] ?? 0x9a9a9a
  }

  private closeInventory() {
    EventBus.removeAllListeners('inventory-data')
    this.scene.stop('InventoryScene')
    this.scene.resume('WorldScene')
  }
}
