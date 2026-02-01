/**
 * 特殊和了設定モーダル
 */

import { IoClose } from 'react-icons/io5'

interface SpecialYakuModalProps {
  isOpen: boolean
  onClose: () => void
  isIppatsu: boolean
  isChankan: boolean
  isRinshan: boolean
  isHaitei: boolean
  isHoutei: boolean
  isTenhou: boolean
  isChiihou: boolean
  isRiichi: boolean
  onToggleIppatsu: () => void
  onToggleChankan: () => void
  onToggleRinshan: () => void
  onToggleHaitei: () => void
  onToggleHoutei: () => void
  onToggleTenhou: () => void
  onToggleChiihou: () => void
}

interface YakuItem {
  id: string
  name: string
  description: string
  condition?: string
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}

export function SpecialYakuModal({
  isOpen,
  onClose,
  isIppatsu,
  isChankan,
  isRinshan,
  isHaitei,
  isHoutei,
  isTenhou,
  isChiihou,
  isRiichi,
  onToggleIppatsu,
  onToggleChankan,
  onToggleRinshan,
  onToggleHaitei,
  onToggleHoutei,
  onToggleTenhou,
  onToggleChiihou,
}: SpecialYakuModalProps) {
  if (!isOpen) return null

  const yakuList: YakuItem[] = [
    {
      id: 'ippatsu',
      name: '一発',
      description: 'リーチ後、1巡以内に和了',
      condition: 'リーチ後のみ有効',
      checked: isIppatsu,
      disabled: !isRiichi,
      onToggle: onToggleIppatsu,
    },
    {
      id: 'chankan',
      name: '槍槓',
      description: '他家の加槓牌で和了',
      checked: isChankan,
      onToggle: onToggleChankan,
    },
    {
      id: 'rinshan',
      name: '嶺上開花',
      description: 'カン後のツモ牌で和了',
      checked: isRinshan,
      onToggle: onToggleRinshan,
    },
    {
      id: 'haitei',
      name: '海底摸月',
      description: '最後のツモ牌で和了',
      checked: isHaitei,
      onToggle: onToggleHaitei,
    },
    {
      id: 'houtei',
      name: '河底撈魚',
      description: '最後の捨て牌で和了',
      checked: isHoutei,
      onToggle: onToggleHoutei,
    },
    {
      id: 'tenhou',
      name: '天和',
      description: '親の配牌で和了（役満）',
      condition: '親のみ',
      checked: isTenhou,
      onToggle: onToggleTenhou,
    },
    {
      id: 'chiihou',
      name: '地和',
      description: '子の第一ツモで和了（役満）',
      condition: '子のみ',
      checked: isChiihou,
      onToggle: onToggleChiihou,
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-slate-800 p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-50">特殊和了を設定</h2>
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
          該当する特殊和了を選択してください。各役の説明と有効条件を確認できます。
        </p>

        {/* 役リスト */}
        <div className="space-y-3">
          {yakuList.map((yaku) => (
            <button
              key={yaku.id}
              type="button"
              onClick={yaku.disabled ? undefined : yaku.onToggle}
              disabled={yaku.disabled}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                yaku.disabled
                  ? 'cursor-not-allowed border-slate-700 bg-slate-900 opacity-50'
                  : yaku.checked
                    ? 'border-emerald-500 bg-emerald-900/30 shadow-sm'
                    : 'border-slate-700 bg-slate-900 hover:border-blue-500 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* チェックアイコン */}
                <div
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    yaku.checked
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-slate-600 bg-slate-800'
                  }`}
                >
                  {yaku.checked && (
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

                {/* 役情報 */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3
                      className={`text-base font-bold ${
                        yaku.checked ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {yaku.name}
                    </h3>
                    {yaku.condition && (
                      <span className="rounded-full bg-amber-900/50 px-2 py-0.5 text-xs font-medium text-amber-400">
                        {yaku.condition}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{yaku.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  )
}
