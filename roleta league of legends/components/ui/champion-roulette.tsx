"use client"

import { useRef, useState } from "react"
import type { Champion } from "@/lib/ddragon"
import { championIcon } from "@/lib/ddragon"
import { Button } from "@/components/ui/button"

const SIZE = 600
const CENTER = SIZE / 2
const RADIUS = 288
const ICON_RADIUS = 200

// Converte um ângulo (graus, sentido horário a partir do topo) em coordenadas SVG.
function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.sin(rad),
    y: CENTER - radius * Math.cos(rad),
  }
}

function wedgePath(startDeg: number, endDeg: number) {
  const start = pointOnCircle(startDeg, RADIUS)
  const end = pointOnCircle(endDeg, RADIUS)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

const WEDGE_COLORS = ["oklch(0.28 0.045 250)", "oklch(0.24 0.04 255)"]

type Props = {
  version: string
  champions: Champion[]
  onResult: (champion: Champion) => void
  disabled?: boolean
}

export function ChampionRoulette({ version, champions, onResult, disabled }: Props) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const groupRef = useRef<SVGGElement>(null)

  const n = champions.length
  const slice = n > 0 ? 360 / n : 360

  function spin() {
    if (spinning || n < 1 || disabled) return
    setSpinning(true)

    const targetIndex = Math.floor(Math.random() * n)
    const jitter = (Math.random() - 0.5) * 0.7 // dentro da fatia
    const pointerAngle = (targetIndex + 0.5 + jitter) * slice
    const finalMod = (360 - pointerAngle + 360 * 4) % 360
    const extraSpins = 5
    const currentMod = ((rotation % 360) + 360) % 360
    const newRotation = rotation + extraSpins * 360 + ((finalMod - currentMod + 360) % 360)

    setRotation(newRotation)

    window.setTimeout(() => {
      setSpinning(false)
      onResult(champions[targetIndex])
    }, 4200)
  }

  const iconSize = Math.max(20, Math.min(56, slice * 3.1 + 8))

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative aspect-square w-full max-w-[520px]">
        {/* Ponteiro */}
        <div className="absolute left-1/2 top-1 z-20 -translate-x-1/2">
          <div
            className="h-0 w-0 drop-shadow-lg"
            style={{
              borderLeft: "16px solid transparent",
              borderRight: "16px solid transparent",
              borderTop: "26px solid var(--gold)",
            }}
            aria-hidden="true"
          />
        </div>

        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-full w-full"
          role="img"
          aria-label="Roleta de campeões do League of Legends"
        >
          {/* Aro externo */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 6} fill="none" stroke="var(--gold)" strokeWidth={6} />

          <g
            ref={groupRef}
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "center",
              transition: spinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            }}
          >
            {n === 0 && <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="oklch(0.24 0.04 255)" />}
            {champions.map((champ, i) => {
              const startDeg = i * slice
              const endDeg = (i + 1) * slice
              const centerDeg = startDeg + slice / 2
              const iconPos = pointOnCircle(centerDeg, ICON_RADIUS)
              return (
                <g key={champ.id}>
                  <path
                    d={wedgePath(startDeg, endDeg)}
                    fill={WEDGE_COLORS[i % 2]}
                    stroke="var(--gold)"
                    strokeWidth={n > 60 ? 0.4 : 1}
                    strokeOpacity={0.35}
                  />
                  {n === 1 ? (
                    <image
                      href={championIcon(version, champ.id)}
                      x={CENTER - 48}
                      y={CENTER - 48}
                      width={96}
                      height={96}
                      crossOrigin="anonymous"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  ) : (
                    <image
                      href={championIcon(version, champ.id)}
                      x={iconPos.x - iconSize / 2}
                      y={iconPos.y - iconSize / 2}
                      width={iconSize}
                      height={iconSize}
                      crossOrigin="anonymous"
                      preserveAspectRatio="xMidYMid slice"
                      transform={`rotate(${centerDeg} ${iconPos.x} ${iconPos.y})`}
                    />
                  )}
                </g>
              )
            })}
          </g>

          {/* Cubo central */}
          <circle cx={CENTER} cy={CENTER} r={46} fill="var(--card)" stroke="var(--gold)" strokeWidth={4} />
        </svg>

        {/* Botão central GIRAR */}
        <button
          type="button"
          onClick={spin}
          disabled={spinning || n < 1 || disabled}
          className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-primary bg-card font-serif text-sm font-bold uppercase tracking-widest text-primary transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Girar a roleta"
        >
          {spinning ? "..." : "Girar"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={spin}
          disabled={spinning || n < 1 || disabled}
          size="lg"
          className="font-serif text-base font-bold uppercase tracking-wide"
        >
          {spinning ? "Girando..." : "Girar Roleta"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {n} {n === 1 ? "campeão" : "campeões"} na roleta
        </span>
      </div>
    </div>
  )
}