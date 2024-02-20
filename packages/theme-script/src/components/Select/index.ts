import './index.less'
import {
  render,
  type NodeObject,
  type NodeType,
  type RefObject
} from '../../dom/render'

import { createClassPrefix } from '../../utils/createClassPrefix'
import { withValue } from '../../utils/withValue'
import { addClickListener } from '../../dom/addClickListener'
import caretSvg from '../../icons/caret.svg?raw'
import searchSvg from '../../icons/search.svg?raw'

const cls = createClassPrefix('Select')

export interface OptionObject {
  value: string
  label: NodeType
}

export function createSelect({
  className,
  value: propValue,
  options,
  onChange,
  placeholder,
  emptyHint,
  filterable
}: {
  className?: string
  value?: string
  onChange?: (value: string) => void
  options?: OptionObject[]
  placeholder?: string
  emptyHint?: string
  filterable?: boolean
} = {}): NodeObject {
  const refCaret: RefObject<HTMLDivElement> = {}
  const refOverlayWrapper: RefObject<HTMLDivElement> = {}
  const refOverlay: RefObject<HTMLDivElement> = {}
  const refSelected: RefObject<HTMLDivElement> = {}
  const refOptions: RefObject<HTMLUListElement> = {}
  const refContainer: RefObject<HTMLDivElement> = {}
  const refSearchIcon: RefObject<HTMLSpanElement> = {}
  const refInput: RefObject<HTMLInputElement> = {}
  const optionNormal = cls('option')
  const optionHover = cls('option-hover')

  let destroyed = false
  let opened = false
  let openedBefore = false
  let created = false
  let selectedValue = propValue
  let clearPrevSelected: (() => void) | null = null

  function closeOnClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target && target.nodeType === 1) {
      const clickSelect =
        refSelected.current && refSelected.current.contains(target)

      const clickOverlay =
        refOverlay.current && refOverlay.current.contains(target)

      if (!(clickSelect || clickOverlay)) {
        setOpened(false)
      }
    }
  }

  function closeOnEsc(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      setOpened(false)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  function setOpened(nextOpened: boolean) {
    if (!created || nextOpened === opened) {
      return
    }

    opened = nextOpened

    withValue(refCaret.current, (el) => {
      el.setAttribute('data-open', '' + opened)
    })

    withValue(refOverlayWrapper.current, (el) => {
      el.style.display = opened ? 'block' : 'none'
    })

    window.removeEventListener('click', closeOnClickOutside, false)
    window.removeEventListener('keydown', closeOnEsc, false)

    if (opened) {
      window.addEventListener('click', closeOnClickOutside, false)
      window.addEventListener('keydown', closeOnEsc, false)

      withValue(refInput.current, (input) => {
        input.focus()
      })

      if (!openedBefore) {
        openedBefore = true

        withValue(refOptions.current, (ul) => {
          const all = ul.querySelectorAll<HTMLLIElement>('.' + optionNormal)
          const active = ul.querySelector<HTMLLIElement>(
            '.' + optionNormal + '[data-active="true"]'
          )

          if (active) {
            active.className = optionNormal + ' ' + optionHover
            scrollToOption(ul, all, active)
          }
        })
      }
    }
  }

  function renderSelected(node: HTMLElement, option?: OptionObject) {
    clearPrevSelected?.()

    node.innerHTML = ''

    if (option) {
      const selectedLabel = render(option.label)
      selectedLabel.mount(node)
      clearPrevSelected = () => {
        selectedLabel.destroy()
      }
    } else {
      node.textContent = 'Select'
      clearPrevSelected = null
    }
  }

  const optionNodes = (options || []).map((el, index) => {
    const source = { value: el.value.toLowerCase(), label: '' }
    return {
      source,
      tag: 'li',
      className: optionNormal,
      children: el.label,
      onCreate: (li: HTMLLIElement) => {
        source.label = (li.textContent || '').toLowerCase()

        li.setAttribute('data-index', '' + index)

        if (el.value === selectedValue) {
          li.setAttribute('data-active', 'true')
          li.className = optionNormal + ' ' + optionHover
        }

        const onMouseover = () => {
          li.parentElement
            ?.querySelectorAll('.' + optionHover)
            .forEach((li) => {
              li.className = optionNormal
            })
          li.className = optionNormal + ' ' + optionHover
        }

        li.addEventListener('mouseover', onMouseover, false)

        return () => {
          li.removeEventListener('mouseover', onMouseover, false)
        }
      }
    }
  })

  let clearPrevOptions: (() => void) | null = null
  let currentSearchValue = ''

  function renderOptions(node: HTMLDivElement, data: typeof optionNodes) {
    clearPrevOptions?.()
    clearPrevOptions = null

    refOptions.current = undefined

    const result = render(
      data.length
        ? {
            ref: refOptions,
            tag: 'ul',
            className: cls('options'),
            children: data,
            onCreate: (ul: HTMLUListElement) => {
              return addClickListener(ul, (e: MouseEvent) => {
                let target: HTMLLIElement | null = null
                let tmp: Node | null = e.target as Node

                while (tmp) {
                  if (tmp == ul) {
                    tmp = null
                  } else if (tmp) {
                    if (tmp.parentNode == ul) {
                      target = tmp as HTMLLIElement
                      tmp = null
                    } else {
                      tmp = tmp.parentNode
                    }
                  }
                }

                if (target) {
                  setOpened(false)
                  setActiveOption(ul, target)
                }
              })
            }
          }
        : {
            className: cls('empty'),
            children: emptyHint || 'No results found.'
          }
    )

    result.mount(node)

    clearPrevOptions = () => {
      result.destroy()
    }
  }

  function setActiveOption(ul: HTMLUListElement, li: HTMLLIElement) {
    if (!li.getAttribute('data-active')) {
      const prev = ul.querySelectorAll('li[data-active="true"]')

      prev.forEach((el) => {
        el.removeAttribute('data-active')
      })

      const option = options?.[+(li.getAttribute('data-index') || 0)]

      li.setAttribute('data-active', 'true')

      if (option) {
        selectedValue = option.value
        withValue(refSelected.current, (div) => {
          renderSelected(div, option)
        })
        onChange?.(option.value)
      }
    }
  }

  function scrollToOption(
    ul: HTMLUListElement,
    list: NodeListOf<HTMLLIElement>,
    li: HTMLLIElement
  ) {
    let top = 0
    let bottom = 0
    let itemHeight = li.offsetHeight

    for (let i = 0; i <= list.length; i += 1) {
      const el = list[i]
      itemHeight = itemHeight || el.offsetHeight
      if (el === li) {
        itemHeight = itemHeight || 40
        top = i * itemHeight
        bottom = top + itemHeight
        break
      }
    }

    const maxTop = ul.scrollTop
    const maxBottom = maxTop + ul.clientHeight

    if (top < maxTop || bottom > maxBottom) {
      ul.scrollTop = top
    }
  }

  return {
    className: cls.root().raw(className).toString(),
    onCreate: () => {
      created = true
      return () => {
        window.removeEventListener('click', closeOnClickOutside, false)
        clearPrevOptions?.()
        clearPrevOptions = null
        destroyed = true
      }
    },
    children: [
      {
        ref: refSelected,
        className: cls('selected'),
        onCreate: (node: HTMLDivElement) => {
          renderSelected(
            node,
            options?.find((el) => el.value === selectedValue)
          )
          return addClickListener(node, () => {
            setOpened(!opened)
          })
        }
      },
      {
        ref: refCaret,
        className: cls('caret'),
        innerHTML: caretSvg
      },
      {
        ref: refOverlayWrapper,
        className: cls('overlay-wrapper'),
        children: {
          className: cls('overlay'),
          ref: refOverlay,
          children: [
            filterable
              ? {
                  className: cls('input-wrapper'),
                  children: [
                    {
                      ref: refSearchIcon,
                      tag: 'span',
                      className: cls('icon-search'),
                      onCreate: (node: HTMLSpanElement) => {
                        node.innerHTML = searchSvg
                      }
                    },
                    {
                      ref: refInput,
                      tag: 'input',
                      onCreate: (node: HTMLInputElement) => {
                        node.placeholder = placeholder || 'Search'

                        const onFocus = () => {
                          withValue(refSearchIcon.current, (span) => {
                            span.setAttribute('data-active', 'true')
                          })
                        }

                        const onBlur = () => {
                          withValue(refSearchIcon.current, (span) => {
                            span.removeAttribute('data-active')
                          })
                        }

                        const doSearch = () => {
                          if (destroyed) {
                            return
                          }

                          const searchValue = node.value.trim().toLowerCase()

                          if (searchValue === currentSearchValue) {
                            return
                          }

                          const filtered: typeof optionNodes = []

                          optionNodes.forEach((el) => {
                            if (el.source.value === searchValue) {
                              filtered.unshift(el)
                            } else if (el.source.label.includes(searchValue)) {
                              filtered.push(el)
                            }
                          })

                          currentSearchValue = searchValue

                          withValue(refContainer.current, (node) => {
                            renderOptions(node, filtered)
                          })
                        }

                        const onKeydown = (e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.keyCode === 38) {
                            e.preventDefault()
                            e.stopPropagation()
                            move(-1)
                          } else if (
                            e.key === 'ArrowDown' ||
                            e.keyCode === 40
                          ) {
                            e.preventDefault()
                            e.stopPropagation()
                            move(1)
                          } else if (e.key === 'Enter' || e.keyCode === 13) {
                            setOpened(false)
                            withValue(refOptions.current, (ul) => {
                              const hovered = ul.querySelector<HTMLLIElement>(
                                '.' + optionHover
                              )
                              if (hovered) {
                                setActiveOption(ul, hovered)
                              }
                            })
                          } else {
                            doSearch()
                          }
                        }

                        const move = (step: number) => {
                          withValue(refOptions.current, (ul) => {
                            const all = ul.querySelectorAll<HTMLLIElement>(
                              '.' + optionNormal
                            )
                            const actives = ul.querySelectorAll<HTMLLIElement>(
                              '.' + optionHover
                            )
                            const active = actives[0]

                            let next: HTMLLIElement | null = null

                            if (active) {
                              if (step === -1) {
                                next =
                                  active.previousElementSibling as HTMLLIElement
                              } else {
                                next =
                                  active.nextElementSibling as HTMLLIElement
                              }
                            }

                            if (!next && all.length) {
                              if (step === -1) {
                                next = all[all.length - 1]
                              } else {
                                next = all[0]
                              }
                            }

                            actives.forEach((li) => {
                              li.className = optionNormal
                            })

                            if (next) {
                              next.className = optionNormal + ' ' + optionHover
                              scrollToOption(ul, all, next)
                            }
                          })
                        }

                        node.addEventListener('focus', onFocus, false)
                        node.addEventListener('blur', onBlur, false)
                        node.addEventListener('keydown', onKeydown, false)
                        node.addEventListener('input', doSearch, false)

                        return () => {
                          node.removeEventListener('focus', onFocus, false)
                          node.removeEventListener('blur', onBlur, false)
                          node.removeEventListener('keydown', onKeydown, false)
                          node.removeEventListener('input', doSearch, false)
                        }
                      }
                    }
                  ]
                }
              : false,
            {
              ref: refContainer,
              onCreate: (node: HTMLDivElement) => {
                renderOptions(node, optionNodes)
              }
            }
          ]
        }
      }
    ]
  }
}
