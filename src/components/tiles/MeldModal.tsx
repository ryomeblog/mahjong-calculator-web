/**
 * 鳴き（ポン・チー・カン）選択モーダルコンポーネント
 */

import { useState, useEffect, useCallback } from 'react'
import type { Tile } from '@/core/mahjong'
import { TileSvg } from './TileSvg'
import { TileGrid } from './TileGrid'

type MeldType = 'pon' | 'chi' | 'kan'

interface MeldModalProps {
  readonly isOpen: boolean
  readonly meldType: MeldType
  readonly globalTiles: readonly Tile[]
  readonly onConfirm: (tiles: Tile[]) => void
  readonly onClose: () => void
}

const MELD_CONFIG = {
  pon: { title: 'ポンを選択', maxTiles: 3, description: '同じ牌を3枚選択' },
  chi: { title: 'チーを選択', maxTiles: 3, description: '連続する3枚を選択' },
  kan: { title: 'カンを選択', maxTiles: 4, description: '同じ牌を4枚選択' },
}

export function MeldModal({
  isOpen,
  meldType,
  globalTiles,
  onConfirm,
  onClose,
}: MeldModalProps) {
  const config = MELD_CONFIG[meldType]
  const [stagingTiles, setStagingTiles] = useState<Tile[]>([])

  // モーダルが閉じたら状態をリセット
  useEffect(() => {
    if (!isOpen) {
      // タイムアウトを使って次のレンダーサイクルで実行
      const timer = setTimeout(() => setStagingTiles([]), 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTileSelect = useCallback(
    (tile: Tile) => {
      setStagingTiles((prev) => {
        if (prev.length >= config.maxTiles) return prev
        return [...prev, tile]
      })
    },
    [config.maxTiles]
  )

  const handleRemoveStaging = useCallback((index: number) => {
    setStagingTiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleConfirm = () => {
    if (stagingTiles.length === config.maxTiles) {
      onConfirm(stagingTiles)
      onClose()
    }
  }

  const canConfirm = stagingTiles.length === config.maxTiles

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="relative mx-2 max-h-[90vh] w-full max-w-[95vw] overflow-y-auto rounded-t-2xl bg-slate-800 sm:mx-0 sm:max-w-lg sm:rounded-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-700 p-4">
          <div>
            <h3 className="text-base font-bold text-slate-50 sm:text-lg">
              {config.title}
            </h3>
            <p className="mt-1 text-xs text-slate-400">{config.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-200"
          >
            &times;
          </button>
        </div>

        {/* 選択中の牌プレビュー */}
        <div className="border-b border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-sm font-bold text-slate-300">
            選択中の牌（{stagingTiles.length} / {config.maxTiles}枚）
          </p>
          <div className="flex min-h-[60px] flex-wrap items-center gap-0.5">
            {stagingTiles.length === 0 ? (
              <span className="text-sm text-slate-500">
                下の牌をタップして追加してください
              </span>
            ) : (
              stagingTiles.map((tile, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleRemoveStaging(index)}
                  className="cursor-pointer hover:opacity-60"
                  title="クリックで削除"
                >
                  <TileSvg tile={tile} size="small" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* 牌グリッド */}
        <div className="p-4">
          <TileGrid
            globalTiles={globalTiles}
            stagingTiles={stagingTiles}
            onTileSelect={handleTileSelect}
            maxTiles={config.maxTiles}
          />
        </div>

        {/* フッター */}
        <div className="flex gap-3 border-t border-slate-700 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-700 py-3 text-sm text-slate-300 hover:bg-slate-600"
          >
            閉じる
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`flex-1 rounded-lg py-3 text-sm font-semibold ${
              canConfirm
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-slate-600 text-slate-400'
            }`}
          >
            決定
          </button>
        </div>
      </div>
    </div>
  )
}
