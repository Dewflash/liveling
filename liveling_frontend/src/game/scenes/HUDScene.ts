import Phaser from 'phaser'
import { EventBus } from '../EventBus'

export class HUDScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Rectangle
  private woodText!: Phaser.GameObjects.Text
  private ironText!: Phaser.GameObjects.Text
  private shardText!: Phaser.GameObjects.Text
  private gearText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'HUDScene', active: false })
  }

  create() {
    const { width, height } = this.scale

    const barX = 16
    const barY = height - 30
    this.add.rectangle(barX, barY, 160, 14, 0x220000).setOrigin(0, 0.5).setScrollFactor(0)
    this.hpBar = this.add.rectangle(barX + 1, barY, 158, 12, 0xcc2222).setOrigin(0, 0.5).setScrollFactor(0)

    this.woodText = this.addText(width / 2 - 150, 20, '🪵 0')
    this.ironText = this.addText(width / 2 - 80, 20, '⛏ 0')
    this.shardText = this.addText(width / 2 - 8, 20, '💠 0')
    this.gearText = this.addText(width / 2 + 70, 20, '⚔ GS:0')

    const bagButton = this.add
      .text(width - 16, height - 30, '🎒', { fontSize: '24px' })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' })

    bagButton.on('pointerdown', () => {
      this.scene.pause('WorldScene')
      this.scene.launch('InventoryScene')
    })

    EventBus.on('hud-update', (data: { hp?: number; maxHp?: number; wood?: number; iron?: number; shards?: number; gear?: number }) => {
      if (data.hp !== undefined && data.maxHp) {
        this.hpBar.width = Math.max(0, 158 * (data.hp / data.maxHp))
      }
      if (data.wood !== undefined) {
        this.woodText.setText(`🪵 ${data.wood}`)
      }
      if (data.iron !== undefined) {
        this.ironText.setText(`⛏ ${data.iron}`)
      }
      if (data.shards !== undefined) {
        this.shardText.setText(`💠 ${data.shards}`)
      }
      if (data.gear !== undefined) {
        this.gearText.setText(`⚔ GS:${data.gear}`)
      }
    })
  }

  private addText(x: number, y: number, value: string) {
    return this.add
      .text(x, y, value, {
        fontSize: '11px',
        color: '#e8dcc8',
        fontFamily: 'JetBrains Mono',
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
  }
}
