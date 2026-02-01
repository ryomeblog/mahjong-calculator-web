/**
 * 場風・自風選択コンポーネント（コンパクト版）
 */

// 1. React関連
import { useCallback } from 'react'

// 2. 型定義
import type { Wind } from '@/core/mahjong'

// 3. 定数
import { WIND_LABELS } from '@/types/ui'

interface WindSelectorCompactProps {
  roundWind: Wind
  seatWind: Wind
  onRoundWindChange: (wind: Wind) => void
  onSeatWindChange: (wind: Wind) => void
}

export function WindSelectorCompact({
  roundWind,
  seatWind,
  onRoundWindChange,
  onSeatWindChange,
}: WindSelectorCompactProps) {
  const winds: Wind[] = ['east', 'south', 'west', 'north']

  // 場風変更ハンドラー（useCallbackで最適化）
  const handleRoundWindClick = useCallback(
    (wind: Wind) => {
      onRoundWindChange(wind)
    },
    [onRoundWindChange]
  )

  // 自風変更ハンドラー（useCallbackで最適化）
  const handleSeatWindClick = useCallback(
    (wind: Wind) => {
      onSeatWindChange(wind)
    },
    [onSeatWindChange]
  )

  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-400">場風・自風</h3>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* 場風 */}
        <div className="flex-1">
          <label className="mb-2 block text-[11px] text-slate-500">場風</label>
          <div className="flex gap-1.5">
            {winds.map((wind) => (
              <button
                key={wind}
                type="button"
                onClick={() => handleRoundWindClick(wind)}
                className={`flex-1 rounded-md border-2 py-2 text-sm font-semibold transition-colors ${
                  roundWind === wind
                    ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                    : 'border-slate-600 bg-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-600'
                }`}
              >
                {WIND_LABELS[wind]}
              </button>
            ))}
          </div>
        </div>

        {/* 自風 */}
        <div className="flex-1">
          <label className="mb-2 block text-[11px] text-slate-500">自風</label>
          <div className="flex gap-1.5">
            {winds.map((wind) => (
              <button
                key={wind}
                type="button"
                onClick={() => handleSeatWindClick(wind)}
                className={`flex-1 rounded-md border-2 py-2 text-sm font-semibold transition-colors ${
                  seatWind === wind
                    ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                    : 'border-slate-600 bg-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-600'
                }`}
              >
                {WIND_LABELS[wind]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
