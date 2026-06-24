import Phaser from 'phaser'
import { EventBus } from '../EventBus'

const SPEED = 120

type Facing = 'north' | 'south' | 'east' | 'west'

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
  }
  private facing: Facing = 'south'
  private isAttacking = false
  private enemies!: Phaser.Physics.Arcade.Group

  constructor() {
    super('WorldScene')
  }

  create() {
    this.createWorld()

    const spawnX = 320
    const spawnY = 240
    this.player = this.physics.add.image(spawnX, spawnY, 'forest_tree_sheet')
    this.player.setDisplaySize(34, 34)
    this.player.setTint(0xe8dcc8)
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(this.player.y)

    this.spawnEnemies()

    this.cameras.main.setBounds(0, 0, 1280, 960)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(2.2)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as {
      up: Phaser.Input.Keyboard.Key
      down: Phaser.Input.Keyboard.Key
      left: Phaser.Input.Keyboard.Key
      right: Phaser.Input.Keyboard.Key
    }

    this.input.keyboard!.on('keydown-SPACE', () => this.attack())
    this.input.keyboard!.on('keydown-I', () => {
      this.scene.pause('WorldScene')
      this.scene.launch('InventoryScene')
    })

    EventBus.emit('current-scene-ready', this)
  }

  update() {
    if (this.isAttacking) {
      return
    }

    const upC = this.cursors.up.isDown || this.wasd.up.isDown
    const downC = this.cursors.down.isDown || this.wasd.down.isDown
    const leftC = this.cursors.left.isDown || this.wasd.left.isDown
    const rightC = this.cursors.right.isDown || this.wasd.right.isDown

    let vx = 0
    let vy = 0

    if (leftC) {
      vx -= SPEED
      this.facing = 'west'
    }
    if (rightC) {
      vx += SPEED
      this.facing = 'east'
    }
    if (upC) {
      vy -= SPEED
      this.facing = 'north'
    }
    if (downC) {
      vy += SPEED
      this.facing = 'south'
    }

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707
      vy *= 0.707
    }

    this.player.setVelocity(vx, vy)
    this.player.setDepth(this.player.y)
    this.player.setScale(vx !== 0 || vy !== 0 ? 1.02 : 1)
  }

  private createWorld() {
    const treeTexture = this.textures.exists('tree_svg_custom') ? 'tree_svg_custom' : 'forest_tree_sheet'
    const graphics = this.add.graphics()
    graphics.fillStyle(0x315e33, 1)
    graphics.fillRect(0, 0, 1280, 960)

    for (let i = 0; i < 90; i += 1) {
      graphics.fillStyle(0x2a4f2c, 0.25)
      graphics.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 960), Phaser.Math.Between(10, 30))
    }

    const treeCount = 22
    for (let i = 0; i < treeCount; i += 1) {
      const x = Phaser.Math.Between(80, 1200)
      const y = Phaser.Math.Between(80, 900)
      const tree = this.add.image(x, y, treeTexture).setOrigin(0.5, 1)
      tree.setDepth(y)
      tree.setScale(0.5 + Math.random() * 0.35)
      tree.setAlpha(0.86)
      tree.setTint(0x7ab773)
    }
  }

  private spawnEnemies() {
    this.enemies = this.physics.add.group()

    const defs = [
      { x: 400, y: 280, tier: 'normal', hp: 30 },
      { x: 640, y: 420, tier: 'normal', hp: 40 },
      { x: 860, y: 320, tier: 'elite', hp: 75 },
      { x: 1040, y: 560, tier: 'boss', hp: 180 },
    ] as const

    defs.forEach((def, index) => {
      const enemy = this.physics.add.image(def.x, def.y, 'forest_tree_sheet')
      const scale = def.tier === 'boss' ? 2.4 : def.tier === 'elite' ? 1.6 : 1.2
      enemy.setDisplaySize(24 * scale, 24 * scale)
      enemy.setTint(def.tier === 'boss' ? 0xff6464 : def.tier === 'elite' ? 0xffc864 : 0x8bd18b)
      enemy.setData({
        id: `enemy_${index}`,
        type: def.tier === 'boss' ? 'demon' : def.tier === 'elite' ? 'orc' : 'goblin',
        tier: def.tier,
        hp: def.hp,
        maxHp: def.hp,
      })
      enemy.setDepth(enemy.y)

      this.time.addEvent({
        delay: 2000 + Math.random() * 800,
        loop: true,
        callback: () => {
          const angle = Math.random() * Math.PI * 2
          enemy.setVelocity(Math.cos(angle) * 30, Math.sin(angle) * 30)
          this.time.delayedCall(1100, () => enemy.setVelocity(0, 0))
        },
      })

      this.physics.add.overlap(this.player, enemy, () => {
        EventBus.emit('start-combat', {
          enemyId: enemy.getData('id'),
          enemyType: enemy.getData('type'),
          enemyTier: enemy.getData('tier'),
          enemyHp: enemy.getData('hp'),
          enemyMaxHp: enemy.getData('maxHp'),
        })
        this.scene.pause('WorldScene')
        this.scene.launch('CombatScene', {
          enemyData: {
            id: enemy.getData('id'),
            type: enemy.getData('type'),
            tier: enemy.getData('tier'),
            hp: enemy.getData('hp'),
            maxHp: enemy.getData('maxHp'),
          },
        })
      })

      this.enemies.add(enemy)
    })
  }

  private attack() {
    if (this.isAttacking) {
      return
    }

    this.isAttacking = true
    this.player.setVelocity(0, 0)
    this.tweens.add({
      targets: this.player,
      scale: 1.22,
      yoyo: true,
      duration: 100,
      repeat: 1,
      onComplete: () => {
        this.player.setScale(1)
        this.isAttacking = false
        this.checkMeleeHit()
      },
    })

    EventBus.emit('sfx', 'combat_hit')
  }

  private checkMeleeHit() {
    const range = 32
    const offsets: Record<Facing, [number, number]> = {
      north: [0, -range],
      south: [0, range],
      east: [range, 0],
      west: [-range, 0],
    }

    const [ox, oy] = offsets[this.facing]
    const hitX = this.player.x + ox
    const hitY = this.player.y + oy

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Phaser.Types.Physics.Arcade.ImageWithDynamicBody
      const dist = Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y)
      if (dist < 24) {
        EventBus.emit('enemy-hit', {
          enemyId: enemy.getData('id'),
          damage: Math.floor(10 + Math.random() * 8),
        })
      }
    })
  }
}
