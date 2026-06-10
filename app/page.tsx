import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: rumores } = await supabase
    .from('rumores')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main style={{ fontFamily: 'Inter, sans-serif' }} className="min-h-screen bg-[#080808] text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-black tracking-tight">
            Transfer<span style={{ color: '#00ff87' }}>Nova</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#00ff87' }}></span>
              <span className="text-xs text-zinc-400 font-medium">En vivo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-xl mx-auto px-4 mt-4 mb-2">
        <div className="flex gap-2">
          {['Todo', 'Caliente 🔥', 'Confirmado ✅', 'Rumor 👀'].map((tab, i) => (
            <button key={tab} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              i === 0 
                ? 'text-black' 
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`} style={i === 0 ? { backgroundColor: '#00ff87' } : {}}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-xl mx-auto px-4 py-3 space-y-3">
        {rumores?.map((rumor) => (
          <div
            key={rumor.id}
            className="rounded-2xl border border-white/5 overflow-hidden cursor-pointer group transition-all hover:border-white/10"
            style={{ background: 'linear-gradient(145deg, #111111, #0d0d0d)' }}
          >
            {/* Card top accent */}
            <div className="h-0.5 w-full" style={{
              background: rumor.estado === 'confirmado'
                ? 'linear-gradient(90deg, #3b82f6, transparent)'
                : rumor.estado === 'caliente'
                ? 'linear-gradient(90deg, #00ff87, transparent)'
                : 'linear-gradient(90deg, #f59e0b, transparent)'
            }}></div>

            <div className="p-4">
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    rumor.estado === 'confirmado'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : rumor.estado === 'caliente'
                      ? 'border'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`} style={rumor.estado === 'caliente' ? {
                    backgroundColor: 'rgba(0,255,135,0.08)',
                    color: '#00ff87',
                    borderColor: 'rgba(0,255,135,0.2)'
                  } : {}}>
                    {rumor.estado === 'confirmado' ? '✅ Confirmado' :
                     rumor.estado === 'caliente' ? '🔥 Caliente' : '👀 Rumor'}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-600 font-medium">{rumor.fuente}</span>
              </div>

              {/* Clubs */}
              {rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-white bg-white/5 px-2.5 py-1 rounded-lg">
                    {rumor.club_origen}
                  </span>
                  <span className="text-zinc-600 text-sm">→</span>
                  <span className="text-xs font-semibold text-white bg-white/5 px-2.5 py-1 rounded-lg">
                    {rumor.club_destino}
                  </span>
                </div>
              )}

              {/* Titular */}
              <p className="text-sm font-semibold leading-snug text-zinc-100 mb-4">
                {rumor.titular}
              </p>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600 font-medium">
                  🧑 {rumor.jugador}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${rumor.probabilidad}%`,
                        background: rumor.probabilidad > 70
                          ? '#00ff87'
                          : rumor.probabilidad > 40
                          ? '#f59e0b'
                          : '#ef4444'
                      }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-bold" style={{
                    color: rumor.probabilidad > 70
                      ? '#00ff87'
                      : rumor.probabilidad > 40
                      ? '#f59e0b'
                      : '#ef4444'
                  }}>
                    {rumor.probabilidad}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}