import './index.scss'
import classNames from 'classnames'
import { ReactNode, useId, useMemo } from 'react'
import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'
import { darken, EYE_COLORS, generateWitness, lighten, WitnessTraits } from '@/app/(protected)/(game)/utils/witnesses'

/** Color of every outline (cartoon style). */
const INK = '#1a1530'
const STROKE = 3.5

export type WitnessExpression = 'neutral' | 'smile' | 'talking' | 'surprised'

interface WitnessAvatarProps {
  seed: number
  role: WitnessRole
  expression?: WitnessExpression
  /** A suspect: always with its eyes open, so their color can be seen. */
  suspect?: boolean
  /** Width in pixels (the height follows: the drawing is 200×220). */
  size?: number
  className?: string
}

/* ------------------------------------------------------------------ face -- */

/** Outline of the head of each face shape (drawn around x 54-146, y 40-146). */
const HEAD_PATHS: Record<WitnessTraits['faceShape'], string> = {
  round: 'M54 92 C54 58 74 44 100 44 C126 44 146 58 146 92 C146 122 126 140 100 140 C74 140 54 122 54 92 Z',
  oval: 'M58 92 C58 56 76 40 100 40 C124 40 142 56 142 92 C142 124 124 144 100 144 C76 144 58 124 58 92 Z',
  square: 'M57 72 C57 50 74 42 100 42 C126 42 143 50 143 72 L143 110 C143 132 126 142 100 142 C74 142 57 132 57 110 Z',
  long: 'M56 88 C56 54 76 42 100 42 C124 42 144 54 144 88 C144 118 124 146 100 146 C76 146 56 118 56 88 Z'
}

function Ears({ skin }: { skin: string }) {
  return (
    <g>
      <ellipse cx={55} cy={98} rx={10} ry={12} fill={skin} />
      <ellipse cx={145} cy={98} rx={10} ry={12} fill={skin} />
      <path d="M53 93 Q50 98 54 104" fill="none" strokeWidth={2.5} />
      <path d="M147 93 Q150 98 146 104" fill="none" strokeWidth={2.5} />
    </g>
  )
}

function Eyes({ eyes, color }: { eyes: WitnessTraits['eyes']; color: string }) {
  const positions = [82, 118]

  switch (eyes) {
    case 'dot':
      return (
        <g>
          {positions.map((x) => (
            <g key={x}>
              <circle cx={x} cy={93} r={6.4} fill={color} strokeWidth={2.2} />
              <circle cx={x} cy={93} r={2.8} fill={INK} stroke="none" />
            </g>
          ))}
        </g>
      )
    case 'happy':
      return (
        <g fill="none" strokeWidth={4}>
          {positions.map((x) => (
            <path key={x} d={`M${x - 8} 96 Q${x} 86 ${x + 8} 96`} />
          ))}
        </g>
      )
    case 'sleepy':
      return (
        <g>
          {positions.map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={94} rx={8} ry={7} fill="#fff" strokeWidth={2.5} />
              <circle cx={x} cy={96} r={4.6} fill={color} stroke="none" />
              <circle cx={x} cy={96} r={2.1} fill={INK} stroke="none" />
              <path d={`M${x - 9} 92 Q${x} 86 ${x + 9} 92`} fill="none" strokeWidth={3} />
            </g>
          ))}
        </g>
      )
    default:
      return (
        <g>
          {positions.map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={93} rx={8} ry={9.5} fill="#fff" strokeWidth={2.5} />
              <circle cx={x + 1} cy={94} r={5.6} fill={color} stroke="none" />
              <circle cx={x + 1} cy={94} r={2.6} fill={INK} stroke="none" />
              <circle cx={x + 2.8} cy={91.6} r={1.6} fill="#fff" stroke="none" />
            </g>
          ))}
        </g>
      )
  }
}

function Brows({ brows, color, raised }: { brows: WitnessTraits['brows']; color: string; raised: boolean }) {
  const y = raised ? 74 : 78

  if (brows === 'thick') {
    return (
      <g fill={color} strokeWidth={2}>
        <rect x={71} y={y - 3} width={20} height={7} rx={3.5} transform={`rotate(-6 81 ${y})`} />
        <rect x={109} y={y - 3} width={20} height={7} rx={3.5} transform={`rotate(6 119 ${y})`} />
      </g>
    )
  }

  const curve = brows === 'arched' ? 8 : 4

  return (
    <g fill="none" stroke={color} strokeWidth={brows === 'arched' ? 3.5 : 3}>
      <path d={`M72 ${y + 2} Q81 ${y - curve} 91 ${y + 1}`} />
      <path d={`M109 ${y + 1} Q119 ${y - curve} 128 ${y + 2}`} />
    </g>
  )
}

