"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Trophy, Skull, Ban, X } from "lucide-react"
import type { Champion } from "@/lib/ddragon"
import { championIcon } from "@/lib/ddragon"
import type { Category } from "@/components/champion-board"

type Props = {
  champion: Champion | null
  version: string
  onClose: () => void
  onChoose: (category: Category) => void
}

export function ChampionResultModal({ champion, version, onClose, onChoose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (champion) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [champion, onClose])

  if (!champion) return null

  const options: { category: Category; label: string; icon: typeof Trophy; classes: string }[] = [
    {
      category: "wins",
      label: "Mover para Vitórias",
      icon: Trophy,
      classes: "border-win/50 bg-win/10 text-win hover:bg-win/20",
    },
    {
      category: "losses",
      label: "Mover para Derrotas",
      icon: Skull,
      classes: "border-loss/50 bg-loss/10 text-loss hover:bg-loss/20",
    },
    {
      category: "bans",
      label: "Banir",
      icon: Ban,
      classes: "border-ban/60 bg-ban/15 text-ban-foreground hover:bg-ban/30",
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Resultado: ${champion.name}`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border-2 border-primary/60 bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-primary shadow-lg">
            <Image
              src={championIcon(version, champion.id) || "/placeholder.svg"}
              alt={champion.name}
              fill
              sizes="96px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary">{champion.name}</h2>
            <p className="text-sm capitalize text-muted-foreground">{champion.title}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {options.map(({ category, label, icon: Icon, classes }) => (
            <button
              key={category}
              type="button"
              onClick={() => onChoose(category)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left font-medium transition-colors ${classes}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}