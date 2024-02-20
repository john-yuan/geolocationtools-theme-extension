import { COUNTRY_CODES } from '../data/countryCodes'

let map: Record<string, boolean> | null = null

export function getCountryCodes(): Record<string, boolean> {
  if (!map) {
    map = {}

    for (let i = 0; i < COUNTRY_CODES.length; i += 1) {
      map[COUNTRY_CODES[i]] = true
    }
  }

  return map
}
