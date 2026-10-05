"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { useChampions } from "@/hooks/use-champions"
import type { Champion } from "@/lib/ddragon"
import { ChampionRoulette } from "@/components/champion-roulette"
import { ChampionBoard, type Category } from "@/components/champion-board"
import { ChampionResultModal } from "@/components/champion-result-modal"
import { RiotHistory } from "@/components/riot-history"

const ROLES: { value: string; label: string; tag: string }[] = [
  { value: "all", label: "Todos", tag: "" },
  { value: "Fighter", label: "Lutadores", tag: "Fighter" },
  { value: "Tank", label: "Tanques", tag: "Tank" },
  { value: "Mage", label: "Magos", tag: "Mage" },
  { value: "Assassin", label: "Assassinos", tag: "Assassin" },
  { value: "Marksman", label: "Atiradores", tag: "Marksman" },
  { value: "Support", label: "Suportes", tag: "Support" },
]

export function RouletteApp() {
  const { version, champions, isLoading, error } = useChampions()

  const [wins, setWins] = useState<string[]>([])
  const [losses, setLosses] = useState<string[]>([])
  const [bans, setBans] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [result, setResult] = useState<Champion | null>(null)

  const byId = useMemo(() => {
    const map = new Map<string, Champion>()
    for (const c of champions) map.set(c.id, c)
    return map
  }, [champions])

  const placedSet = useMemo(() => new Set([...wins, ...losses, ...bans]), [wins, losses, bans])

  const rouletteChampions = useMemo(() => {
    const roleTag = ROLES.find((r) => r.value === role)?.tag ?? ""
    const q = search.trim().toLowerCase()
    return champions.filter((c) => {
      if (placedSet.has(c.id)) return false
      if (roleTag && !c.tags.includes(roleTag)) return false
      if (q && !c.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [champions, placedSet, role, search])

  const board: Record<Category, Champion[]> = useMemo(
    () => ({
      wins: wins.map((id) => byId.get(id)).filter(Boolean) as Champion[],
      losses: losses.map((id) => byId.get(id)).filter(Boolean) as Champion[],
      bans: bans.map((id) => byId.get(id)).filter(Boolean) as Champion[],
    }),
    [wins, losses, bans, byId],
  )

  const setters: Record<Category, React.Dispatch<React.SetStateAction<string[]>>> = {
    wins: setWins,
    losses: setLosses,
    bans: setBans,
  }

  function handleChoose(category: Category) {
    if (!result) return
    setters[category]((prev) => [...prev, result.id])
    setResult(null)
  }

  function handleReturn(champion: Champion) {
    setWins((p) => p.filter((id) => id !== champion.id))
    setLosses((p) => p.filter((id) => id !== champion.id))
    setBans((p) => p.filter((id) => id !== champion.id))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Carregando campeões do Data Dragon...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-loss">Não foi possível carregar os campeões. Tente novamente mais tarde.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Roleta + filtros */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar campeões na roleta..."
              aria-label="Filtrar campeões na roleta"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/50 focus:ring-2"
            />
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    role === r.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <ChampionRoulette version={version} champions={rouletteChampions} onResult={setResult} />
        </div>

        {/* Painéis de organização */}
        <div className="flex flex-col gap-6">
          <ChampionBoard version={version} board={board} onReturn={handleReturn} />
          <RiotHistory version={version} champions={champions} />
        </div>
      </div>

      <ChampionResultModal
        champion={result}
        version={version}
        onClose={() => setResult(null)}
        onChoose={handleChoose}
      />
    </div>
  )
}