import Phaser from 'phaser'
import { PreloadScene } from './scenes/PreloadScene'
import { WorldScene } from './scenes/WorldScene'
import { HUDScene } from './scenes/HUDScene'
import { InventoryScene } from './scenes/InventoryScene'
import { CombatScene } from './scenes/CombatScene'
import { ForestGroveScene } from './scenes/ForestGroveScene'

export const RPGGameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#1a2e1a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [PreloadScene, WorldScene, HUDScene, InventoryScene, CombatScene],
  pixelArt: true,
  antialias: false,
  roundPixels: true,
}

export const ForestGameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#2d6b45',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [PreloadScene, ForestGroveScene],
  pixelArt: true,
  antialias: false,
  roundPixels: true,
}
