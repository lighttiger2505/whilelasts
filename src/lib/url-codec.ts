import type { ConfigV1 } from '@/types/config';

/**
 * ConfigV1をBase64URL形式にエンコードする
 * Canonical JSON形式（キー順: v, a, b, t）で最小化
 */
export function encodeConfig(config: ConfigV1): string {
  // Canonical JSON（キー順固定）
  const canonicalJson = JSON.stringify({
    v: config.v,
    a: config.a,
    b: config.b,
    t: config.t,
  });

  // UTF-8対応のBase64エンコード
  const base64 = btoa(
    encodeURIComponent(canonicalJson).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );

  // Base64URL形式に変換（URL-safe化）
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // padding除去
}

/**
 * Base64URL形式の文字列をConfigV1にデコードする
 */
export function decodeConfig(encoded: string): ConfigV1 | null {
  try {
    // Base64URL形式からBase64に戻す
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

    // padding復元
    while (base64.length % 4) {
      base64 += '=';
    }

    // UTF-8対応のBase64デコード
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsed = JSON.parse(json);

    // 型チェック（簡易版、詳細はvalidationで）
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'v' in parsed &&
      'a' in parsed &&
      'b' in parsed &&
      't' in parsed
    ) {
      return parsed as ConfigV1;
    }

    return null;
  } catch {
    return null;
  }
}
