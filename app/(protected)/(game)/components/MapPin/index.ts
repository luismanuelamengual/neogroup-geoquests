import './index.scss'

export type MapPinVariant = 'guess' | 'target'

/**
 * DOM element of a map marker (MapLibre markers take a plain element):
 * a round "pin head" with an optional label (round number) and a pointer tail.
 */
export function createMapPinElement(variant: MapPinVariant, label?: string): HTMLElement {
  const element = document.createElement('div')
  const head = document.createElement('div')

  element.className = `map-pin variant-${variant}`
  head.className = 'head'
  head.textContent = label ?? (variant === 'target' ? '★' : '')
  element.appendChild(head)

  return element
}
