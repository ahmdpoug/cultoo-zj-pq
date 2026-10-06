import { createOnboarding, mockServices } from './mock'
import { xSocial } from './x-social'
import type { CultServices } from './types'

/**
 * Single switch point for integrations. Identity (X via Privy) and the
 * wallet (Privy embedded wallet) are real; the $CULT economy is still simulated.
 */
export const services: CultServices = {
  ...mockServices,
  social: xSocial,
  onboarding: createOnboarding(xSocial),
}

export const IS_SIMULATED = true

export { InsufficientBalanceError } from './types'
export { XLookupError } from './x-social'
export { UPGRADE_COST } from './mock'
