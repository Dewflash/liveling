import Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, 320, 12, 0x2d6b45)
    const fill = this.add.rectangle(width / 2 - 160, height / 2, 0, 12, 0xc9a84c)
    fill.setOrigin(0, 0.5)

    this.load.on('progress', (value: number) => {
      fill.width = 320 * value
    })

    // Prefer custom SVG tree art and keep the existing sheet as fallback.
    this.load.image('tree_svg_custom', '/trees/custom-tree.svg')
    this.load.image('forest_tree_sheet', '/assets/nature/trees/forest-trees-sheet.png')
  }

  create() {
    const hasWorld = this.scene.manager.keys.WorldScene
    const hasHud = this.scene.manager.keys.HUDScene
    const hasForest = this.scene.manager.keys.ForestGroveScene

    if (hasWorld) {
      if (!this.scene.isActive('WorldScene')) {
        this.scene.start('WorldScene')
      }
      if (hasHud && !this.scene.isActive('HUDScene')) {
        this.scene.launch('HUDScene')
      }
      return
    }

    if (hasForest && !this.scene.isActive('ForestGroveScene')) {
      this.scene.start('ForestGroveScene')
    }
  }
}
