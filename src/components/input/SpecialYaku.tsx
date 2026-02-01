/**
 * 特殊和了入力コンポーネント（モーダル起動ボタン）
 */

interface SpecialYakuProps {
  readonly onOpenModal: () => void
  readonly hasSpecialYaku: boolean
}

export function SpecialYaku({ onOpenModal, hasSpecialYaku }: SpecialYakuProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-400">特殊和了</h3>
      <button
        type="button"
        onClick={onOpenModal}
        className="w-full rounded-xl bg-slate-800 py-4 text-center text-xs text-slate-500 hover:bg-slate-700"
      >
        {hasSpecialYaku
          ? '✓ 特殊和了が設定されています'
          : '一発・槍槓・天和などを選択'}
      </button>
    </div>
  )
}
