import { forwardRef, useEffect, useLayoutEffect, useRef, useId } from 'react'
import type { CSSProperties } from 'react'
import Phaser from 'phaser'
import { EventBus } from './EventBus'

export interface IRefPhaserGame {
  game: Phaser.Game | null
  scene: Phaser.Scene | null
}

interface PhaserGameProps {
  currentActiveScene?: (scene: Phaser.Scene) => void
  config: Phaser.Types.Core.GameConfig
  style?: CSSProperties
}

export const PhaserGame = forwardRef<IRefPhaserGame, PhaserGameProps>(function PhaserGame(
  { currentActiveScene, config, style },
  ref,
) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sceneReadyHandlerRef = useRef<((scene: Phaser.Scene) => void) | null>(null)
  const id = useId().replace(/:/g, '_')

  useLayoutEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return
    }

    const game = new Phaser.Game({
      ...config,
      parent: containerRef.current,
    })
    gameRef.current = game

    if (typeof ref === 'function') {
      ref({ game, scene: null })
    } else if (ref) {
      ref.current = { game, scene: null }
    }

    return () => {
      if (sceneReadyHandlerRef.current) {
        EventBus.off('current-scene-ready', sceneReadyHandlerRef.current)
      }
      game.destroy(true)
      gameRef.current = null
      if (typeof ref === 'function') {
        ref({ game: null, scene: null })
      } else if (ref) {
        ref.current = { game: null, scene: null }
      }
    }
  }, [config, ref])

  useEffect(() => {
    const onSceneReady = (scene: Phaser.Scene) => {
      currentActiveScene?.(scene)
      if (typeof ref === 'function') {
        ref({ game: gameRef.current, scene })
      } else if (ref) {
        ref.current = { game: gameRef.current, scene }
      }
    }

    sceneReadyHandlerRef.current = onSceneReady
    EventBus.on('current-scene-ready', onSceneReady)

    return () => {
      EventBus.off('current-scene-ready', onSceneReady)
    }
  }, [currentActiveScene, ref])

  return <div id={`phaser-container-${id}`} ref={containerRef} style={{ width: '100%', height: '100%', ...style }} />
})
