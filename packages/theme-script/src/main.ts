import './main.less'
import './utils/getConfig'
import { getConfig } from './utils/getConfig'
import { render } from './dom/render'
import { createClassPrefix } from './utils/createClassPrefix'
import { getStat } from './services/getStat'
import { renderRedirectModal } from './redirect'
import { renderLockPage } from './lock'
import { getStorage, setStorage } from './storage'

function start() {
  const config = getConfig()
  const shopId = config.shopId

  if (shopId) {
    const { account, password, encodedAccount, encodedPassword } = getStorage()

    getStat({
      shopId,
      encodedAccount,
      encodedPassword
    }).then((stat) => {
      if (!(stat.locked || (stat.code && stat.redirect_settings))) {
        return
      }

      let mode = 'light'

      if (mode === 'auto') {
        if (typeof window.matchMedia === 'function') {
          mode = matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        }
      }

      render({
        className: createClassPrefix('Container')
          .root()
          .prefixed({ dark: mode === 'dark' }),

        onMount: (root: HTMLDivElement) => {
          if (stat.locked) {
            renderLockPage({
              root,
              stat,
              account,
              password,
              onSubmit: (account, password) => {
                setStorage({ account, password })
                location.reload()
              }
            })
          } else if (stat.code && stat.redirect_settings) {
            renderRedirectModal({
              root,
              code: stat.code,
              settings: stat.redirect_settings
            })
          }
        }
      }).mount(document.body)
    })
  }
}

if (document.body) {
  start()
} else {
  window.addEventListener('DOMContentLoaded', start, false)
}
