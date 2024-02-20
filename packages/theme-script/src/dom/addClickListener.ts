export function addClickListener<T extends HTMLElement = HTMLElement>(
  element: T,
  onClick?: (e: MouseEvent) => void
) {
  if (!onClick) {
    return () => {}
  }

  element.addEventListener('click', onClick, false)

  return () => {
    element.removeEventListener('click', onClick, false)
  }
}
