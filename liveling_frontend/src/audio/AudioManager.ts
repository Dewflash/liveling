import { Howl, Howler } from 'howler'

type Zone =
  | 'home'
  | 'home_night'
  | 'missions'
  | 'forest'
  | 'forest_rain'
  | 'rpg_explore'
  | 'rpg_combat'
  | 'rpg_boss'
  | 'shop'

type SfxName =
  | 'xp_gain'
  | 'level_up'
  | 'mission_complete'
  | 'synergy_activate'
  | 'purchase'
  | 'button_click'
  | 'combat_hit'
  | 'combat_crit'
  | 'combat_miss'
  | 'loot_drop'
  | 'equip'
  | 'chop_tree'
  | 'harvest'
  | 'forest_session_start'
  | 'forest_session_complete'
  | 'error'
  | 'unlock'

const ZONE_TRACKS: Record<Zone, string[]> = {
  home: [],
  home_night: [],
  missions: ['/audio/missions_loop.ogg', '/audio/missions_loop.mp3'],
  forest: ['/audio/forest_loop.ogg', '/audio/forest_loop.mp3'],
  forest_rain: ['/audio/forest_rain.ogg', '/audio/forest_rain.mp3'],
  rpg_explore: ['/audio/rpg_explore.ogg', '/audio/rpg_explore.mp3'],
  rpg_combat: ['/audio/rpg_combat.ogg', '/audio/rpg_combat.mp3'],
  rpg_boss: ['/audio/rpg_boss.ogg', '/audio/rpg_boss.mp3'],
  shop: ['/audio/home_ambient.mp3', '/audio/home_night.mp3', '/audio/shop_loop.ogg', '/audio/shop_loop.mp3'],
}

class AudioManagerClass {
  private currentZone: Zone | null = null
  private currentHowl: Howl | null = null
  private sfxCache = new Map<SfxName, Howl>()
  private disabledZones = new Set<Zone>()
  private disabledSfx = new Set<SfxName>()
  private unlocked = false
  private masterVolume = 0.6
  private sfxVolume = 0.8
  private musicVolume = 0.5
  private pendingZone: Zone | null = null

  constructor() {
    try {
      const saved = localStorage.getItem('liveling_audio_volume')
      if (saved) {
        const parsed = JSON.parse(saved) as { master?: number; sfx?: number; music?: number }
        this.masterVolume = parsed.master ?? 0.6
        this.sfxVolume = parsed.sfx ?? 0.8
        this.musicVolume = parsed.music ?? 0.5
      }

      if (localStorage.getItem('liveling_audio_unlocked') === '1') {
        this.unlocked = true
        void Howler.ctx?.resume()
      }
    } catch {
      // Ignore storage access issues and keep defaults.
    }

    Howler.volume(this.masterVolume)
    this.preloadSfx()
  }

  unlock() {
    this.unlocked = true
    localStorage.setItem('liveling_audio_unlocked', '1')

    // Resuming the audio context is enough for user-gesture unlock and avoids
    // creating a synthetic file-based sound that can 404 in local setups.
    void Howler.ctx?.resume()

    if (this.pendingZone) {
      this.playZone(this.pendingZone)
      this.pendingZone = null
    }
  }

  isUnlocked() {
    return this.unlocked
  }

  playZone(zone: Zone, fadeMs = 2000) {
    if (!this.unlocked) {
      this.pendingZone = zone
      return
    }
    if (this.currentZone === zone) {
      return
    }
    if (this.disabledZones.has(zone)) {
      return
    }

    const prev = this.currentHowl
    if (prev) {
      prev.fade(this.musicVolume, 0, fadeMs)
      window.setTimeout(() => {
        prev.stop()
        prev.unload()
      }, fadeMs + 100)
    }

    const howl = new Howl({
      src: ZONE_TRACKS[zone],
      loop: true,
      volume: 0,
      // Stream long ambient tracks to avoid decode failures on large files.
      html5: true,
      onloaderror: () => {
        this.disabledZones.add(zone)
      },
      onplayerror: () => {
        this.pendingZone = zone
      },
    })

    const soundId = howl.play()
    if (typeof soundId === 'number') {
      howl.fade(0, this.musicVolume, fadeMs, soundId)
    } else {
      howl.once('play', (id) => {
        if (typeof id === 'number') {
          howl.fade(0, this.musicVolume, fadeMs, id)
        }
      })
    }

    this.currentHowl = howl
    this.currentZone = zone
  }

  setRpgIntensity(intensity: 'explore' | 'combat' | 'boss') {
    const zoneMap = {
      explore: 'rpg_explore',
      combat: 'rpg_combat',
      boss: 'rpg_boss',
    } as const
    this.playZone(zoneMap[intensity], 800)
  }

  playSfx(name: SfxName) {
    if (!this.unlocked) {
      return
    }
    if (this.disabledSfx.has(name)) {
      return
    }
    const howl = this.sfxCache.get(name)
    if (!howl) {
      return
    }
    howl.volume(this.sfxVolume)
    const soundId = howl.play()
    if (soundId === null) {
      this.disabledSfx.add(name)
    }
  }

  introSwell(zone: Zone = 'home') {
    if (!this.unlocked) {
      this.pendingZone = zone
      return
    }
    if (this.disabledZones.has(zone)) {
      return
    }

    const howl = new Howl({
      src: ZONE_TRACKS[zone],
      loop: true,
      volume: 0,
      html5: true,
      onloaderror: () => {
        this.disabledZones.add(zone)
      },
      onplayerror: () => {
        this.pendingZone = zone
      },
    })
    const soundId = howl.play()
    if (typeof soundId === 'number') {
      howl.fade(0, this.musicVolume, 3000, soundId)
    }
    this.currentHowl = howl
    this.currentZone = zone
  }

  setMasterVolume(v: number) {
    this.masterVolume = v
    Howler.volume(v)
    this.savePrefs()
  }

  setMusicVolume(v: number) {
    this.musicVolume = v
    if (this.currentHowl) {
      this.currentHowl.volume(v)
    }
    this.savePrefs()
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v
    this.savePrefs()
  }

  getVolumes() {
    return {
      master: this.masterVolume,
      music: this.musicVolume,
      sfx: this.sfxVolume,
    }
  }

  private savePrefs() {
    try {
      localStorage.setItem(
        'liveling_audio_volume',
        JSON.stringify({
          master: this.masterVolume,
          music: this.musicVolume,
          sfx: this.sfxVolume,
        }),
      )
    } catch {
      // Ignore storage access issues and continue using in-memory prefs.
    }
  }

  private preloadSfx() {
    const sfxFiles: SfxName[] = [
      'xp_gain',
      'level_up',
      'mission_complete',
      'synergy_activate',
      'purchase',
      'button_click',
      'combat_hit',
      'combat_crit',
      'combat_miss',
      'loot_drop',
      'equip',
      'chop_tree',
      'harvest',
      'forest_session_start',
      'forest_session_complete',
      'error',
      'unlock',
    ]

    for (const name of sfxFiles) {
      const howl = new Howl({
        src: [`/audio/sfx/${name}.ogg`, `/audio/sfx/${name}.mp3`],
        preload: true,
        volume: this.sfxVolume,
        onloaderror: () => {
          this.disabledSfx.add(name)
        },
        onplayerror: () => {
          this.disabledSfx.add(name)
        },
      })
      this.sfxCache.set(name, howl)
    }
  }
}

export const AudioManager = new AudioManagerClass()
export type { Zone, SfxName }
