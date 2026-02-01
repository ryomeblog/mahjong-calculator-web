/**
 * 手牌形式選択モーダル（標準形・七対子・国士無双）
 */

import { IoClose, IoSettings } from 'react-icons/io5'

type HandType = 'standard' | 'chiitoitsu' | 'kokushi'

interface HandTypeModalProps {
  readonly isOpen: boolean
  readonly currentType: HandType
  readonly onSelect: (type: HandType) => void
  readonly onClose: () => void
}

const HAND_TYPE_CONFIG = {
  standard: {
    label: '標準形',
    description: '4面子1雀頭（通常の和了形）',
  },
  chiitoitsu: {
    label: '七対子',
    description: '7組の対子',
  },
  kokushi: {
    label: '国士無双',
    description: '13種類の么九牌',
  },
}

export function HandTypeModal({
  isOpen,
  currentType,
  onSelect,
  onClose,
}: HandTypeModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-50">手牌形式を選択</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* 説明文 */}
        <p className="mb-6 text-sm text-slate-400">
          和了形式を選択してください。選択に応じて入力枠が変わります。
        </p>

        {/* 選択肢 */}
        <div className="space-y-3">
          {(Object.keys(HAND_TYPE_CONFIG) as HandType[]).map((type) => {
            const config = HAND_TYPE_CONFIG[type]
            const isSelected = currentType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onSelect(type)
                  onClose()
                }}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-900/30 shadow-sm'
                    : 'border-slate-700 bg-slate-900 hover:border-blue-500 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* チェックアイコン */}
                  <div
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* 形式情報 */}
                  <div className="flex-1">
                    <h3
                      className={`mb-1 text-base font-bold ${
                        isSelected ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {config.label}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {config.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function HandTypeSettingButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-blue-600 transition-colors hover:bg-blue-700"
      title="手牌形式を変更"
    >
      <IoSettings size={20} className="text-white" />
    </div>
  )
}
