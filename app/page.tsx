import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: rumores } = await supabase
    .from('rumores')
    .select('*')
    .order('created_at', { ascending: false })

function tiempoRelativo(fecha: string) {
  const ahora = new Date()
  const entonces = new Date(fecha)
  const diff = Math.floor((ahora.getTime() - entonces.getTime()) / 1000)
  
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}
  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 50 }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px' }}>
            Transfer<span style={{ color: '#00ff87' }}>Nova</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ff87', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>En vivo</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Todo', active: true },
            { label: '🔥 Caliente', active: false },
            { label: '✅ Confirmado', active: false },
            { label: '👀 Rumor', active: false },
          ].map((tab) => (
            <button key={tab.label} style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 999,
              border: tab.active ? 'none' : '1px solid rgba(255,255,255,0.08)',
              background: tab.active ? '#00ff87' : 'rgba(255,255,255,0.03)',
              color: tab.active ? '#000' : '#71717a',
              cursor: 'pointer'
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rumores?.map((rumor) => {
          const color = rumor.estado === 'confirmado' ? '#3b82f6' : rumor.estado === 'caliente' ? '#00ff87' : '#f59e0b'
          const probColor = rumor.probabilidad > 70 ? '#00ff87' : rumor.probabilidad > 40 ? '#f59e0b' : '#ef4444'

          return (
            <div key={rumor.id} style={{
              background: 'linear-gradient(145deg, #111111, #0e0e0e)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              cursor: 'pointer'
            }}>
              {/* Top accent line */}
              <div style={{ height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }}></div>

              <div style={{ padding: '14px 16px' }}>
                {/* Badge + fuente */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: `${color}15`,
                    color: color,
                    border: `1px solid ${color}30`
                  }}>
                    {rumor.estado === 'confirmado' ? '✅ Confirmado' : rumor.estado === 'caliente' ? '🔥 Caliente' : '👀 Rumor'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span style={{ fontSize: 11, color: '#52525b', fontWeight: 500 }}>{rumor.fuente}</span>
                  <span style={{ fontSize: 10, color: '#3f3f46' }}>{tiempoRelativo(rumor.created_at)}</span>
                  </div>
                </div>

                {/* Clubs */}
                {rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#e4e4e7' }}>{rumor.club_origen}</span>
                    <span style={{ color: '#3f3f46', fontSize: 13 }}>→</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#e4e4e7' }}>{rumor.club_destino}</span>
                  </div>
                )}

                {/* Titular */}
                <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45, color: '#f4f4f5', marginBottom: 14 }}>
                  {rumor.titular}
                </p>

                {/* Bottom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#52525b' }}>👤 {rumor.jugador}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 72, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${rumor.probabilidad}%`, height: '100%', background: probColor, borderRadius: 999 }}></div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: probColor }}>{rumor.probabilidad}%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </main>
  )
}