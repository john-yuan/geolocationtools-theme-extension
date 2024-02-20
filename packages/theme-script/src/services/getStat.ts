import type { StatInfo } from '../types'
import { base64decode2bytes, bytes2str } from 'x-byte-js'
import { decodeRandomBytes, encodeToRandomHexString } from '../utils/security'
import { encodeShopifyAccessKey } from '../utils/shopify'
import fetchWithJSON from 'fetch-with-json'

export async function getStat({
  shopId,
  encodedAccount,
  encodedPassword
}: {
  shopId: string
  encodedAccount?: string
  encodedPassword?: string
}): Promise<StatInfo> {
  const offset = new Date().getTimezoneOffset()
  return fetchWithJSON<{
    payload?: string
  }>({
    url: '/a/geolocationtools-api/stat',
    headers: {
      'x-k': encodeShopifyAccessKey(shopId),
      'x-c': encodedAccount + '&' + encodedPassword,
      'x-i': encodeToRandomHexString('' + offset + '&' + navigator.language)
    }
  })
    .then((res) => {
      if (res.json.payload) {
        return JSON.parse(
          bytes2str(decodeRandomBytes(base64decode2bytes(res.json.payload)))
        )
      }
      return {}
    })
    .catch(() => ({}))
}
