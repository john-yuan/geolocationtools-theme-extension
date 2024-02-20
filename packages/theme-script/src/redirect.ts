import { createCountryPicker } from './components/CountryPicker'
import { parseUrl } from './utils/parseUrl'
import { render } from './dom/render'

import type { CountryObject } from './components/CountryPicker'
import type { RootNode } from './dom/render'
import type { RedirectSettings, RedirectSiteSettings } from './types'
import { getStorage, setStorage } from './storage'

function getCurrentSite(settings: RedirectSettings) {
  let current: RedirectSiteSettings | null = null
  let currentLocale = ''

  const sites = settings.sites?.filter((el) => el.homepage) || []
  const page = parseUrl(location.href)

  for (let i = 0; i < sites.length; i += 1) {
    const conf = sites[i]
    if (conf.homepage) {
      const homepage = parseUrl(conf.homepage)

      if (page.domain === homepage.domain) {
        if (!homepage.locale || homepage.locale === page.locale) {
          if (!currentLocale || homepage.locale.length > currentLocale.length) {
            current = conf
            currentLocale = homepage.locale
          }
        }
      }
    }
  }

  return current
}

function getTargetSite(settings: RedirectSettings, regionCode: string) {
  return settings.sites?.find((el) => {
    return (el.codes || []).indexOf(regionCode) > -1
  })
}

function getMarkets(settings: RedirectSettings, target: RedirectSiteSettings) {
  const markets: (CountryObject & { homepage: string })[] = []
  const added: Record<string, boolean> = {}
  const names = {
    ...(settings.names || {}),
    ...(target.names || {})
  }

  settings.sites?.forEach(({ homepage, codes }) => {
    if (homepage && codes?.length) {
      codes.forEach((code) => {
        if (!added[code]) {
          added[code] = true
          markets.push({
            homepage,
            code,
            name: names[code] || code
          })
        }
      })
    }
  })

  return markets
}

export function renderRedirectModal({
  root,
  code,
  settings
}: {
  root: HTMLDivElement
  code: string
  settings: RedirectSettings
}) {
  const current = getCurrentSite(settings)
  const target = getTargetSite(settings, code)

  if (!target || target === current) {
    return
  }

  const storageVer = settings.storage_version || ''
  const storageTTL = settings.storage_ttl || 0
  const useSession = storageTTL === 0
  const saved = getStorage(useSession)

  // check if confirmed before
  if (saved.confirmedAt && storageVer === saved.version) {
    if (useSession) {
      return
    } else {
      const ttl = storageTTL > 0 ? storageTTL : 86400000
      if (Date.now() - saved.confirmedAt < ttl) {
        return
      }
    }
  }

  const markets = getMarkets(settings, target)

  let countryPicker: RootNode | null = render(
    createCountryPicker({
      center: settings.center,
      country: code,
      title: target.title || settings.title,
      paragraphs: settings.text?.split(/\n/),
      okText: target.ok_text || settings.ok_text,
      closeText: target.close_text || settings.close_text,
      filterable: !!settings.filterable && markets.length > settings.filterable,
      searchHint: settings.search_hint,
      emptyHint: settings.empty_hint,
      countries: markets.sort((a, b) => a.name.localeCompare(b.name)),
      onClose: () => {
        handleClose()
        if (settings.close_as_confirm) {
          saveConfirmInfo()
        }
      },
      onConfirm: (selected) => {
        handleClose()
        saveConfirmInfo()

        let targetUrl = selected.homepage

        if (target.with_uri && location.pathname !== '/' && current?.homepage) {
          const { locale: currentLocale } = parseUrl(current.homepage)
          const pathArr = location.pathname.split('/')

          if (currentLocale && pathArr[1] === currentLocale) {
            pathArr.shift()
            pathArr[0] = ''
          }

          targetUrl =
            targetUrl.replace(/\/+$/, '') +
            pathArr.join('/') +
            location.search +
            location.hash
        }

        location.href = targetUrl
      }
    })
  )

  function handleClose() {
    if (countryPicker) {
      countryPicker.destroy()
      countryPicker = null
    }
  }

  function saveConfirmInfo() {
    setStorage(
      {
        version: storageVer,
        confirmedAt: Date.now()
      },
      useSession
    )
  }

  countryPicker.mount(root)
}
