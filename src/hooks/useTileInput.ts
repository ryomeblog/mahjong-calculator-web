/**
 * 牌入力用のカスタムフック
 */

import { useState } from 'react'
import type { Tile, Wind } from '@/core/mahjong'

export function useTileInput() {
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([])
  const [winningTile, setWinningTile] = useState<Tile | null>(null)
  const [isTsumo, setIsTsumo] = useState(true)
  const [isRiichi, setIsRiichi] = useState(false)
  const [isDoubleRiichi, setIsDoubleRiichi] = useState(false)
  const [roundWind, setRoundWind] = useState<Wind>('east')
  const [seatWind, setSeatWind] = useState<Wind>('east')

  const addTile = (tile: Tile) => {
    if (selectedTiles.length < 14) {
      setSelectedTiles([...selectedTiles, tile])

      // 14枚揃ったら最後の牌を和了牌とする
      if (selectedTiles.length === 13) {
        setWinningTile(tile)
      }
    }
  }

  const removeTile = (index: number) => {
    const newTiles = selectedTiles.filter((_, i) => i !== index)
    setSelectedTiles(newTiles)

    // 14枚未満になったら和了牌をクリア
    if (newTiles.length < 14) {
      setWinningTile(null)
    }
  }

  const clearAll = () => {
    setSelectedTiles([])
    setWinningTile(null)
  }

  const toggleTsumo = () => {
    setIsTsumo(!isTsumo)
  }

  const toggleRiichi = () => {
    setIsRiichi(!isRiichi)
    if (!isRiichi) {
      setIsDoubleRiichi(false)
    }
  }

  const toggleDoubleRiichi = () => {
    setIsDoubleRiichi(!isDoubleRiichi)
    if (!isDoubleRiichi) {
      setIsRiichi(true)
    }
  }

  return {
    selectedTiles,
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
  }
}
