export interface ConfigV1 {
  v: 1;              // schema version
  a: number;         // age at death（死ぬ年齢）
  b: string;         // birthday（YYYY-MM-DD）
  t: string;         // time zone（IANA TZ名）
}

export type Config = ConfigV1;
