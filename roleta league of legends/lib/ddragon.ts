// Helpers para consumir a API pública do Data Dragon da Riot Games.

const DDRAGON = "https://ddragon.leagueoflegends.com"

export type Champion = {
  id: string // ex: "Aatrox"
  key: string // id numérico como string
  name: string // nome localizado, ex: "Aatrox"
  title: string // ex: "a Espada Darkin"
  tags: string[] // ex: ["Fighter", "Tank"]
}

export type DDragonState = {
  version: string
  champions: Champion[]
}

export const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Busca a versão mais recente e a lista completa de campeões (em pt_BR).
export async function fetchChampions(): Promise<DDragonState> {
  const versions: string[] = await fetch(`${DDRAGON}/api/versions.json`).then((r) => r.json())
  const version = versions[0]

  const data = await fetch(`${DDRAGON}/cdn/${version}/data/pt_BR/champion.json`).then((r) => r.json())

  const champions: Champion[] = Object.values(data.data as Record<string, any>)
    .map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      title: c.title,
      tags: c.tags ?? [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))

  return { version, champions }
}

// URL do ícone quadrado (Champion Select) do campeão.
export function championIcon(version: string, championId: string): string {
  return `${DDRAGON}/cdn/${version}/img/champion/${championId}.png`
}