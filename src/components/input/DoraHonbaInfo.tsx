/**
 * ドラ・本場情報入力コンポーネント
 */

import type { Tile } from '@/core/mahjong'
import { TileSvg } from '@/components/tiles/TileSvg'

interface DoraHonbaInfoProps {
  readonly doraTiles: readonly Tile[]
  readonly uraDoraTiles: readonly Tile[]
  readonly honba: number
  readonly isRiichi: boolean
  readonly onRemoveDoraTile: (index: number) => void
  readonly onRemoveUraDoraTile: (index: number) => void
  readonly onOpenDoraModal: () => void
  readonly onOpenUraDoraModal: () => void
  readonly onIncrementHonba: () => void
  readonly onDecrementHonba: () => void
}

export function DoraHonbaInfo({
  doraTiles,
  uraDoraTiles,
  honba,
  isRiichi,
  onRemoveDoraTile,
  onRemoveUraDoraTile,
  onOpenDoraModal,
  onOpenUraDoraModal,
  onIncrementHonba,
  onDecrementHonba,
}: DoraHonbaInfoProps) {
  return (
    <div className="rounded-2xl border-2 border-amber-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-gray-800">ドラ・本場</h3>

      {/* ドラ表示牌エリア */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* ドラ */}
        <div className="flex-1">
          <label className="mb-2 block text-sm text-gray-600">
            ドラ表示牌（最大4枚）
          </label>
          <div
            className="flex min-h-[70px] cursor-pointer items-center gap-1 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200 hover:bg-amber-100"
            onClick={onOpenDoraModal}
          >
            {doraTiles.length === 0 ? (
              <span className="w-full text-center text-sm text-amber-600">
                ＋ タップして追加
              </span>
            ) : (
              doraTiles.map((tile, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveDoraTile(index)
                  }}
                  className="cursor-pointer hover:opacity-60"
                >
                  <TileSvg tile={tile} size="small" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* 裏ドラ */}
        <div className={`flex-1 ${!isRiichi ? 'opacity-40' : ''}`}>
          <label className="mb-2 block text-sm text-gray-600">
            裏ドラ表示牌（リーチ時、最大4枚）
          </label>
          <div
            className={`flex min-h-[70px] items-center gap-1 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200 ${
              isRiichi
                ? 'cursor-pointer hover:bg-emerald-100'
                : 'cursor-not-allowed'
            }`}
            onClick={() => {
              if (isRiichi) onOpenUraDoraModal()
            }}
          >
            {uraDoraTiles.length === 0 ? (
              <span className="w-full text-center text-sm text-emerald-600">
                {isRiichi ? '＋ タップして追加' : 'リーチ時のみ有効'}
              </span>
            ) : (
              uraDoraTiles.map((tile, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveUraDoraTile(index)
                  }}
                  className="cursor-pointer hover:opacity-60"
                >
                  <TileSvg tile={tile} size="small" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 本場 */}
      <div className="mt-5">
        <label className="mb-2 block text-sm text-gray-600">本場</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrementHonba}
            disabled={honba === 0}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <div className="flex min-w-[60px] items-center justify-center rounded-xl bg-gray-100 px-4 py-2">
            <span className="text-xl font-semibold text-gray-900">{honba}</span>
          </div>
          <button
            type="button"
            onClick={onIncrementHonba}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-900 bg-white text-lg font-semibold text-gray-900 transition-colors hover:bg-gray-50"
          >
            ＋
          </button>
          <span className="ml-1 text-sm text-gray-500">本場</span>
        </div>
      </div>
    </div>
  )
}
