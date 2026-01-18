/**
 * 役判定メイン処理
 */

import type { MeldGroup, WinningConditions, YakuItem } from '../types'
import { YAKU_DEFINITIONS } from '../constants'

// 実装済みの役
import { isTanyao } from './one-han/tanyao'
import { isPinfu } from './one-han/pinfu'
import { isToitoi } from './two-han/toitoi'
import { isChinitsu } from './six-han/chinitsu'
import { isDaisangen } from './yakuman/daisangen'

/**
 * 役を判定
 *
 * @param meldGroup - 面子分解結果
 * @param conditions - 和了条件
 * @returns 役の配列
 */
export function detectYaku(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): YakuItem[] {
  const yaku: YakuItem[] = []

  // 1. 役満を先にチェック
  const yakumanList = detectYakuman(meldGroup, conditions)
  if (yakumanList.length > 0) {
    return yakumanList // 役満があれば通常役は含めない
  }

  // 2. 状況役
  if (conditions.isDoubleRiichi) {
    yaku.push(createYakuItem('double-riichi'))
  } else if (conditions.isRiichi) {
    yaku.push(createYakuItem('riichi'))
  }

  if (conditions.isIppatsu) {
    yaku.push(createYakuItem('ippatsu'))
  }

  if (conditions.isTsumo && meldGroup.melds.every((m) => m.isConcealed)) {
    yaku.push(createYakuItem('tsumo'))
  }

  if (conditions.isHaitei) {
    yaku.push(createYakuItem('haitei'))
  }

  if (conditions.isHoutei) {
    yaku.push(createYakuItem('houtei'))
  }

  if (conditions.isRinshan) {
    yaku.push(createYakuItem('rinshan'))
  }

  if (conditions.isChankan) {
    yaku.push(createYakuItem('chankan'))
  }

  // 3. 手役（実装済み）
  if (isChinitsu(meldGroup)) {
    yaku.push(createYakuItem('chinitsu'))
  }

  if (isTanyao(meldGroup)) {
    yaku.push(createYakuItem('tanyao'))
  }

  if (isPinfu(meldGroup, conditions)) {
    yaku.push(createYakuItem('pinfu'))
  }

  if (isToitoi(meldGroup)) {
    yaku.push(createYakuItem('toitoi'))
  }

  // TODO: 他の役の実装
  // - 一盃口、役牌、混全帯么九、一気通貫、三色同順、三色同刻、三槓子、三暗刻、小三元、混老頭
  // - 二盃口、純全帯么九、混一色
  // これらは同様のパターンで実装可能

  // 役がない場合はエラー
  if (yaku.length === 0) {
    throw new Error('役がありません')
  }

  return yaku
}

/**
 * 役満を判定
 */
function detectYakuman(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): YakuItem[] {
  const yakuman: YakuItem[] = []

  // 天和・地和
  if (conditions.isTenhou) {
    yakuman.push(createYakuItem('tenhou'))
    return yakuman
  }

  if (conditions.isChiihou) {
    yakuman.push(createYakuItem('chiihou'))
    return yakuman
  }

  // 国士無双（特殊形で判定済み）
  if (meldGroup.isSpecial && meldGroup.specialType === 'kokushi') {
    yakuman.push(createYakuItem('kokushi'))
    return yakuman
  }

  // 大三元
  if (isDaisangen(meldGroup)) {
    yakuman.push(createYakuItem('daisangen'))
  }

  // TODO: 他の役満の実装
  // - 四暗刻、小四喜、大四喜、字一色、清老頭、緑一色、九蓮宝燈、四槓子
  // これらも同様のパターンで実装可能

  return yakuman
}

/**
 * YakuItemを作成
 */
function createYakuItem(name: keyof typeof YAKU_DEFINITIONS): YakuItem {
  const def = YAKU_DEFINITIONS[name]
  return {
    name: def.name,
    han: def.han,
    displayName: def.displayName,
    isYakuman: def.isYakuman,
    openHan: def.openHan ?? undefined,
  }
}

/**
 * 翻数を計算
 *
 * @param yaku - 役の配列
 * @param conditions - 和了条件
 * @returns 合計翻数
 */
export function calculateHan(
  yaku: readonly YakuItem[],
  conditions: WinningConditions
): number {
  // 役の翻数を合計
  const yakuHan = yaku.reduce((sum, y) => sum + y.han, 0)

  // ドラの翻数
  const doraHan =
    conditions.doraCount +
    conditions.uraDoraCount +
    conditions.redDoraCount

  return yakuHan + doraHan
}
