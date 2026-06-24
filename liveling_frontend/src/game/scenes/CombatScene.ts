import Phaser from 'phaser'
import { EventBus } from '../EventBus'
import { PollinationsService } from '../../services/pollinationsService'

interface CombatData {
  enemyData?: {
    id: string
    type: string
    tier: 'normal' | 'elite' | 'boss'
    hp: number
    maxHp: number
  }
}

export class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene', active: false })
  }

  create(data: CombatData) {
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0)

    const panel = this.add
      .rectangle(width / 2, height - 140, width - 40, 240, 0x0a100a, 0.95)
      .setStrokeStyle(2, 0xc9a84c)

    const enemyName = data.enemyData?.type ?? 'Unknown Foe'
    const enemyTier = data.enemyData?.tier ?? 'normal'

    const portraitUrl = PollinationsService.enemyPortrait(enemyName, enemyTier)
    const texKey = `enemy_portrait_${enemyName}_${enemyTier}`
    const portrait = this.add.image(90, height - 200, 'forest_tree_sheet').setScale(0.6)

    if (!this.textures.exists(texKey)) {
      this.load.image(texKey, portraitUrl)
      this.load.once('complete', () => {
        if (this.textures.exists(texKey)) {
          portrait.setTexture(texKey)
          portrait.setDisplaySize(130, 130)
        }
      })
      this.load.start()
    } else {
      portrait.setTexture(texKey)
      portrait.setDisplaySize(130, 130)
    }

    this.add
      .text(width / 2, height - 235, enemyName.toUpperCase(), {
        fontSize: '16px',
        color: '#e8c96a',
        fontFamily: 'Cinzel',
      })
      .setOrigin(0.5)

    const hpBg = this.add.rectangle(160, height - 210, 200, 12, 0x330000).setOrigin(0, 0.5)
    const hpFill = this.add.rectangle(161, height - 210, 198, 10, 0xcc3333).setOrigin(0, 0.5)
    const logText = this.add
      .text(width / 2, height - 185, '', {
        fontSize: '11px',
        color: '#c8c0b0',
        fontFamily: 'Lora',
        wordWrap: { width: 320 },
        align: 'center',
      })
      .setOrigin(0.5)

    ;['Attack', 'Defend', 'Flee'].forEach((action, i) => {
      const btnX = width / 2 - 120 + i * 120
      const btnY = height - 55
      const btn = this.add
        .rectangle(btnX, btnY, 100, 32, 0x1a2a1a)
        .setStrokeStyle(1, 0x4a8a4a)
        .setInteractive({ cursor: 'pointer' })
      this.add
        .text(btnX, btnY, action, {
          fontSize: '12px',
          color: '#9fdfaf',
          fontFamily: 'Cinzel',
        })
        .setOrigin(0.5)

      btn.on('pointerover', () => btn.setFillStyle(0x2a4a2a))
      btn.on('pointerout', () => btn.setFillStyle(0x1a2a1a))
      btn.on('pointerdown', () => {
        EventBus.emit('combat-action', { action: action.toLowerCase(), enemyTier })
        if (action === 'Flee') {
          this.endCombat(false)
        }
      })
    })

    EventBus.on(
      'combat-result',
      (result: { damage: number; isCrit: boolean; enemyHpPct: number; log: string; victory: boolean }) => {
        hpFill.width = 198 * Math.max(0, Math.min(1, result.enemyHpPct))
        hpFill.fillColor = result.enemyHpPct > 0.5 ? 0x33aa33 : result.enemyHpPct > 0.25 ? 0xccaa00 : 0xcc2222
        logText.setText(result.log)
        EventBus.emit('sfx', result.isCrit ? 'combat_crit' : 'combat_hit')

        if (result.victory) {
          this.time.delayedCall(800, () => this.endCombat(true))
        }
      },
    )

    panel.setDepth(1)
    hpBg.setDepth(2)
    hpFill.setDepth(3)
    logText.setDepth(4)
  }

  private endCombat(victory: boolean) {
    EventBus.removeAllListeners('combat-result')
    this.scene.stop('CombatScene')
    this.scene.resume('WorldScene')
    if (victory) {
      EventBus.emit('combat-victory')
    }
  }
}
