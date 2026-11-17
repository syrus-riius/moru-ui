import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Lock } from 'lucide-react'
import { useI18n } from '../../i18n'
import { hexToOklch, oklchToHex } from '../../theme/color-scheme'
import {
  paletteRoleKeys,
  type PaletteColors,
  type PaletteRole,
} from '../../theme/palette-recommendations'
import { MAX_WHEEL_CHROMA, type PaletteWheelChange } from '../../theme/palette-wheel'
import { readableForeground } from '../../theme/tokens'
import { Button } from '../ui/button'
import { NativeSelect } from '../ui/native-select'
import { colorRoleLabels } from './color-editor-labels'
import './palette-color-wheel.css'

type PaletteColorWheelProps = {
  colors: PaletteColors
  lockedRoles: PaletteRole[]
  onChange: (change: PaletteWheelChange) => void
  disabled?: boolean
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  interactionKey?: string
}

type WheelGesture = {
  pointerId: number
  role: PaletteRole
  source: PaletteColors
  startX: number
  startY: number
  moved: boolean
}

const WHEEL_RESOLUTION = 192
let wheelPixels: Uint8ClampedArray | undefined

/** A fixed OKLCH slice, computed once. Moving a point never repaints the wheel. */
function getWheelPixels() {
  if (wheelPixels) return wheelPixels
  const pixels = new Uint8ClampedArray(WHEEL_RESOLUTION * WHEEL_RESOLUTION * 4)
  const radius = WHEEL_RESOLUTION / 2
  for (let y = 0; y < WHEEL_RESOLUTION; y++) {
    for (let x = 0; x < WHEEL_RESOLUTION; x++) {
      const dx = (x + 0.5 - radius) / radius
      const dy = (y + 0.5 - radius) / radius
      const distance = Math.hypot(dx, dy)
      if (distance > 1) continue
      const hue = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
      const color = oklchToHex(0.76, distance * MAX_WHEEL_CHROMA, hue)
      const offset = (y * WHEEL_RESOLUTION + x) * 4
      pixels[offset] = Number.parseInt(color.slice(1, 3), 16)
      pixels[offset + 1] = Number.parseInt(color.slice(3, 5), 16)
      pixels[offset + 2] = Number.parseInt(color.slice(5, 7), 16)
      pixels[offset + 3] = Math.round(Math.min(1, (1 - distance) * radius) * 255)
    }
  }
  wheelPixels = pixels
  return pixels
}

function colorPosition(color: string) {
  const { h, c } = hexToOklch(color)
  const radius = Math.min(1, c / MAX_WHEEL_CHROMA)
  const radians = (h * Math.PI) / 180
  return {
    hue: h,
    chroma: c,
    x: 50 + Math.sin(radians) * radius * 50,
    y: 50 - Math.cos(radians) * radius * 50,
  }
}

