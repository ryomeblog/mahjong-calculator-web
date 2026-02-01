/**
 * ドラ・本場情報コンポーネント（コンパクト版）
 */

// 1. React関連
import { useCallback } from 'react'

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
  // ドラ牌削除ハンドラー
  const handleRemoveDora = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation()
      onRemoveDoraTile(index)
    },
    [onRemoveDoraTile]
  )

  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-400">ドラ・本場</h3>

      <div className="flex items-start gap-4">
        {/* ドラ表示牌 */}
        <div className="flex-1">
          <label className="mb-2 block text-[11px] text-slate-500">
            ドラ表示牌
          </label>
          <div
            className="flex min-h-[40px] cursor-pointer items-center gap-0.5 rounded-md border border-dashed border-slate-600 bg-slate-900 p-2 hover:border-slate-500"
            onClick={onOpenDoraModal}
          >
            {doraTiles.length === 0 ? (
              <span className="w-full text-center text-[11px] text-slate-500">
                ＋ タップして追加
              </span>
            ) : (
              doraTiles.map((tile, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => handleRemoveDora(index, e)}
                  className="hover:opacity-60"
                >
                  <TileSvg tile={tile} size="small" />
                </button>
              ))
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
