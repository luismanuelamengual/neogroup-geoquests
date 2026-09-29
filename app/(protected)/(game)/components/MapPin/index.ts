import './index.scss'

export type MapPinVariant = 'guess' | 'target'

/**
 * DOM element of a map marker (MapLibre markers take a plain element):
 * a round "pin head" with an optional label (round number, player initial)
 * and a pointer tail. `color` overrides the color of the variant (e.g. the
 * color of a player in multiplayer games).
 */
export function createMapPinElement(variant: MapPinVariant, label?: string, color?: string): HTMLElement {
  const element = document.createElement('div')
  const body = document.createElement('div')
  const head = document.createElement('div')

  element.className = `map-pin variant-${variant}`
  head.className = 'head'
  head.textContent = label ?? (variant === 'target' ? '★' : '')

  if (color) {
    head.style.background = color
    head.style.color = '#111'
  }

  body.className = 'body'
  body.appendChild(head)
  element.appendChild(body)

  return element
}
