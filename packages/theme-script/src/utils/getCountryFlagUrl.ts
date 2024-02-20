import { getAssetUrl } from './getAssetUrl'
import { getCountryCodes } from './getCountryCodes'

export function getCountryFlagUrl(code?: string) {
  const countryCode = typeof code === 'string' ? code.toUpperCase() : null

  if (countryCode && getCountryCodes()[countryCode]) {
    return getAssetUrl(countryCode + '.svg') || null
  }

  return null
}
