"use client"

import Image from "next/image"
import { Trophy, Skull, Ban, RotateCcw } from "lucide-react"
import type { Champion } from "@/lib/ddragon"
import { championIcon } from "@/lib/ddragon"

export type Category = "wins" | "losses" | "bans"

type ColumnConfig = {
  category: Category
  title: string
  icon: typeof Trophy
  accent: string // classe de cor de texto/borda
}

const COLUMNS: ColumnConfig[] = [
  { category: "wins", title: "Vitórias", icon: Trophy, accent: "text-win border-win/40" },
  { category: "losses", title: "Derrotas", icon: Skull, accent: "text-loss border-loss/40" },
  { category: "bans", title: "Banidos", icon: Ban, accent: "text-ban-foreground border-ban/50" },
]

type Props = {
  version: string
  board: Record<Category, Champion[]>
  onReturn: (champion: Champion) => void
}

export function ChampionBoard({ version, board, onReturn }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {COLUMNS.map(({ category, title, icon: Icon, accent }) => {
        const list = board[category]
        return (
          <section
            key={category}
            className={`flex flex-col rounded-xl border bg-card/60 p-4 ${accent.split(" ")[1]}`}
          >
            <header className="mb-3 flex items-center justify-between">
              <div className={`flex items-center gap-2 font-serif font-bold ${accent.split(" ")[0]}`}>
                <Icon className="h-5 w-5" />
                <h3>{title}</h3>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {list.length}
              </span>
            </header>

            {list.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Nenhum campeão aqui ainda.</p>
            ) : (
              <ul className="grid grid-cols-4 gap-2">
                {list.map((champ) => (
                  <li key={champ.id}>
                    <button
                      type="button"
                      onClick={() => onReturn(champ)}
                      title={`${champ.name} — clique para devolver à roleta`}
                      className="group relative block aspect-square w-full overflow-hidden rounded-md border border-border transition-transform hover:scale-105"
                    >
                      <Image
                        src={championIcon(version, champ.id) || "/placeholder.svg"}
                        alt={champ.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
                        <RotateCcw className="h-4 w-4 text-primary" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}