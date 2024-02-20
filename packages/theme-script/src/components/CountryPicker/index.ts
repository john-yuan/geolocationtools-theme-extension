import './index.less'
import { createClassPrefix } from '../../utils/createClassPrefix'
import { createSelect } from '../Select'
import { addClickListener } from '../../dom/addClickListener'
import { getCountryFlagUrl } from '../../utils/getCountryFlagUrl'
import closeSvg from '../../icons/close.svg?raw'
import type { NodeObject } from '../../dom/render'

const cls = createClassPrefix('CountryPicker')

export interface CountryObject {
  code: string
  name: string
}

export function createCountryPicker<T extends CountryObject = CountryObject>({
  center,
  country,
  countries,
  onClose,
  onConfirm,
  ...props
}: {
  center?: boolean
  country?: string
  countries?: T[]
  onClose?: () => void
  onConfirm?: (value: T) => void
  title?: string
  paragraphs?: string[]
  okText?: string
  closeText?: string
  filterable?: boolean
  searchHint?: string
  emptyHint?: string
} = {}): NodeObject {
  let selected = country

  const title = props.title || 'Are you in the right place?'
  const paragraphs = props.paragraphs?.length
    ? props.paragraphs
    : [
        'Choose another country or region to access content and online shopping options applicable to your location.'
      ]

  const okText = props.okText || 'Continue'
  const closeText = props.closeText || 'Close'

  return {
    className: cls('container'),
    children: {
      className: cls('modal'),
      onMount: (modal: HTMLDivElement) => {
        const updatePos = () => {
          if (center) {
            const marginTop = (window.innerHeight - modal.clientHeight) / 2
            if (marginTop > 64) {
              modal.style.marginTop = marginTop + 'px'
            } else {
              modal.style.marginTop = ''
            }
          }
        }

        updatePos()
        window.addEventListener('resize', updatePos, false)
        return () => {
          window.removeEventListener('size', updatePos, false)
        }
      },
      children: [
        {
          tag: 'button',
          className: cls('close-icon'),
          innerHTML: closeSvg,
          onCreate: (node: HTMLButtonElement) => {
            return addClickListener(node, onClose)
          }
        },
        {
          tag: 'h2',
          className: cls('title'),
          children: title
        },
        {
          className: cls('tip-wrapper'),
          children: paragraphs.map((paragraph) => ({
            tag: 'p',
            className: cls('tip'),
            children: paragraph
          }))
        },
        createSelect({
          className: cls('select'),
          value: selected,
          filterable: props.filterable,
          placeholder: props.searchHint,
          emptyHint: props.emptyHint,
          options: countries?.map((item) => {
            const url = getCountryFlagUrl(item.code)

            return {
              value: item.code,
              label: {
                className: cls('country', url ? 'country-with-flag' : null),
                onCreate: (node: HTMLDivElement) => {
                  node.title = item.name
                },
                children: [
                  url
                    ? {
                        tag: 'span',
                        className: cls('flag'),
                        onCreate: (node: HTMLSpanElement) => {
                          node.style.backgroundImage = `url(${JSON.stringify(
                            url
                          )})`
                        }
                      }
                    : null,
                  {
                    tag: 'span',
                    children: item.name
                  }
                ]
              }
            }
          }),
          onChange: (value) => {
            selected = value
          }
        }),
        {
          className: cls('footer'),
          children: [
            {
              tag: 'button',
              className: cls('btn-close'),
              children: closeText,
              onCreate: (node: HTMLButtonElement) => {
                return addClickListener(node, onClose)
              }
            },
            {
              tag: 'button',
              className: cls('btn-continue'),
              children: okText,
              onCreate: (node: HTMLButtonElement) => {
                return addClickListener(node, () => {
                  const country = countries?.find((el) => el.code === selected)
                  if (country) {
                    onConfirm?.(country)
                  }
                })
              }
            }
          ]
        }
      ]
    }
  }
}
