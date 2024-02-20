export interface RefObject<T extends HTMLElement = HTMLElement> {
  current?: T
}

export interface NodeObject {
  tag?: string
  ref?: RefObject
  className?: string
  innerHTML?: string
  children?: NodeType | NodeType[]
  onCreate?: (element: any) => (() => void) | void
  onMount?: (element: any) => (() => void) | void
}

export type NodeType =
  | NodeObject
  | boolean
  | number
  | string
  | number
  | null
  | undefined

type Context = {
  destroyCallbacks: (() => void)[]
  mountCallbacks: (() => void)[]
  mountDestroyCallbacks: (() => void)[]
}

function renderToElement(ctx: Context, node?: NodeType | NodeType[]) {
  if (node == null || typeof node === 'boolean') {
    return null
  }

  if (typeof node === 'string') {
    return document.createTextNode(node)
  }

  if (typeof node === 'number') {
    return document.createTextNode('' + node)
  }

  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment()

    node.forEach((child) => {
      const childElement = renderToElement(ctx, child)
      if (childElement) {
        fragment.appendChild(childElement)
      }
    })

    return fragment
  }

  const element = document.createElement(node.tag || 'div')

  if (node.className) {
    element.className = node.className
  }

  if (node.ref) {
    node.ref.current = element
  }

  if (node.children) {
    const childElement = renderToElement(ctx, node.children)
    if (childElement) {
      element.appendChild(childElement)
    }
  } else if (node.innerHTML) {
    element.innerHTML = node.innerHTML
  }

  if (node.onCreate) {
    try {
      const cb = node.onCreate(element)
      if (cb) {
        ctx.destroyCallbacks.push(cb)
      }
    } catch (err) {
      setTimeout(() => {
        console.error(err)
      }, 0)
    }
  }

  if (node.onMount) {
    const onMount = node.onMount
    ctx.mountCallbacks.push(() => {
      const cb = onMount(element)
      if (cb) {
        ctx.mountDestroyCallbacks.push(cb)
      }
    })
  }

  return element
}

export interface RootNode {
  mount: (node: Node) => void
  destroy: () => void
}

export function render(node?: NodeType) {
  const ctx: Context = {
    mountDestroyCallbacks: [],
    mountCallbacks: [],
    destroyCallbacks: []
  }

  const element = renderToElement(ctx, node)

  let mounted = false
  let destroyed = false

  const rootNode: RootNode = {
    mount: (node) => {
      if (destroyed) {
        throw new Error('the dom is destroyed')
      }

      if (mounted) {
        throw new Error('already mounted')
      }

      mounted = true

      if (element) {
        node.appendChild(element)
      }

      ctx.mountCallbacks.forEach((cb) => {
        try {
          cb()
        } catch (err) {
          setTimeout(() => {
            console.error(err)
          }, 0)
        }
      })
    },
    destroy: () => {
      if (destroyed) {
        return
      }

      destroyed = true

      if (mounted) {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element)
        }
        ctx.mountDestroyCallbacks.forEach((cb) => {
          try {
            cb()
          } catch (err) {
            setTimeout(() => {
              console.error(err)
            }, 0)
          }
        })
      }

      ctx.destroyCallbacks.forEach((cb) => {
        try {
          cb()
        } catch (err) {
          setTimeout(() => {
            console.error(err)
          }, 0)
        }
      })
    }
  }

  return rootNode
}
