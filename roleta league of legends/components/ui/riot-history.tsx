"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import type { Champion } from "@/lib/ddragon"
import { championIcon } from "@/lib/ddragon"
import { Button } from "@/components/ui/button"

type Match = {
  champion: Champion
  win: boolean
  kills: number
  deaths: number
  assists: number
}

type Profile = {
  name: string
  tag: string
  level: number
  totalGames: number
  wins: number
  matches: Match[]
}

// Hash determinístico simples para gerar dados consistentes por Riot ID.
function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildProfile(riotId: string, champions: Champion[]): Profile {
  const [name, tag] = riotId.split("#")
  const rand = mulberry32(hashString(riotId.toLowerCase()))
  const totalGames = 40 + Math.floor(rand() * 160)
  const winRate = 0.4 + rand() * 0.25
  const wins = Math.round(totalGames * winRate)

  const matches: Match[] = Array.from({ length: 8 }).map(() => {
    const champ = champions[Math.floor(rand() * champions.length)]
    return {
      champion: champ,
      win: rand() < winRate,
      kills: Math.floor(rand() * 15),
      deaths: 1 + Math.floor(rand() * 9),
      assists: Math.floor(rand() * 20),
    }
  })

  return {
    name: name ?? riotId,
    tag: tag ?? "",
    level: 30 + Math.floor(rand() * 500),
    totalGames,
    wins,
    matches,
  }
}

type Props = {
  version: string
  champions: Champion[]
}

export function RiotHistory({ version, champions }: Props) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [profile, setProfile] = useState<Profile | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = input.trim()
    if (!/^.+#.+$/.test(value)) {
      setError("Use o formato Nick#Tag (ex: Faker#KR1).")
      setProfile(null)
      return
    }
    setError("")
    setLoading(true)
    setProfile(null)
    // Simula a latência da conexão com a API da Riot.
    window.setTimeout(() => {
      setProfile(buildProfile(value, champions))
      setLoading(false)
    }, 1100)
  }

  const winRate = profile ? Math.round((profile.wins / profile.totalGames) * 100) : 0
  const losses = profile ? profile.totalGames - profile.wins : 0

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <h2 className="mb-1 font-serif text-xl font-bold text-primary">Histórico do Invocador</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Digite o Riot ID para consultar a taxa de vitória recente.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nick#Tag"
            aria-label="Riot ID no formato Nick#Tag"
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none ring-ring/50 focus:ring-2"
          />
        </div>
        <Button type="submit" disabled={loading} className="font-semibold">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-loss">{error}</p>}

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Conectando à API da Riot...</span>
        </div>
      )}

      {profile && !loading && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-secondary/40 p-4">
            <div>
              <p className="font-serif text-lg font-bold text-foreground">
                {profile.name}
                <span className="text-muted-foreground">#{profile.tag}</span>
              </p>
              <p className="text-xs text-muted-foreground">Nível {profile.level}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                {winRate >= 50 ? (
                  <TrendingUp className="h-5 w-5 text-win" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-loss" />
                )}
                <span
                  className={`font-serif text-2xl font-bold ${winRate >= 50 ? "text-win" : "text-loss"}`}
                >
                  {winRate}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.wins}V / {losses}D · {profile.totalGames} partidas
              </p>
            </div>
          </div>

          {/* Barra de taxa de vitória */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-loss/40">
            <div className="h-full rounded-full bg-win" style={{ width: `${winRate}%` }} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Partidas recentes</h3>
            <ul className="space-y-2">
              {profile.matches.map((m, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 rounded-lg border p-2 ${
                    m.win ? "border-win/30 bg-win/5" : "border-loss/30 bg-loss/5"
                  }`}
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border">
                    <Image
                      src={championIcon(version, m.champion.id) || "/placeholder.svg"}
                      alt={m.champion.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{m.champion.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.kills}/{m.deaths}/{m.assists} KDA
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-bold ${
                      m.win ? "bg-win/20 text-win" : "bg-loss/20 text-loss"
                    }`}
                  >
                    {m.win ? "Vitória" : "Derrota"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}