export function PaletteColorWheel({
  colors,
  lockedRoles,
  onChange,
  disabled = false,
  onInteractionStart,
  onInteractionEnd,
  interactionKey,
}: PaletteColorWheelProps) {
  const { t } = useI18n()
  const id = useId()
  const [selectedRole, setSelectedRole] = useState<PaletteRole>('primary')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<WheelGesture | null>(null)
  const pending = useRef<PaletteWheelChange | null>(null)
  const frame = useRef<number | null>(null)
  const callbacks = useRef({ onChange, onInteractionStart, onInteractionEnd })
  const pointRefs = useRef<Partial<Record<PaletteRole, HTMLButtonElement | null>>>({})

  useEffect(() => {
    callbacks.current = { onChange, onInteractionStart, onInteractionEnd }
  }, [onChange, onInteractionStart, onInteractionEnd])

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    const image = context.createImageData(WHEEL_RESOLUTION, WHEEL_RESOLUTION)
    image.data.set(getWheelPixels())
    context.putImageData(image, 0, 0)
  }, [])

  function stopGesture(flush: boolean) {
    const active = gesture.current
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    const change = pending.current
    pending.current = null
    gesture.current = null
    const point = active && pointRefs.current[active.role]
    if (active && point?.hasPointerCapture(active.pointerId))
      point.releasePointerCapture(active.pointerId)
    if (flush && change) callbacks.current.onChange(change)
    if (active?.moved) callbacks.current.onInteractionEnd?.()
  }

  useEffect(() => () => stopGesture(false), [])

  useEffect(() => {
    stopGesture(false)
  }, [interactionKey])

  const activeLocked = gesture.current ? lockedRoles.includes(gesture.current.role) : false
  useEffect(() => {
    if (disabled || activeLocked) stopGesture(false)
  }, [disabled, activeLocked])

  function beginDrag(event: PointerEvent<HTMLButtonElement>, role: PaletteRole) {
    if (!event.isPrimary || event.button !== 0) return
    setSelectedRole(role)
    event.currentTarget.focus({ preventScroll: true })
    if (disabled || lockedRoles.includes(role)) return
    event.preventDefault()
    stopGesture(false)
    gesture.current = {
      pointerId: event.pointerId,
      role,
      source: { ...colors },
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const active = gesture.current
    const plane = planeRef.current
    if (!active || active.pointerId !== event.pointerId || !plane) return
    if (
      !active.moved &&
      Math.hypot(event.clientX - active.startX, event.clientY - active.startY) < 2
    )
      return
    if (!active.moved) {
      active.moved = true
      callbacks.current.onInteractionStart?.()
    }
    const rect = plane.getBoundingClientRect()
    const radius = Math.min(rect.width, rect.height) / 2
    if (radius <= 0) return
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    const distance = Math.hypot(x, y)
    pending.current = {
      source: active.source,
      role: active.role,
      hue:
        distance < 1
          ? hexToOklch(active.source[active.role]).h
          : ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360,
      chroma: Math.min(1, distance / radius) * MAX_WHEEL_CHROMA,
    }
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null
        const change = pending.current
        pending.current = null
        if (change) callbacks.current.onChange(change)
      })
    }
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>, flush: boolean) {
    if (gesture.current?.pointerId === event.pointerId) stopGesture(flush)
  }

  function adjustWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, role: PaletteRole) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    if (disabled || lockedRoles.includes(role)) return
    const { h, c } = hexToOklch(colors[role])
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1
    const step = event.shiftKey ? 5 : 1
    const hue =
      event.key === 'ArrowLeft' || event.key === 'ArrowRight'
        ? (h + direction * 2 * step + 360) % 360
        : h
    const chroma =
      event.key === 'ArrowUp' || event.key === 'ArrowDown'
        ? Math.max(0, Math.min(MAX_WHEEL_CHROMA, c + direction * 0.01 * step))
        : c
    callbacks.current.onInteractionStart?.()
    callbacks.current.onChange({ role, hue, chroma, source: { ...colors } })
    callbacks.current.onInteractionEnd?.()
  }

  const selectedLocked = lockedRoles.includes(selectedRole)
  const points = paletteRoleKeys.map((role) => ({ role, ...colorPosition(colors[role]) }))
  const connected = ['primary', 'accent', 'border'].map((role) =>
    points.find((point) => point.role === role)!,
  )
  return (
    <section className="palette-color-wheel" aria-label={t('색상환')}>
      <div className="palette-color-wheel__stage">
        <div ref={planeRef} className="palette-color-wheel__plane">
          <canvas
            ref={canvasRef}
            width={WHEEL_RESOLUTION}
            height={WHEEL_RESOLUTION}
            aria-hidden="true"
          />
          <svg
            className="palette-color-wheel__connections"
            viewBox="0 0 100 100"
            aria-hidden="true"
            focusable="false"
          >
            <polyline
              points={connected.map(({ x, y }) => `${x},${y}`).join(' ')}
              fill="none"
              stroke="white"
              strokeWidth="0.6"
              strokeOpacity="0.7"
            />
          </svg>
          {points.map(({ role, x, y, hue, chroma }, index) => {
            const locked = lockedRoles.includes(role)
            const roleName = t(colorRoleLabels[role])
            const description = t('{role} · {color} · 색조 {hue}° · 채도 {chroma}', {
              role: roleName,
              color: colors[role].toUpperCase(),
              hue: Math.round(hue),
              chroma: chroma.toFixed(2),
            })
            return (
              <Button
                ref={(element) => {
                  pointRefs.current[role] = element
                }}
                key={role}
                type="button"
                size="sm"
                variant="ghost"
                className="palette-color-wheel__point"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  backgroundColor: colors[role],
                  color: readableForeground(colors[role]),
                }}
                data-role={role}
                data-active={selectedRole === role || undefined}
                data-locked={locked || undefined}
                disabled={disabled || locked}
                focusableWhenDisabled
                aria-label={`${index + 1}. ${description}${locked ? ` · ${t('잠김')}` : ''}`}
                aria-roledescription={t('색상 포인트')}
                aria-describedby={`${id}-keys`}
                title={`${roleName} · ${colors[role].toUpperCase()}`}
                onFocus={() => setSelectedRole(role)}
                onPointerDown={(event) => beginDrag(event, role)}
                onPointerMove={moveDrag}
                onPointerUp={(event) => endDrag(event, true)}
                onPointerCancel={(event) => endDrag(event, false)}
                onLostPointerCapture={(event) => endDrag(event, false)}
                onKeyDown={(event) => adjustWithKeyboard(event, role)}
              >
                <span aria-hidden="true">{index + 1}</span>
                {locked && (
                  <Lock className="palette-color-wheel__lock" size={11} aria-hidden="true" />
                )}
              </Button>
            )
          })}
        </div>
      </div>
      <div className="palette-color-wheel__selected">
        <label htmlFor={`${id}-role`}>{t('편집할 색상')}</label>
        <NativeSelect
          id={`${id}-role`}
          size="sm"
          value={selectedRole}
          items={paletteRoleKeys.map((role, index) => ({
            value: role,
            label: `${index + 1}. ${t(colorRoleLabels[role])}${lockedRoles.includes(role) ? ` · ${t('잠김')}` : ''}`,
          }))}
          onValueChange={(value) => {
            if (!paletteRoleKeys.includes(value as PaletteRole)) return
            const role = value as PaletteRole
            setSelectedRole(role)
            pointRefs.current[role]?.focus({ preventScroll: true })
          }}
        />
        <code>{colors[selectedRole].toUpperCase()}</code>
      </div>
      <p className="palette-color-wheel__note">
        {t(
          selectedLocked
            ? '선택한 색은 잠겨 있습니다. 잠금을 해제하면 조절할 수 있어요.'
            : '포인트를 드래그해 색조와 채도를 조절하세요. 잠근 색은 움직이지 않습니다.',
        )}
      </p>
      <p id={`${id}-keys`} className="palette-color-wheel__note">
        {t('방향키 좌우: 색조 · 위아래: 채도 · Shift: 크게 조절')}
        <span>{t('겹친 포인트는 색상 목록에서 선택하세요.')}</span>
      </p>
    </section>
  )
}