function Nose({ nose, skin }: { nose: WitnessTraits['nose']; skin: string }) {
  switch (nose) {
    case 'line':
      return <path d="M101 98 Q97 110 102 112" fill="none" strokeWidth={2.8} />
    case 'round':
      return <path d="M93 110 Q100 100 107 110 Q100 116 93 110 Z" fill={darken(skin, 0.12)} strokeWidth={2.5} />
    default:
      return <ellipse cx={100} cy={109} rx={5} ry={3.6} fill={darken(skin, 0.18)} stroke="none" />
  }
}

function Mouth({ expression }: { expression: WitnessExpression }) {
  switch (expression) {
    case 'smile':
      return (
        <g>
          <path d="M86 121 Q100 140 114 121 Z" fill="#5a1a2b" strokeWidth={3} />
          <path d="M94 130 Q100 126 106 130 Q100 134 94 130 Z" fill="#ff7a8a" stroke="none" />
        </g>
      )
    case 'surprised':
      return <ellipse cx={100} cy={126} rx={6} ry={7} fill="#5a1a2b" strokeWidth={3} />
    case 'talking':
      return (
        <g className="witness-mouth-talking">
          <g className="open">
            <ellipse cx={100} cy={125} rx={9} ry={8} fill="#5a1a2b" strokeWidth={3} />
            <ellipse cx={100} cy={129} rx={5} ry={3} fill="#ff7a8a" stroke="none" />
          </g>
          <path className="closed" d="M90 124 Q100 131 110 124" fill="none" strokeWidth={3.5} />
        </g>
      )
    default:
      return <path d="M90 124 Q100 131 110 124" fill="none" strokeWidth={3.5} />
  }
}

function FacialHairLayer({ facialHair, color }: { facialHair: WitnessTraits['facialHair']; color: string }) {
  switch (facialHair) {
    case 'mustache':
      return (
        <path
          d="M84 118 C88 109 97 111 100 115 C103 111 112 109 116 118 C110 121 104 119 100 118 C96 119 90 121 84 118 Z"
          fill={color}
          strokeWidth={2.5}
        />
      )
    case 'beard':
      return (
        <path
          d="M57 96 C58 128 76 152 100 152 C124 152 142 128 143 96 C138 114 130 128 118 132 C112 124 88 124 82 132 C70 128 62 114 57 96 Z"
          fill={color}
          strokeWidth={3}
        />
      )
    case 'goatee':
      return <path d="M89 134 C91 148 109 148 111 134 C105 138 95 138 89 134 Z" fill={color} strokeWidth={2.5} />
    case 'stubble':
      return (
        <path
          d="M60 104 C64 130 80 144 100 144 C120 144 136 130 140 104 C134 120 124 132 100 133 C76 132 66 120 60 104 Z"
          fill={color}
          opacity={0.28}
          stroke="none"
        />
      )
    default:
      return null
  }
}

