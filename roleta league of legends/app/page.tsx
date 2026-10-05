import { RouletteApp } from "@/components/roulette-app"

export default function Page() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center">
          <p className="mb-2 font-serif text-xs uppercase tracking-[0.3em] text-primary">League of Legends</p>
          <h1 className="text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Roleta de Campeões
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-muted-foreground">
            Gire a roleta, sorteie um campeão e organize-o em Vitórias, Derrotas ou Banidos. Clique em um
            ícone nos painéis para devolvê-lo à roleta.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <RouletteApp />
      </div>
    </main>
  )
}