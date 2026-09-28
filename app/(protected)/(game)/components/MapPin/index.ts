import './index.scss'

export type MapPinVariant = 'guess' | 'target'

/**
 * DOM element of a map marker (MapLibre markers take a plain element):
 * a round "pin head" with an optional label (round number) and a pointer tail.
 */
export function createMapPinElement(variant: MapPinVariant, label?: string): HTMLElement {
  const element = document.createElement('div')
  const body = document.createElement('div')
  const head = document.createElement('div')

  element.className = `map-pin variant-${variant}`
  head.className = 'head'
  head.textContent = label ?? (variant === 'target' ? '★' : '')
  body.className = 'body'
  body.appendChild(head)
  element.appendChild(body)

  return element
}
