import type { Config } from '../types'

let config: Config | null = null

export function getConfig(): Config {
  if (!config) {
    config = {}
    const script = document.querySelector(
      'script.geolocationtools-config[type="application/json"]'
    )
    if (script) {
      const content = script.textContent || '{}'
      try {
        config = (JSON.parse(content) || {}) as Config
      } catch (err) {
        // empty
      }
    }
  }

  return config
}
