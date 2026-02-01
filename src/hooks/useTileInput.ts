/**
 * 牌入力用のカスタムフック（面子ごとに入力できるよう拡張）
 */

import { useState } from 'react'
import type { Tile, Wind, MeldType } from '@/core/mahjong'
import type { MeldSlot } from '@/components/tiles/HandStructureInput'

export type KongType = 'ankan' | 'kakan' | 'minkan'

export interface MeldInput {
  id: string
  type: MeldType | 'pair'
  tiles: Tile[]
  kongType?: KongType | null
  isConcealed?: boolean
}

export function useTileInput() {
  // 面子ごとの入力を保持する。初期は空の面子（7スロット: 4面子+雀頭+補助）を用意
  const [meldInputs, setMeldInputs] = useState<MeldInput[]>([])

  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([])
  const [handSlots, setHandSlots] = useState<MeldSlot[] | null>(null) // スロット情報（鳴き含む）
  const [winningTile, setWinningTile] = useState<Tile | null>(null)
  const [isTsumo, setIsTsumo] = useState(true)
  const [isRiichi, setIsRiichi] = useState(false)
  const [isDoubleRiichi, setIsDoubleRiichi] = useState(false)
  const [roundWind, setRoundWind] = useState<Wind>('east')
  const [seatWind, setSeatWind] = useState<Wind>('east')

  // ドラ・本場
  const [doraTiles, setDoraTiles] = useState<Tile[]>([])
  const [uraDoraTiles, setUraDoraTiles] = useState<Tile[]>([])
  const [honba, setHonba] = useState(0)

  // 特殊和了
  const [isIppatsu, setIsIppatsu] = useState(false)
  const [isChankan, setIsChankan] = useState(false)
  const [isRinshan, setIsRinshan] = useState(false)
  const [isHaitei, setIsHaitei] = useState(false)
  const [isHoutei, setIsHoutei] = useState(false)
  const [isTenhou, setIsTenhou] = useState(false)
  const [isChiihou, setIsChiihou] = useState(false)

  // 鳴きモード
  const [isMeldMode, setIsMeldMode] = useState(false)

  // 面子を追加する
  const addMeld = (meld: MeldInput) => {
    setMeldInputs((prev) => [...prev, meld])
  }

  const updateMeld = (id: string, patch: Partial<MeldInput>) => {
    setMeldInputs((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    )
  }

  const removeMeld = (id: string) => {
    setMeldInputs((prev) => prev.filter((m) => m.id !== id))
  }

  const addTile = (tile: Tile, meldId?: string) => {
    if (meldId) {
      // 指定した面子に追加
      updateMeld(meldId, {
        tiles: [
          ...(meldInputs.find((m) => m.id === meldId)?.tiles || []),
          tile,
        ],
      })
      return
    }

    // グローバルな手牌入力（従来の動作を保持）
    if (selectedTiles.length < 14) {
      setSelectedTiles([...selectedTiles, tile])

      // 14枚揃ったら最後の牌を和了牌とする
      if (selectedTiles.length === 13) {
        setWinningTile(tile)
      }
    }
  }

  const removeTile = (
    indexOrId: number | { meldId: string; index: number }
  ) => {
    if (typeof indexOrId !== 'number') {
      const { meldId, index } = indexOrId
      const meld = meldInputs.find((m) => m.id === meldId)
      if (!meld) return
      const newTiles = meld.tiles.filter((_, i) => i !== index)
      updateMeld(meldId, { tiles: newTiles })
      return
    }

    const newTiles = selectedTiles.filter((_, i) => i !== indexOrId)
    setSelectedTiles(newTiles)

    // 14枚未満になったら和了牌をクリア
    if (newTiles.length < 14) {
      setWinningTile(null)
    }
  }

  const clearAll = () => {
    setSelectedTiles([])
    setWinningTile(null)
    setMeldInputs([])
    setDoraTiles([])
    setUraDoraTiles([])
    setHonba(0)
    setIsIppatsu(false)
    setIsChankan(false)
    setIsRinshan(false)
    setIsHaitei(false)
    setIsHoutei(false)
    setIsTenhou(false)
    setIsChiihou(false)
    setIsMeldMode(false)
  }

  const toggleTsumo = () => {
    setIsTsumo(!isTsumo)
  }

  const toggleRiichi = () => {
    const newValue = !isRiichi
    setIsRiichi(newValue)
    if (newValue) {
      setIsDoubleRiichi(false)
    } else {
      // リーチ解除時: 裏ドラと一発もクリア
      setUraDoraTiles([])
      setIsIppatsu(false)
      setIsDoubleRiichi(false)
    }
  }

  const toggleDoubleRiichi = () => {
    setIsDoubleRiichi(!isDoubleRiichi)
    if (!isDoubleRiichi) {
      setIsRiichi(true)
    }
  }

  // ドラ管理
  const addDoraTile = (tile: Tile) => {
    if (doraTiles.length < 8) {
      setDoraTiles((prev) => [...prev, tile])
    }
  }
  const removeDoraTile = (index: number) => {
    setDoraTiles((prev) => prev.filter((_, i) => i !== index))
  }
  const addUraDoraTile = (tile: Tile) => {
    if (uraDoraTiles.length < 4) {
      setUraDoraTiles((prev) => [...prev, tile])
    }
  }
  const removeUraDoraTile = (index: number) => {
    setUraDoraTiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 本場
  const incrementHonba = () => setHonba((prev) => prev + 1)
  const decrementHonba = () => setHonba((prev) => Math.max(0, prev - 1))

  // 特殊和了トグル
  const toggleIppatsu = () => setIsIppatsu((prev) => !prev)
  const toggleChankan = () => setIsChankan((prev) => !prev)
  const toggleRinshan = () => setIsRinshan((prev) => !prev)
  const toggleHaitei = () => setIsHaitei((prev) => !prev)
  const toggleHoutei = () => setIsHoutei((prev) => !prev)
  const toggleTenhou = () => setIsTenhou((prev) => !prev)
  const toggleChiihou = () => setIsChiihou((prev) => !prev)

  // 鳴きモード
  const toggleMeldMode = () => setIsMeldMode((prev) => !prev)

  // バッチ設定（モーダルの決定ボタン用）
  const setHandTiles = (tiles: Tile[], slots?: MeldSlot[]) => {
    setSelectedTiles(tiles)
    setHandSlots(slots || null)
    if (tiles.length === 14) {
      setWinningTile(tiles[tiles.length - 1])
    } else {
      setWinningTile(null)
    }
  }

  const setDora = (tiles: Tile[]) => {
    setDoraTiles(tiles.slice(0, 8))
  }

  const setUraDora = (tiles: Tile[]) => {
    setUraDoraTiles(tiles.slice(0, 4))
  }

  // サンプル読込
  const loadSample = () => {
    clearAll()
    const sampleTiles: Tile[] = [
      { type: 'man', number: 1 },
      { type: 'man', number: 2 },
      { type: 'man', number: 3 },
      { type: 'pin', number: 4 },
      { type: 'pin', number: 5 },
      { type: 'pin', number: 6 },
      { type: 'sou', number: 7 },
      { type: 'sou', number: 8 },
      { type: 'sou', number: 9 },
      { type: 'sou', number: 1 },
      { type: 'sou', number: 2 },
      { type: 'sou', number: 3 },
      { type: 'wind', wind: 'east' },
      { type: 'wind', wind: 'east' },
    ]
    setSelectedTiles(sampleTiles)
    setWinningTile(sampleTiles[sampleTiles.length - 1])
  }

  return {
    meldInputs,
    addMeld,
    updateMeld,
    removeMeld,
    selectedTiles,
    handSlots,
    winningTile,
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    roundWind,
    seatWind,
    addTile,
    removeTile,
    clearAll,
    toggleTsumo,
    toggleRiichi,
    toggleDoubleRiichi,
    setRoundWind,
    setSeatWind,
    // ドラ・本場
    doraTiles,
    uraDoraTiles,
    honba,
    addDoraTile,
    removeDoraTile,
    addUraDoraTile,
    removeUraDoraTile,
    incrementHonba,
    decrementHonba,
    // 特殊和了
    isIppatsu,
    isChankan,
    isRinshan,
    isHaitei,
    isHoutei,
    isTenhou,
    isChiihou,
    toggleIppatsu,
    toggleChankan,
    toggleRinshan,
    toggleHaitei,
    toggleHoutei,
    toggleTenhou,
    toggleChiihou,
    // 鳴きモード
    isMeldMode,
    toggleMeldMode,
    // バッチ設定
    setHandTiles,
    setDora,
    setUraDora,
    // サンプル
    loadSample,
  }
}
