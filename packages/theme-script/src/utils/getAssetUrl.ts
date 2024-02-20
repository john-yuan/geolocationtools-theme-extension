import { getConfig } from './getConfig'

export function getAssetUrl(name: string) {
  const { assetUrl } = getConfig()

  if (typeof assetUrl === 'string') {
    return assetUrl.replace('[name]', () => name)
  }

  return ''
}
