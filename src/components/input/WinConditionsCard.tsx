/**
 * 和了条件入力コンポーネント（カード型）
 */

// 1. React関連
import { useCallback } from 'react'

interface WinConditionsCardProps {
  isTsumo: boolean
  isRiichi: boolean
  isDoubleRiichi: boolean
  onToggleTsumo: () => void
  onToggleRiichi: () => void
  onToggleDoubleRiichi: () => void
}

export function WinConditionsCard({
  isTsumo,
  isRiichi,
  isDoubleRiichi,
  onToggleTsumo,
  onToggleRiichi,
  onToggleDoubleRiichi,
}: WinConditionsCardProps) {
  // ツモ選択ハンドラー
  const handleTsumoClick = useCallback(() => {
    if (!isTsumo) onToggleTsumo()
  }, [isTsumo, onToggleTsumo])

  // ロン選択ハンドラー
  const handleRonClick = useCallback(() => {
    if (isTsumo) onToggleTsumo()
  }, [isTsumo, onToggleTsumo])

  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-400">和了方法</h3>

      <div className="flex gap-3">
        {/* ツモ/ロン */}
        <div className="flex-1">
          <label className="mb-3 block text-[11px] text-slate-500">
            和了の種類
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTsumoClick}
              className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors ${
                isTsumo
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              ツモ
            </button>
            <button
              type="button"
              onClick={handleRonClick}
              className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors ${
                !isTsumo
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              ロン
            </button>
          </div>
        </div>

        {/* リーチ */}
        <div className="flex-1">
          <label className="mb-3 block text-[11px] text-slate-500">
            リーチ
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleRiichi}
              className={`flex-1 rounded-md py-2.5 text-xs font-semibold transition-colors ${
                isRiichi
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              通常
            </button>
            <button
              type="button"
              onClick={onToggleDoubleRiichi}
              className={`flex-1 rounded-md py-2.5 text-xs font-semibold transition-colors ${
                isDoubleRiichi
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              W
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
