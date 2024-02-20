import { str2bytes } from 'x-byte-js'
import { encodeToRandomHexString } from './security'

/**
 * Encode shopify accessKey
 *
 * @param myshopifyDomain myshopify.com domain, `example.myshopify.com` for example
 * @param type redirect(1), lock(2)
 * @returns string
 */
export function encodeShopifyAccessKey(shopID: string) {
  const bytes = str2bytes(shopID)

  let sum = 0

  for (let i = 0; i < bytes.length; i += 1) {
    sum += bytes[i]
  }

  return encodeToRandomHexString(`shopify:` + shopID, sum)
}
