/**
 * ヘッダーコンポーネント
 */

export function Header() {
  return (
    <header className="bg-slate-800">
      <div className="flex h-16 items-center justify-center">
        <h1 className="text-xl font-bold text-slate-50">
          まじゃっぴー
          <span className="hidden lg:inline">（麻雀点数計算アプリ）</span>
        </h1>
      </div>
    </header>
  )
}