function GlassesLayer({ glasses }: { glasses: WitnessTraits['glasses'] }) {
  switch (glasses) {
    case 'round':
      return (
        <g fill="rgba(255,255,255,0.15)" strokeWidth={3}>
          <circle cx={82} cy={93} r={13} />
          <circle cx={118} cy={93} r={13} />
          <path d="M95 92 Q100 88 105 92 M69 91 L57 88 M131 91 L143 88" fill="none" />
        </g>
      )
    case 'square':
      return (
        <g fill="rgba(255,255,255,0.15)" strokeWidth={3}>
          <rect x={68} y={83} width={28} height={20} rx={5} />
          <rect x={104} y={83} width={28} height={20} rx={5} />
          <path d="M96 91 L104 91 M68 90 L57 88 M132 90 L143 88" fill="none" />
        </g>
      )
    case 'sun':
      return (
        <g strokeWidth={3}>
          <path d="M66 86 L97 86 L95 98 Q90 106 80 105 Q68 103 66 92 Z" fill="#20202c" />
          <path d="M103 86 L134 86 L134 92 Q132 103 120 105 Q110 106 105 98 Z" fill="#20202c" />
          <path d="M97 88 L103 88 M66 88 L57 86 M134 88 L143 86" fill="none" />
          <path d="M72 90 L80 90 M109 90 L117 90" stroke="#fff" strokeWidth={2} opacity={0.6} />
        </g>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------------ hair -- */

/** Hair drawn behind the head (long hair, buns, ponytails, curly volume). */
function HairBack({ style, color }: { style: WitnessTraits['hairStyle']; color: string }) {
  switch (style) {
    case 'long':
      return (
        <path
          d="M50 90 C46 40 76 28 100 28 C124 28 154 40 150 90 L156 178 C140 188 122 184 114 176 L86 176 C78 184 60 188 44 178 Z"
          fill={color}
        />
      )
    case 'bob':
      return (
        <path
          d="M48 96 C44 42 76 30 100 30 C124 30 156 42 152 96 L154 138 C142 146 130 144 124 136 L76 136 C70 144 58 146 46 138 Z"
          fill={color}
        />
      )
    case 'bun':
      return <circle cx={100} cy={30} r={18} fill={color} />
    case 'ponytail':
      return <path d="M136 52 C166 56 172 100 160 142 C156 150 148 148 148 140 C154 110 152 80 132 66 Z" fill={color} />
    case 'curly':
      return <ellipse cx={100} cy={84} rx={60} ry={56} fill={color} />
    default:
      return null
  }
}

const CURLY_TOP = Array.from({ length: 9 }, (_, index) => {
  const angle = Math.PI + (index / 8) * Math.PI
  const x = 100 + Math.cos(angle) * 50
  const y = 82 + Math.sin(angle) * 46

  return { x: Math.round(x), y: Math.round(y) }
})

/** Hair drawn over the head (fringe, top). */
function HairFront({ style, color }: { style: WitnessTraits['hairStyle']; color: string }) {
  switch (style) {
    case 'short':
      return (
        <path
          d="M52 98 C46 52 72 34 100 34 C130 34 156 52 148 98 C144 84 140 74 130 68 C116 76 86 78 70 68 C60 74 56 84 52 98 Z"
          fill={color}
        />
      )
    case 'sidePart':
      return (
        <path
          d="M52 100 C44 50 72 32 102 32 C134 32 156 54 148 100 C146 86 142 74 132 64 C118 70 96 66 84 54 C80 68 66 78 52 100 Z"
          fill={color}
        />
      )
    case 'spiky':
      return (
        <path
          d="M52 96 L48 60 L62 66 L62 40 L78 52 L84 28 L98 46 L108 26 L116 46 L132 32 L134 54 L150 48 L146 70 L150 96 C144 82 138 72 128 68 C114 74 86 74 72 68 C62 74 56 84 52 96 Z"
          fill={color}
        />
      )
    case 'curly':
      return (
        <g fill={color}>
          {CURLY_TOP.map(({ x, y }) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={15} />
          ))}
          <path d="M60 80 C66 52 134 52 140 80 C124 68 76 68 60 80 Z" stroke="none" />
        </g>
      )
    case 'long':
      return (
        <path
          d="M52 102 C46 50 72 32 100 34 C128 32 154 50 148 102 C142 80 128 60 100 52 C72 60 58 80 52 102 Z"
          fill={color}
        />
      )
    case 'bob':
      return (
        <path
          d="M52 98 C48 48 74 34 100 34 C126 34 152 48 148 98 C148 84 146 76 144 70 L56 70 C54 76 52 84 52 98 Z"
          fill={color}
        />
      )
    case 'bun':
    case 'ponytail':
      return (
        <path
          d="M54 94 C48 52 74 36 100 36 C126 36 152 52 146 94 C142 78 132 66 116 62 C104 60 92 62 84 66 C70 72 60 80 54 94 Z"
          fill={color}
        />
      )
    case 'mohawk':
      return (
        <g>
          <path
            d="M56 84 C56 60 76 48 100 48 C124 48 144 60 144 84 C130 70 70 70 56 84 Z"
            fill={color}
            opacity={0.35}
            stroke="none"
          />
          <path d="M88 74 C84 44 92 20 100 14 C108 20 116 44 112 74 Z" fill={color} />
        </g>
      )
    case 'buzz':
      return (
        <path
          d="M55 90 C51 54 74 40 100 40 C126 40 149 54 145 90 C140 70 124 60 100 60 C76 60 60 70 55 90 Z"
          fill={color}
          opacity={0.75}
          strokeWidth={2.5}
        />
      )
    case 'bald':
      return (
        <g fill={color} strokeWidth={2.5}>
          <path d="M55 96 C53 82 56 72 62 68 C62 78 62 88 60 98 Z" />
          <path d="M145 96 C147 82 144 72 138 68 C138 78 138 88 140 98 Z" />
        </g>
      )
    default:
      return null
  }
}

function HeadwearLayer({ headwear, accent }: { headwear: WitnessTraits['headwear']; accent: string }) {
  switch (headwear) {
    case 'policeCap':
      return (
        <g transform="translate(0 -8)">
          <path d="M46 62 C44 34 72 20 100 20 C128 20 156 34 154 62 Z" fill="#2b3a74" />
          <rect x={52} y={56} width={96} height={13} rx={3} fill="#151b38" />
          <path d="M54 68 Q100 80 146 68 L150 74 Q100 94 50 74 Z" fill="#111" />
          <path
            d="M100 32 L103.5 39 L111 40 L105.5 45 L107 52.5 L100 49 L93 52.5 L94.5 45 L89 40 L96.5 39 Z"
            fill="#ffc233"
            strokeWidth={2}
          />
        </g>
      )
    case 'flatCap':
      return (
        <g>
          <path
            d="M50 72 C46 44 72 32 102 32 C136 32 158 46 154 66 C162 70 160 80 148 80 L58 80 C48 80 46 76 50 72 Z"
            fill={accent}
          />
          <path d="M60 70 C90 62 130 62 150 68" fill="none" strokeWidth={2.5} opacity={0.6} />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M52 62 C50 30 74 20 100 20 C126 20 150 30 148 62 Z" fill={accent} />
          <path d="M100 20 L100 62" fill="none" strokeWidth={2} opacity={0.5} />
          <circle cx={100} cy={21} r={4} fill={accent} strokeWidth={2.5} />
          <path
            d="M44 58 C70 68 130 68 156 58 C160 66 152 72 140 74 C114 80 86 80 60 74 C48 72 40 66 44 58 Z"
            fill={darken(accent, 0.2)}
          />
        </g>
      )
    case 'sunHat':
      return (
        <g>
          <ellipse cx={100} cy={62} rx={80} ry={16} fill="#f2d59b" />
          <path d="M62 62 C60 30 80 20 100 20 C120 20 140 30 138 62 Z" fill="#f2d59b" />
          <path d="M63 52 C86 58 114 58 137 52 L138 62 C114 68 86 68 62 62 Z" fill={accent} strokeWidth={2.5} />
        </g>
      )
    case 'beanie':
      return (
        <g>
          <circle cx={100} cy={22} r={10} fill={lighten(accent, 0.35)} />
          <path d="M52 76 C50 34 76 24 100 24 C124 24 150 34 148 76 Z" fill={accent} />
          <rect x={48} y={64} width={104} height={16} rx={8} fill={darken(accent, 0.18)} />
        </g>
      )
    default:
      return null
  }
}

/* --------------------------------------------------------------- clothes -- */

/** Outline of the shoulders and chest. */
const TORSO = 'M12 222 C12 186 42 166 84 161 Q100 172 116 161 C158 166 188 186 188 222 Z'

function Clothes({ role, traits, clipId }: { role: WitnessRole; traits: WitnessTraits; clipId: string }) {
  const { outfitColor, accentColor } = traits
  let details: ReactNode = null

  switch (role) {
    case 'waiter':
      details = (
        <g>
          <path d="M12 222 C12 186 42 166 80 162 L97 222 Z" fill="#26222e" />
          <path d="M188 222 C188 186 158 166 120 162 L103 222 Z" fill="#26222e" />
          <circle cx={92} cy={200} r={2.5} fill="#ddd" strokeWidth={1.5} />
          <circle cx={108} cy={200} r={2.5} fill="#ddd" strokeWidth={1.5} />
          <path d="M100 173 L84 164 L84 182 Z M100 173 L116 164 L116 182 Z" fill={accentColor} strokeWidth={2.5} />
          <circle cx={100} cy={173} r={4.5} fill={darken(accentColor, 0.2)} strokeWidth={2.5} />
        </g>
      )
      break
    case 'guide':
      details = (
        <g>
          <path
            d="M84 162 L100 178 L90 188 L76 168 Z M116 162 L100 178 L110 188 L124 168 Z"
            fill={lighten(outfitColor, 0.3)}
            strokeWidth={2.5}
          />
          <path d="M88 170 L95 202 M112 170 L105 202" fill="none" stroke={accentColor} strokeWidth={4} />
          <rect x={87} y={200} width={26} height={18} rx={3} fill="#fff" strokeWidth={2.5} />
          <path d="M92 207 L108 207 M92 212 L103 212" fill="none" strokeWidth={2} />
        </g>
      )
      break
    case 'police':
      details = (
        <g>
          <path
            d="M84 162 L100 178 L90 186 L76 168 Z M116 162 L100 178 L110 186 L124 168 Z"
            fill="#3b4c8f"
            strokeWidth={2.5}
          />
          <path d="M96 178 L104 178 L106 222 L94 222 Z" fill="#151b38" strokeWidth={2.5} />
          <rect x={48} y={192} width={30} height={18} rx={3} fill="#33447f" strokeWidth={2.5} />
          <rect x={122} y={192} width={30} height={18} rx={3} fill="#33447f" strokeWidth={2.5} />
          <path
            d="M136 176 L139 182 L146 183 L141 188 L142 195 L136 191.5 L130 195 L131 188 L126 183 L133 182 Z"
            fill="#ffc233"
            strokeWidth={2}
          />
        </g>
      )
      break
    case 'vendor':
      details = (
        <g>
          <path d="M84 164 Q100 180 116 164" fill="none" strokeWidth={3} />
          <path d="M70 186 L86 166 M130 186 L114 166" fill="none" stroke={accentColor} strokeWidth={4} />
          <path d="M60 224 L66 186 Q100 180 134 186 L140 224 Z" fill={accentColor} />
          <path
            d="M80 186 L78 222 M100 184 L100 222 M120 186 L122 222"
            fill="none"
            stroke="#fff"
            strokeWidth={3}
            opacity={0.45}
          />
          <rect x={86} y={198} width={28} height={14} rx={3} fill={darken(accentColor, 0.15)} strokeWidth={2.5} />
        </g>
      )
      break
    case 'taxiDriver':
      details = (
        <g>
          <path d="M12 222 C12 186 42 166 80 162 L94 222 Z" fill="#4a4f5c" />
          <path d="M188 222 C188 186 158 166 120 162 L106 222 Z" fill="#4a4f5c" />
          <g clipPath={`url(#${clipId})`} stroke="none">
            {Array.from({ length: 22 }, (_, index) => (
              <rect
                key={index}
                x={12 + index * 8}
                y={index % 2 === 0 ? 196 : 204}
                width={8}
                height={8}
                fill="#1c1c1c"
              />
            ))}
            {Array.from({ length: 22 }, (_, index) => (
              <rect
                key={`y${index}`}
                x={12 + index * 8}
                y={index % 2 === 0 ? 204 : 196}
                width={8}
                height={8}
                fill="#ffd400"
              />
            ))}
          </g>
          <path d="M12 196 L188 196 M12 212 L188 212" fill="none" strokeWidth={2} clipPath={`url(#${clipId})`} />
        </g>
      )
      break
    case 'tourist':
      details = (
        <g>
          <g clipPath={`url(#${clipId})`} stroke="none">
            {[
              [36, 196],
              [62, 182],
              [58, 212],
              [146, 186],
              [140, 214],
              [168, 204],
              [32, 216],
              [122, 200]
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r={7} fill={accentColor} />
                <circle cx={x} cy={y} r={2.8} fill="#fff" />
              </g>
            ))}
          </g>
          <path
            d="M84 162 L100 178 L90 186 L76 168 Z M116 162 L100 178 L110 186 L124 168 Z"
            fill={lighten(outfitColor, 0.35)}
            strokeWidth={2.5}
          />
          <path d="M74 168 L88 196 M126 168 L112 196" fill="none" strokeWidth={3} />
          <rect x={82} y={192} width={36} height={24} rx={4} fill="#2a2a35" />
          <circle cx={100} cy={204} r={8} fill="#8a93a8" strokeWidth={3} />
          <circle cx={100} cy={204} r={3} fill="#1a1530" stroke="none" />
          <rect x={107} y={195} width={7} height={4} rx={1} fill="#ffc233" strokeWidth={1.5} />
        </g>
      )
      break
    case 'backpacker':
      details = (
        <g>
          <path d="M84 164 Q100 180 116 164" fill="none" strokeWidth={3} />
          <path d="M50 172 L60 224 L74 224 L66 168 Z M150 172 L140 224 L126 224 L134 168 Z" fill={accentColor} />
          <rect x={58} y={198} width={14} height={8} rx={2} fill="#2a2a35" strokeWidth={2} />
          <rect x={128} y={198} width={14} height={8} rx={2} fill="#2a2a35" strokeWidth={2} />
        </g>
      )
      break
  }

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={TORSO} />
        </clipPath>
      </defs>
      <path d={TORSO} fill={outfitColor} />
      {details}
      <path d={TORSO} fill="none" />
    </g>
  )
}

