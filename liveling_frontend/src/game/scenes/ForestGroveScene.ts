import Phaser from 'phaser'
import { EventBus } from '../EventBus'
import type { PlantedTreeSprite } from '../types'

interface GroveInitData {
  trees?: PlantedTreeSprite[]
}

const PRIMARY_TREE_LIMIT = 45

const GROVE_TREE_ASSETS = Array.from({ length: 89 }, (_, index) => index + 1).map((id) => {
  const fileName = `tree_${String(id).padStart(2, '0')}.svg`
  if (id <= PRIMARY_TREE_LIMIT) {
    return `/trees/forest-svg/${fileName}`
  }
  return `/trees/forest-svg-batch2/${fileName}`
})

function treeTextureKeyFromPath(path: string): string {
  const file = path.split('/').pop() ?? 'tree'
  return `tree_design_${file.replace(/\.[^.]+$/, '')}`
}

const ROW_HEIGHT = 34
const ICON_SIZE = 30
const LEFT_ICON_X = 137
const RIGHT_ICON_X = 406

const LEFT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
const RIGHT_IDS = [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]

const speciesToId: Record<string, number> = {
  oak: 41,
  pine: 13,
  maple: 34,
  bamboo: 12,
  birch: 42,
  cedar: 1,
}

export class ForestGroveScene extends Phaser.Scene {
  private trees: PlantedTreeSprite[] = []
  private isDragging = false
  private dragStart = { x: 0, y: 0 }
  private dragCameraStart = { x: 0, y: 0 }

  constructor() {
    super('ForestGroveScene')
  }

  init(data: GroveInitData) {
    this.trees = data.trees ?? []
  }

  preload() {
    this.load.image('forest_tree_sheet', '/assets/nature/trees/forest-trees-sheet.png')

    GROVE_TREE_ASSETS.forEach((path) => {
      this.load.image(treeTextureKeyFromPath(path), path)
    })
  }

  create() {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#edf7eb')

    const bg = this.add.graphics()
    const worldWidth = Math.max(width * 3.4, 2200)
    const worldHeight = Math.max(height * 2.6, 1600)
    bg.fillStyle(0xf1f9ef, 1)
    bg.fillRect(-240, -240, worldWidth + 480, worldHeight + 480)

    for (let i = 0; i < 100; i += 1) {
      bg.fillStyle(0xb4d8b8, 0.1)
      bg.fillCircle(
        Phaser.Math.Between(-120, worldWidth + 120),
        Phaser.Math.Between(-120, worldHeight + 120),
        Phaser.Math.Between(18, 54),
      )
    }

    this.trees.forEach((tree, index) => {
      const textureKey = this.resolveTextureKey(tree)
      const useSheetFallback = textureKey === 'forest_tree_sheet'
      const sprite = this.add.image(tree.x, tree.y, textureKey).setOrigin(0.5, 1)

      if (useSheetFallback) {
        const crop = this.getCropForTree(tree)
        sprite.setCrop(crop.x, crop.y, crop.w, crop.h)
      }

      const depthRatio = Phaser.Math.Clamp(tree.y / worldHeight, 0, 1)
      const depthScale = Phaser.Math.Linear(0.78, 1.18, depthRatio)
      const stageScale = 0.84 + tree.growthStage * 0.08
      sprite.setScale(depthScale * stageScale)
      sprite.x += (depthRatio - 0.5) * 42
      sprite.setDepth(tree.y)
      sprite.setInteractive({ cursor: 'pointer' })

      sprite.on('pointerdown', () => {
        EventBus.emit('sfx', 'chop_tree')
        this.showTreeInfo(sprite.x, sprite.y, tree)
        this.tweens.add({
          targets: sprite,
          angle: { from: -4, to: 4 },
          yoyo: true,
          repeat: 2,
          duration: 85,
          onComplete: () => {
            sprite.angle = 0
          },
        })
      })

      sprite.on('pointerover', () => sprite.setAlpha(0.86))
      sprite.on('pointerout', () => sprite.setAlpha(1))

      this.tweens.add({
        targets: sprite,
        angle: [-1, 1],
        duration: 2200 + (index % 8) * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    })

    const worldBounds = this.getTreeBounds(worldWidth, worldHeight)
    this.cameras.main.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height)
    this.cameras.main.setZoom(0.82)

    const centerX = worldBounds.x + worldBounds.width / 2
    const centerY = worldBounds.y + worldBounds.height / 2
    this.cameras.main.centerOn(centerX, centerY)

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true
      this.dragStart.x = pointer.x
      this.dragStart.y = pointer.y
      this.dragCameraStart.x = this.cameras.main.scrollX
      this.dragCameraStart.y = this.cameras.main.scrollY
    })

