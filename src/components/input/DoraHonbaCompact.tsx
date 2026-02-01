/**
 * ドラ・本場情報コンポーネント（コンパクト版）
 */

// 1. React関連
import { useCallback } from 'react'
import { IoTrash } from 'react-icons/io5'

// 2. 型定義
import type { Tile } from '@/core/mahjong'

// 3. 内部コンポーネント
import { TileSvg } from '@/components/tiles/TileSvg'

interface DoraHonbaCompactProps {
  readonly doraTiles: readonly Tile[]
  readonly honba: number
  readonly onRemoveDoraTile: (index: number) => void
  readonly onOpenDoraModal: () => void
  readonly onIncrementHonba: () => void
  readonly onDecrementHonba: () => void
}

export function DoraHonbaCompact({
  doraTiles,
  honba,
  onRemoveDoraTile,
  onOpenDoraModal,
  onIncrementHonba,
  onDecrementHonba,
}: DoraHonbaCompactProps) {
  // ドラ牌クリアハンドラー
  const handleClearDora = useCallback(() => {
    for (let i = doraTiles.length - 1; i >= 0; i--) {
      onRemoveDoraTile(i)
    }
  }, [doraTiles.length, onRemoveDoraTile])

  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-400">ドラ・本場</h3>

      <div className="flex items-start gap-4">
        {/* ドラ表示牌 */}
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-[11px] text-slate-500">
              ドラ表示牌
            </label>
            {doraTiles.length > 0 && (
              <button
                type="button"
                onClick={handleClearDora}
                className="flex items-center justify-center rounded-lg bg-slate-700 p-1.5 text-slate-300 transition-colors hover:bg-slate-600"
                title="ドラをクリア"
              >
                <IoTrash size={14} />
              </button>
            )}
          </div>
          <div
            className="flex min-h-[100px] cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-600 bg-slate-900 p-3 hover:border-slate-500"
            onClick={onOpenDoraModal}
          >
            {doraTiles.length === 0 ? (
              <span className="w-full text-center text-[11px] text-slate-500">
                ＋ タップして追加
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {Array.from(
                  { length: Math.ceil(doraTiles.length / 4) },
                  (_, groupIndex) => {
                    const start = groupIndex * 4
                    const end = Math.min(start + 4, doraTiles.length)
                    const groupTiles = doraTiles.slice(start, end)
                    return (
                      <div
                        key={groupIndex}
                        className="flex items-center gap-0.5"
                      >
                        {groupTiles.map((tile, tileIndex) => (
                          <TileSvg
                            key={start + tileIndex}
                            tile={tile}
                            size="small"
                          />
                        ))}
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* 本場カウンター */}
        <div>
          <label className="mb-2 block text-[11px] text-slate-500">本場</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onDecrementHonba}
              disabled={honba === 0}
              className="flex h-10 w-9 items-center justify-center rounded-md bg-slate-700 text-base text-slate-300 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>
            <div className="flex h-10 w-12 items-center justify-center rounded-md border-2 border-blue-600 bg-slate-900">
              <span className="text-lg font-semibold text-slate-50">
                {honba}
              </span>
            </div>
            <button
              type="button"
              onClick={onIncrementHonba}
              className="flex h-10 w-9 items-center justify-center rounded-md bg-slate-700 text-base text-slate-200 hover:bg-slate-600"
            >
              ＋
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