/* ---------------------------------------------------------------- avatar -- */

/**
 * A witness of the detective mode: a cartoon bust drawn as an SVG by layers
 * from its seed (see utils/witnesses.ts). With the "talking" expression its
 * mouth moves (see index.scss).
 */
export default function WitnessAvatar({
  seed,
  role,
  expression = 'neutral',
  suspect = false,
  size = 120,
  className
}: WitnessAvatarProps) {
  const traits = useMemo(() => generateWitness(seed, role, { openEyes: suspect }), [seed, role, suspect])
  const clipId = `witness-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const { skin, hairColor, hairStyle, headwear } = traits
  const browColor = darken(hairColor === '#e9e7ee' || hairColor === '#9a9aa5' ? '#6b6b75' : hairColor, 0.15)
  const raised = expression === 'talking' || expression === 'surprised'

  return (
    <svg
      className={classNames('witness-avatar', className)}
      viewBox="0 0 200 222"
      width={size}
      height={(size * 222) / 200}
      role="img"
      aria-label={traits.name}
    >
      <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round">
        <HairBack style={hairStyle} color={hairColor} />
        <Clothes role={role} traits={traits} clipId={clipId} />
        <path d="M84 126 L84 166 Q100 176 116 166 L116 126 Z" fill={skin} />
        <path d="M85 132 Q100 146 115 132 L115 142 Q100 152 85 142 Z" fill={darken(skin, 0.18)} stroke="none" />
        <Ears skin={skin} />
        {traits.earrings && (
          <g fill="#ffc233" strokeWidth={2}>
            <circle cx={54} cy={113} r={4} />
            <circle cx={146} cy={113} r={4} />
          </g>
        )}
        <path d={HEAD_PATHS[traits.faceShape]} fill={skin} />
        <g stroke="none" fill="#ff7a8a" opacity={0.35}>
          <ellipse cx={72} cy={112} rx={9} ry={5.5} />
          <ellipse cx={128} cy={112} rx={9} ry={5.5} />
        </g>
        {traits.freckles && (
          <g fill={darken(skin, 0.3)} stroke="none">
            {[
              [70, 104],
              [76, 108],
              [68, 110],
              [130, 104],
              [124, 108],
              [132, 110]
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} />
            ))}
          </g>
        )}
        <FacialHairLayer facialHair={traits.facialHair} color={hairColor} />
        <Eyes eyes={traits.eyes} color={EYE_COLORS[traits.eyeColor]} />
        <Brows brows={traits.brows} color={browColor} raised={raised} />
        <Nose nose={traits.nose} skin={skin} />
        <Mouth expression={expression} />
        {/* Under a hat a mohawk can't stand up: it shows as a buzz cut. */}
        <HairFront style={headwear !== 'none' && hairStyle === 'mohawk' ? 'buzz' : hairStyle} color={hairColor} />
        <GlassesLayer glasses={traits.glasses} />
        <HeadwearLayer headwear={headwear} accent={traits.accentColor} />
      </g>
    </svg>
  )
}
