/**
 * 和了条件入力コンポーネント
 */

interface WinConditionsProps {
  isTsumo: boolean
  isRiichi: boolean
  isDoubleRiichi: boolean
  onToggleTsumo: () => void
  onToggleRiichi: () => void
  onToggleDoubleRiichi: () => void
}

export function WinConditions({
  isTsumo,
  isRiichi,
  isDoubleRiichi,
  onToggleTsumo,
  onToggleRiichi,
  onToggleDoubleRiichi,
}: WinConditionsProps) {
  return (
    <>
      <h3 className="mb-4 text-base font-semibold text-gray-800">和了方法</h3>

      <div className="space-y-4">
        {/* ツモ/ロン Segmented Control */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            和了の種類
          </label>
          <div className="inline-flex w-full gap-2">
            <button
              type="button"
              onClick={() => !isTsumo && onToggleTsumo()}
              className={`flex-1 rounded-lg border-2 py-3 text-base font-semibold transition-all ${
                isTsumo
                  ? 'border-gray-900 bg-white text-black shadow-md'
                  : 'border-gray-300 bg-white text-black hover:border-gray-400'
              }`}
            >
              ツモ
            </button>
            <button
              type="button"
              onClick={() => isTsumo && onToggleTsumo()}
              className={`flex-1 rounded-lg border-2 py-3 text-base font-semibold transition-all ${
                !isTsumo
                  ? 'border-gray-900 bg-white text-black shadow-md'
                  : 'border-gray-300 bg-white text-black hover:border-gray-400'
              }`}
            >
              ロン
            </button>
          </div>
        </div>

        {/* リーチ・ダブルリーチ */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            リーチ
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onToggleRiichi}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                isRiichi
                  ? 'border-gray-900 bg-white text-black shadow-md'
                  : 'border-gray-300 bg-white text-black hover:border-gray-400'
              }`}
            >
              リーチ
            </button>
            <button
              type="button"
              onClick={onToggleDoubleRiichi}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                isDoubleRiichi
                  ? 'border-gray-900 bg-white text-black shadow-md'
                  : 'border-gray-300 bg-white text-black hover:border-gray-400'
              }`}
            >
              ダブルリーチ
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
