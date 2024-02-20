import './index.less'
import { createClassPrefix } from '../../utils/createClassPrefix'
import type { NodeObject, RefObject } from '../../dom/render'
import { createTextInputField } from '../TextInputField'
import { addClickListener } from '../../dom/addClickListener'
import { withValue } from '../../utils/withValue'

const cls = createClassPrefix('LockPage')

export function createLockPage({
  title,
  text,
  withForm,
  account,
  password,
  onSubmit
}: {
  title?: string
  text?: string
  withForm?: boolean
  account?: string
  password?: string
  onSubmit?: (
    account: string,
    password: string,
    setButtonText: (text: string) => void
  ) => void
}): NodeObject {
  const children: NodeObject[] = []
  const message: NodeObject[] = []

  if (title) {
    message.push({ tag: 'h1', children: title })
  }

  if (text) {
    text
      .trim()
      .split(/[\r\n]+/)
      .forEach((paragraph) => {
        message.push({ tag: 'p', children: paragraph })
      })
  }

  if (message.length) {
    children.push({
      className: cls('message'),
      children: message
    })
  }

  if (withForm) {
    children.push(
      createLoginForm({
        account,
        password,
        onSubmit
      })
    )
  }

  return {
    className: cls.root().toString(),
    children
  }
}

function createLoginForm({
  account,
  password,
  onSubmit
}: {
  account?: string
  password?: string
  onSubmit?: (
    account: string,
    password: string,
    setButtonText: (text: string) => void
  ) => void
}): NodeObject {
  const refAccount: RefObject<HTMLInputElement> = {}
  const refPassword: RefObject<HTMLInputElement> = {}
  const refButton: RefObject<HTMLDivElement> = {}

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()

    withValue(refAccount.current, (inpAccount) => {
      withValue(refPassword.current, (inpPassword) => {
        const account = inpAccount.value
        const password = inpPassword.value

        if (account && password) {
          onSubmit?.(account, password, (text) => {
            withValue(refButton.current, (button) => {
              button.textContent = text
            })
          })
        }
      })
    })
  }

  return {
    className: cls('form'),
    children: [
      createTextInputField({
        ref: refAccount,
        name: 'account',
        label: 'Account',
        placeholder: 'Account',
        initialValue: account,
        onEnter: handleSubmit
      }),
      createTextInputField({
        ref: refPassword,
        name: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Password',
        initialValue: password,
        onEnter: handleSubmit
      }),
      account && password
        ? {
            className: cls('error'),
            children: 'Error: incorrect account or password!'
          }
        : null,
      {
        ref: refButton,
        className: cls('btn-submit'),
        children: 'Submit',
        onMount: (element: HTMLDivElement) => {
          return addClickListener(element, handleSubmit)
        }
      }
    ]
  }
}
