'use client'

import './index.scss'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

/** Milliseconds per character of the typewriter effect. */
const TYPING_MS_PER_CHAR = 22

interface SpeechBubbleProps {
  text: string
  /** Who speaks (shown above the text). */
  speaker?: string
  /** Writes the text letter by letter (instantly when the user prefers reduced motion). */
  typing?: boolean
  /** Where the tail points to: the speaker is below the bubble, on that side. */
  tail?: 'left' | 'center' | 'right'
  /** Called once the whole text is shown. */
  onDone?: () => void
  className?: string
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Comic speech bubble (detective mode: what the witnesses say). Optionally
 * written letter by letter; a tap shows the rest at once. The full text is
 * always laid out (invisible) so the bubble never changes its size while
 * typing, and screen readers get it whole.
 */
export default function SpeechBubble({
  text,
  speaker,
  typing = false,
  tail = 'center',
  onDone,
  className
}: SpeechBubbleProps) {
  const [shown, setShown] = useState(typing ? 0 : text.length)
  const done = shown >= text.length

  useEffect(() => {
    if (!typing || prefersReducedMotion()) {
      setShown(text.length)

      return
    }

    setShown(0)

    const timer = window.setInterval(() => {
      setShown((current) => {
        if (current >= text.length) {
          window.clearInterval(timer)
        }

        return Math.min(text.length, current + 1)
      })
    }, TYPING_MS_PER_CHAR)

    return () => window.clearInterval(timer)
  }, [text, typing])

  useEffect(() => {
    if (done) {
      onDone?.()
    }
    // Only when it gets done (not when the callback identity changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <div
      className={classNames('speech-bubble', `tail-${tail}`, className, { typing: !done })}
      onClick={() => setShown(text.length)}
    >
      {speaker && <span className="speaker">{speaker}</span>}
      <span className="text">
        <span className="full" aria-hidden={!done}>
          {text}
        </span>
        <span className="typed" aria-hidden="true">
          {text.slice(0, shown)}
          {!done && <span className="caret" />}
        </span>
      </span>
      {!done && (
        <span className="sr-only" aria-live="polite">
          {text}
        </span>
      )}
    </div>
  )
}
