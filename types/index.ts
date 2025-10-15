export type PoolRules = {
  price_cents: number
  spots: number
  prize_cents: number
  credit_cents: number
  tokens_threshold?: number
  transfer?: boolean
}

export type ROI = {
  gross: number
  prize: number
  creditLiability: number
  roi: number
}


