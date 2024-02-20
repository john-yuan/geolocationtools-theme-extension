import './index.less'

import type { NodeObject, RefObject } from '../../dom/render'
import { createClassPrefix } from '../../utils/createClassPrefix'

const cls = createClassPrefix('TextInputField')

export function createTextInputField({
  ref,
  label,
  placeholder,
  initialValue,
  name,
  type,
  onEnter
}: {
  ref?: RefObject
  label?: string
  placeholder?: string
  name?: string
  type?: string
  initialValue?: string
  onEnter?: (e: KeyboardEvent) => void
}): NodeObject {
  return {
    className: cls.root().toString(),
    children: [
      {
        className: cls('label'),
        children: label
      },
      {
        ref,
        tag: 'input',
        className: cls('input'),
        onCreate: (input: HTMLInputElement) => {
          input.placeholder = placeholder || ''
          input.type = type || 'text'
          input.value = initialValue || ''

          if (name) {
            input.name = name
          }

          if (onEnter) {
            const onKeydown = (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.keyCode === 13) {
                onEnter(e)
              }
            }

            input.addEventListener('keydown', onKeydown, false)

            return () => {
              input.removeEventListener('keydown', onKeydown, false)
            }
          }
        }
      }
    ]
  }
}
