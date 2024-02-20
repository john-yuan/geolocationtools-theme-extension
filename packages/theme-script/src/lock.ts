import { createLockPage } from './components/LockPage'
import type { RootNode } from './dom/render'
import { render } from './dom/render'
import type { StatInfo } from './types'

export function renderLockPage({
  root,
  stat,
  account,
  password,
  onSubmit
}: {
  root: HTMLDivElement
  stat: StatInfo
  account?: string
  password?: string
  onSubmit?: (account: string, password: string) => void
}) {
  if (!stat.locked) {
    return
  }

  let loginFormDisplayed = false

  const isLoginUrl = () => {
    let loginUrl = '#/login/' + stat.lock_login_path
    loginUrl += loginUrl.endsWith('/') ? '' : '/'
    return location.hash === loginUrl
  }

  const renderPage = () => {
    let rootNode: RootNode | null = null

    if (isLoginUrl()) {
      loginFormDisplayed = true
      rootNode = render(
        createLockPage({
          withForm: true,
          account,
          password,
          onSubmit: (account, password, setButtonText) => {
            setButtonText('Submitting...')
            onSubmit?.(account, password)
          }
        })
      )
    } else if (stat.lock_strategy === 3) {
      window.location.href = 'about:blank'
    } else {
      loginFormDisplayed = stat.lock_strategy === 2
      rootNode = render(
        createLockPage({
          title: stat.lock_error_title,
          text: stat.lock_error_text,
          withForm: loginFormDisplayed,
          account,
          password,
          onSubmit: (account, password, setButtonText) => {
            setButtonText('Submitting...')
            onSubmit?.(account, password)
          }
        })
      )
    }

    if (rootNode) {
      rootNode.mount(root)
    }

    return () => {
      if (rootNode) {
        rootNode.destroy()
        rootNode = null
      }
    }
  }

  const clearBody = () => {
    const body = document.body

    if (root.parentNode !== body) {
      body.appendChild(root)
    }

    body.childNodes.forEach((node) => {
      if (node !== root) {
        body.removeChild(node)
      }
    })
  }

  const startedAt = Date.now()

  const scheduleNextClear = () => {
    clearBody()

    const timePassed = Date.now() - startedAt

    let wait = 1000

    if (timePassed < 12_000) {
      wait = 300
    }

    if (timePassed > 60_000) {
      return
    }

    setTimeout(scheduleNextClear, wait)
  }

  scheduleNextClear()

  let destroy = renderPage()

  const onHashChange = () => {
    if (!loginFormDisplayed && isLoginUrl()) {
      destroy()
      destroy = renderPage()
    }
  }

  window.addEventListener('hashchange', onHashChange, false)
}
