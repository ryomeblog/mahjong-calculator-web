/**
 * 手牌構造に関するユーティリティ関数
 */

import type { HandType, MeldSlot } from '@/components/tiles/HandStructureInput'

/**
 * スロット構造を生成するヘルパー関数
 */
export function createSlots(handType: HandType): MeldSlot[] {
  switch (handType) {
    case 'standard':
      return [
        {
          tiles: [null, null],
          maxTiles: 2,
          label: '雀頭',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null, null, null],
          maxTiles: 3,
          label: '面子1',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null, null, null],
          maxTiles: 3,
          label: '面子2',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null, null, null],
          maxTiles: 3,
          label: '面子3',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null, null, null],
          maxTiles: 3,
          label: '面子4',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null],
          maxTiles: 1,
          label: '上がり牌',
          sidewaysTiles: new Set(),
        },
      ]
    case 'chiitoitsu':
      return Array.from({ length: 7 }, (_, i) => ({
        tiles: [null, null],
        maxTiles: 2,
        label: `対子${i + 1}`,
      }))
    case 'kokushi':
      return [
        {
          tiles: Array(13).fill(null),
          maxTiles: 13,
          label: '么九牌13種',
        },
        { tiles: [null], maxTiles: 1, label: '雀頭' },
      ]
  }
}
