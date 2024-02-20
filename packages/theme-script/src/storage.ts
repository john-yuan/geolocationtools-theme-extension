import { getConfig } from './utils/getConfig'
import {
  decodeRandomHexString,
  encodeToRandomHexString
} from './utils/security'

function getStorageKey() {
  return getConfig().storageKey || 'com.geolocationtools'
}

// Storage format
// R(confirmedAt)&E(version)&E(account)&E(password)
// R for raw value
// E for encoded value

export interface SavedInfo {
  // lock
  account: string
  password: string
  encodedAccount: string
  encodedPassword: string

  // redirect
  version: string
  confirmedAt: number
}

export function setStorage(
  data: {
    account?: string
    password?: string
    version?: string
    confirmedAt?: number
  },
  useSession?: boolean
) {
  const prev = getStorage(useSession)

  let { encodedAccount, encodedPassword, version, confirmedAt } = prev

  if (typeof data.confirmedAt === 'number') {
    confirmedAt = data.confirmedAt
  }

  if (typeof data.version === 'string') {
    version = encodeToRandomHexString(data.version)
  }

  if (typeof data.account === 'string') {
    encodedAccount = encodeToRandomHexString(data.account)
  }

  if (typeof data.password === 'string') {
    encodedPassword = encodeToRandomHexString(data.password)
  }

  const saved =
    '' +
    confirmedAt +
    '&' +
    version +
    '&' +
    encodedAccount +
    '&' +
    encodedPassword

  if (useSession) {
    sessionStorage.setItem(getStorageKey(), encodeToRandomHexString(saved))
  } else {
    localStorage.setItem(getStorageKey(), encodeToRandomHexString(saved))
  }
}

export function getStorage(useSession?: boolean) {
  const info: SavedInfo = {
    account: '',
    password: '',
    encodedAccount: '',
    encodedPassword: '',
    version: '',
    confirmedAt: 0
  }

  const saved = useSession
    ? sessionStorage.getItem(getStorageKey())
    : localStorage.getItem(getStorageKey())

  // Storage format
  // R(confirmedAt)&E(version)&E(account)&E(password)
  // R for raw value
  // E for encoded value
  if (saved) {
    try {
      const arr = decodeRandomHexString(saved).split('&')
      info.confirmedAt = +arr[0] || 0
      info.encodedAccount = arr[2] || ''
      info.encodedPassword = arr[3] || ''
      info.version = decodeRandomHexString(arr[1] || '')
      info.account = decodeRandomHexString(info.encodedAccount)
      info.password = decodeRandomHexString(info.encodedPassword)
    } catch (err) {
      // ignore error
    }
  }

  return info
}
