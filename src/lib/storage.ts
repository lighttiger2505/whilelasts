import type { ConfigV1 } from '@/types/config'
import { validateConfig } from './validation'

const STORAGE_KEY = 'whilelasts_config'

/**
 * LocalStorageから設定を読み込み、バリデーションを実行
 * @returns バリデーション済みの設定、または失敗時はnull
 */
export function loadConfigFromStorage(): ConfigV1 | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored)

    if (!validateConfig(parsed)) {
      console.warn('Invalid config in localStorage')
      // 不正なデータを削除
      clearConfigFromStorage()
      return null
    }

    return parsed
  } catch (error) {
    // SecurityError（プライベートモード）やSyntaxError（不正なJSON）をキャッチ
    console.warn('Failed to load config from localStorage:', error)
    return null
  }
}

/**
 * 設定をLocalStorageに保存
 * @param config 保存する設定
 * @returns 保存成功時はtrue、失敗時はfalse
 */
export function saveConfigToStorage(config: ConfigV1): boolean {
  try {
    const json = JSON.stringify(config)
    localStorage.setItem(STORAGE_KEY, json)
    return true
  } catch (error) {
    // QuotaExceededError（容量超過）やSecurityError（プライベートモード）をキャッチ
    console.warn('Failed to save config to localStorage:', error)
    return false
  }
}

/**
 * LocalStorageから設定を削除
 */
export function clearConfigFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear config from localStorage:', error)
  }
}
