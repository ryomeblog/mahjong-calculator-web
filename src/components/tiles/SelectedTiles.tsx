/**
 * 選択済み手牌表示コンポーネント
 */

// 1. React関連
import { useMemo } from 'react'
import { IoTrash } from 'react-icons/io5'

// 2. 型定義
import type { Tile as TileType, MeldGroup, Meld } from '@/core/mahjong'
import type { MeldSlot } from './HandStructureInput'

// 3. 内部コンポーネント
import { Tile } from './Tile'

// 4. ユーティリティ
import { decomposeStandard, detectSpecialForms } from '@/core/mahjong'

interface SelectedTilesProps {
  tiles: readonly TileType[]
  handSlots?: MeldSlot[] | null
  winningTile: TileType | null
  onRemoveTile?: (index: number) => void
  onClearHandTiles?: () => void
  onOpenTileModal?: () => void
}

export function SelectedTiles({
  tiles,
  handSlots,
  winningTile,
  onRemoveTile,
  onClearHandTiles,
  onOpenTileModal,
}: SelectedTilesProps) {
  const tileCount = tiles.length

  // スロット情報がある場合はそれを使って表示
  const renderFromSlots = useMemo(() => {
    if (!handSlots || tileCount !== 14) return null

    // 鳴き牌があるかチェック
    const hasSidewaysTiles = handSlots.some(
      (slot) => slot.sidewaysTiles && slot.sidewaysTiles.size > 0
    )

    return (
      <div className="flex flex-wrap items-center gap-3">
        {handSlots.map((slot, slotIndex) => {
          const hasTiles = slot.tiles.some((t) => t !== null)
          if (!hasTiles) return null

          const hasSlotSidewaysTiles =
            slot.sidewaysTiles && slot.sidewaysTiles.size > 0

          return (
            <div
              key={slotIndex}
              className={`flex items-center ${hasSidewaysTiles || hasSlotSidewaysTiles ? 'gap-1' : 'gap-0.5'}`}
            >
              {slot.tiles.map((tile, tileIndex) => {
                if (!tile) return null
                const isSideways = slot.sidewaysTiles?.has(tileIndex) || false
                return (
                  <div
                    key={tileIndex}
                    className={isSideways ? 'rotate-90 transform' : ''}
                  >
                    <Tile tile={tile} size="small" />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }, [handSlots, tileCount])

  // 14枚の時は面子分解して面子ごとに表示する（useMemoで最適化）
  const renderByMelds = useMemo(() => {
    if (tileCount !== 14 || !winningTile) return null

    // まず特殊形（七対子など）を検出
    const specials = detectSpecialForms(tiles, winningTile)
    const chiitoitsu = specials.find((s) => s.type === 'chiitoitsu')
    if (chiitoitsu) {
      // 七対子: 7組の対子を横並びで表示
      const pairs: TileType[][] = []
      const countsMap: Record<string, number> = {}
      for (const t of tiles) {
        const key = JSON.stringify(t)
        countsMap[key] = (countsMap[key] || 0) + 1
      }
      // 各ユニークタイルごとに2枚ずつ表示（7組）
      Object.keys(countsMap).forEach((k) => {
        const tileObj = JSON.parse(k) as TileType
        const cnt = countsMap[k]
        const pairCount = Math.floor(cnt / 2)
        for (let i = 0; i < pairCount; i++) {
          pairs.push([tileObj, tileObj])
        }
      })

      return (
        <div className="flex flex-wrap items-start gap-2">
          {pairs.map((pair, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <Tile tile={pair[0]} size="small" />
              <Tile tile={pair[1]} size="small" />
            </div>
          ))}
        </div>
      )
    }

    // 国士無双を検出
    const kokushi = specials.find((s) => s.type === 'kokushi')
    if (kokushi) {
      // 国士無双: 1枚ずつ横に表示
      return (
        <div className="flex flex-wrap items-center gap-0.5">
          {tiles.map((tile, i) => (
            <Tile key={i} tile={tile} size="small" />
          ))}
        </div>
      )
    }

    // 標準形で分解
    const meldGroups = decomposeStandard(tiles, winningTile)
    if (meldGroups.length === 0) return null

    const meldGroup: MeldGroup = meldGroups[0]

    return (
      <div className="flex flex-wrap items-center gap-2">
        {/* 雀頭を最初に表示 */}
        <div className="flex items-center gap-0.5">
          <span className="text-xs font-semibold text-slate-400">雀頭:</span>
          {meldGroup.pair.tiles.map((t, i) => (
            <Tile key={i} tile={t} size="small" />
          ))}
        </div>

        {/* 面子を表示 */}
        {meldGroup.melds.map((meld: Meld, mi) => (
          <div key={mi} className="flex items-center gap-0.5">
            {meld.tiles.map((t, ti) => (
              <Tile key={ti} tile={t} size="small" />
            ))}
          </div>
        ))}
      </div>
    )
  }, [tiles, winningTile, tileCount])
  // 手牌を3つ区切りで表示（14枚未満の場合）
  const renderTilesInGroups = useMemo(() => {
    if (tileCount === 0) return null

    return (
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: Math.ceil(tileCount / 3) }, (_, groupIndex) => {
          const start = groupIndex * 3
          const end = Math.min(start + 3, tileCount)
          const groupTiles = tiles.slice(start, end)
          return (
            <div key={groupIndex} className="flex items-center gap-0.5">
              {groupTiles.map((tile, tileIndex) => {
                const actualIndex = start + tileIndex
                return (
                  <Tile
                    key={actualIndex}
                    tile={tile}
                    size="small"
                    onClick={
                      onRemoveTile ? () => onRemoveTile(actualIndex) : undefined
                    }
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }, [tiles, tileCount, onRemoveTile])

  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400">手牌</h3>
        {tileCount > 0 && onClearHandTiles && (
          <button
            type="button"
            onClick={onClearHandTiles}
            className="flex items-center justify-center rounded-lg bg-slate-700 p-2 text-slate-300 transition-colors hover:bg-slate-600"
            title="手牌をクリア"
          >
            <IoTrash size={16} />
          </button>
        )}
      </div>

      {/* 手牌表示エリア */}
      <div
        onClick={onOpenTileModal}
        className={`flex min-h-[100px] items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-3 transition-colors ${
          onOpenTileModal
            ? 'cursor-pointer hover:border-slate-600 hover:bg-slate-800'
            : ''
        }`}
      >
        {tileCount === 0 ? (
          <div className="w-full py-8 text-center text-xs text-slate-500">
            タップして手牌を追加
          </div>
        ) : tileCount === 14 && winningTile ? (
          renderFromSlots || renderByMelds
        ) : (
          renderTilesInGroups
        )}
      </div>

      {winningTile && tileCount !== 14 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-400">和了牌</h4>
          <Tile tile={winningTile} isWinning size="small" />
        </div>
      )}
    </div>
  )
}
