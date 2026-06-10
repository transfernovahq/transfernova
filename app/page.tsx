export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Transfer<span className="text-green-400">Nova</span>
          </h1>
          <span className="text-xs text-zinc-500">Rumores en tiempo real</span>
        </div>

        {/* Feed de rumores de prueba */}
        <div className="space-y-4">
          
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">🔥 Caliente</span>
              <span className="text-xs text-zinc-500">hace 5 min</span>
            </div>
            <p className="text-sm font-semibold leading-snug">Mbappé podría abandonar el Real Madrid este verano según fuentes cercanas al club</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-zinc-400">Real Madrid → PSG</span>
              <span className="text-xs text-zinc-500">Marca</span>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-medium">👀 Rumor</span>
              <span className="text-xs text-zinc-500">hace 23 min</span>
            </div>
            <p className="text-sm font-semibold leading-snug">El Barcelona negocia con el Manchester City por la cesión de un centrocampista</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-zinc-400">Manchester City → Barcelona</span>
              <span className="text-xs text-zinc-500">Sport</span>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium">✅ Confirmado</span>
              <span className="text-xs text-zinc-500">hace 1h</span>
            </div>
            <p className="text-sm font-semibold leading-snug">Oficial: Erling Haaland renueva con el Manchester City hasta 2030</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-zinc-400">Manchester City</span>
              <span className="text-xs text-zinc-500">BBC Sport</span>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}