import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: rumores } = await supabase
    .from('rumores')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black tracking-tight">
            Transfer<span className="text-emerald-400">Nova</span>
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-zinc-500">En vivo</span>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {rumores?.map((rumor) => (
            <div key={rumor.id} className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer">
              
              {/* Top row */}
              <div className="flex items-center justify-between mb-2.5">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  rumor.estado === 'confirmado' ? 'bg-blue-500/15 text-blue-400' :
                  rumor.estado === 'caliente' ? 'bg-emerald-500/15 text-emerald-400' :
                  'bg-amber-500/15 text-amber-400'
                }`}>
                  {rumor.estado === 'confirmado' ? '✅ Confirmado' :
                   rumor.estado === 'caliente' ? '🔥 Caliente' : '👀 Rumor'}
                </span>
                <span className="text-[11px] text-zinc-600">{rumor.fuente}</span>
              </div>

              {/* Titular */}
              <p className="text-sm font-semibold leading-snug text-zinc-100 mb-3">{rumor.titular}</p>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  {rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino && (
                    <>
                      <span>{rumor.club_origen}</span>
                      <span className="text-zinc-700">→</span>
                      <span>{rumor.club_destino}</span>
                    </>
                  )}
                  {(!rumor.club_origen || rumor.club_origen === rumor.club_destino) && (
                    <span>{rumor.club_destino}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-16 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${rumor.probabilidad}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-zinc-500">{rumor.probabilidad}%</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </main>
  )
}