    this.input.on('pointerup', () => {
      this.isDragging = false
    })

    this.input.on('pointerout', () => {
      this.isDragging = false
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) {
        return
      }

      const zoom = this.cameras.main.zoom || 1
      this.cameras.main.scrollX = this.dragCameraStart.x - (pointer.x - this.dragStart.x) / zoom
      this.cameras.main.scrollY = this.dragCameraStart.y - (pointer.y - this.dragStart.y) / zoom
    })

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _dx: number, dy: number) => {
      const nextZoom = Phaser.Math.Clamp(this.cameras.main.zoom - dy * 0.0015, 0.55, 1.35)
      this.cameras.main.setZoom(nextZoom)
    })

    EventBus.emit('current-scene-ready', this)
  }

  private getTreeBounds(worldWidth: number, worldHeight: number) {
    const padding = 260
    const positions = this.trees.map((tree) => ({ x: tree.x, y: tree.y }))

    if (positions.length === 0) {
      return { x: -padding, y: -padding, width: worldWidth + padding * 2, height: worldHeight + padding * 2 }
    }

    const minX = Math.min(...positions.map((point) => point.x))
    const maxX = Math.max(...positions.map((point) => point.x))
    const minY = Math.min(...positions.map((point) => point.y))
    const maxY = Math.max(...positions.map((point) => point.y))

    return {
      x: Math.floor(minX - padding),
      y: Math.floor(minY - padding),
      width: Math.ceil(maxX - minX + padding * 2),
      height: Math.ceil(maxY - minY + padding * 2),
    }
  }

  private resolveTextureKey(tree: PlantedTreeSprite): string {
    if (tree.iconUrl) {
      const key = treeTextureKeyFromPath(tree.iconUrl)
      if (this.textures.exists(key)) {
        return key
      }
    }

    return 'forest_tree_sheet'
  }

  private getCropForTree(tree: PlantedTreeSprite) {
    const iconId = this.resolveIconId(tree)

    let rowIndex = LEFT_IDS.indexOf(iconId)
    if (rowIndex >= 0) {
      return {
        x: LEFT_ICON_X,
        y: rowIndex * ROW_HEIGHT,
        w: ICON_SIZE,
        h: ICON_SIZE,
      }
    }

    rowIndex = RIGHT_IDS.indexOf(iconId)
    if (rowIndex >= 0) {
      return {
        x: RIGHT_ICON_X,
        y: rowIndex * ROW_HEIGHT,
        w: ICON_SIZE,
        h: ICON_SIZE,
      }
    }

    return {
      x: RIGHT_ICON_X,
      y: 9 * ROW_HEIGHT,
      w: ICON_SIZE,
      h: ICON_SIZE,
    }
  }

  private resolveIconId(tree: PlantedTreeSprite): number {
    const species = tree.species.toLowerCase()
    const base = speciesToId[species] ?? 41

    if (tree.growthStage >= 4) {
      return base
    }
    if (tree.growthStage >= 3) {
      return base
    }
    if (tree.growthStage >= 2) {
      return base
    }
    return base
  }

  private showTreeInfo(x: number, y: number, tree: PlantedTreeSprite) {
    const txt = this.add
      .text(x, y - 64, `${tree.label ?? tree.species}\nStage ${tree.growthStage}/4`, {
        fontSize: '12px',
        color: '#f3e2c8',
        fontFamily: 'Lora',
        backgroundColor: '#1a2e1a',
        padding: { x: 6, y: 4 },
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 1)
      .setDepth(999)

    this.time.delayedCall(1700, () => txt.destroy())
  }

}
