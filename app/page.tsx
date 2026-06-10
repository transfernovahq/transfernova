import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: rumores } = await supabase
    .from('rumores')
    .select('*')
    .order('created_at', { ascending: false })

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

        {/* Feed */}
        <div className="space-y-4">
          {rumores?.map((rumor) => (
            <div key={rumor.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  rumor.estado === 'confirmado' ? 'bg-blue-500/20 text-blue-400' :
                  rumor.estado === 'caliente' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {rumor.estado === 'confirmado' ? '✅ Confirmado' :
                   rumor.estado === 'caliente' ? '🔥 Caliente' : '👀 Rumor'}
                </span>
                <span className="text-xs text-zinc-500">{rumor.fuente}</span>
              </div>
              <p className="text-sm font-semibold leading-snug">{rumor.titular}</p>
              <div className="flex items-center gap-3 mt-3">
                {rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino && (
                  <span className="text-xs text-zinc-400">{rumor.club_origen} → {rumor.club_destino}</span>
                )}
                <span className="text-xs text-zinc-500">{rumor.probabilidad}% probabilidad</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}