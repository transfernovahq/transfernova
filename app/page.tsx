import { supabase } from '@/lib/supabase'
export const revalidate = 300

function tiempoRelativo(fecha: string) {
  const ahora = new Date()
  const entonces = new Date(fecha)
  const diff = Math.floor((ahora.getTime() - entonces.getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function iniciales(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function toSlug(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function toClubSlug(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default async function Home() {
  const { data: rumores } = await supabase
    .from('rumores')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const total = rumores?.length || 0
  const confirmados = rumores?.filter(r => r.estado === 'confirmado').length || 0
  const calientes = rumores?.filter(r => r.estado === 'caliente').length || 0
  const trending = [...new Set(rumores?.map(r => r.jugador).filter(j => j && j !== 'Por clasificar'))].slice(0, 5)

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>
            Transfer<span style={{ color: '#00ff87' }}>Nova</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ff87', display: 'inline-block' }}></span>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>En vivo</span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>

        {/* Hero Stats */}
        <div style={{ padding: '24px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 12, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Mercado de Fichajes 2026</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Rumores activos', value: total, color: '#ffffff' },
              { label: 'Confirmados', value: confirmados, color: '#00ff87' },
              { label: 'Calientes 🔥', value: calientes, color: '#f97316' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: stat.color, letterSpacing: '-1px' }}>{stat.value}</span>
                <span style={{ fontSize: 11, color: '#52525b', fontWeight: 500 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '16px 0', display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { label: 'Todo', active: true },
            { label: '🔥 Caliente', active: false },
            { label: '✅ Confirmado', active: false },
            { label: '👀 Rumor', active: false },
          ].map(tab => (
            <button key={tab.label} style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: 999,
              border: tab.active ? 'none' : '1px solid rgba(255,255,255,0.08)',
              background: tab.active ? '#00ff87' : 'transparent',
              color: tab.active ? '#000' : '#71717a',
              cursor: 'pointer'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div style={{ display: 'flex', gap: 24, paddingTop: 20, alignItems: 'flex-start' }}>

          {/* Feed */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rumores?.map((rumor) => {
              const color = rumor.estado === 'confirmado' ? '#00ff87' : rumor.estado === 'caliente' ? '#f97316' : '#6366f1'
              const probColor = rumor.probabilidad > 70 ? '#00ff87' : rumor.probabilidad > 40 ? '#f97316' : '#ef4444'
              const esTransfer = rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino

              return (
                <div key={rumor.id} style={{
                  background: '#111111',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}>
                  {/* Accent */}
                  <div style={{ height: 2, background: `linear-gradient(90deg, ${color}40, transparent)` }}></div>

                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                        border: `1px solid ${color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 13, fontWeight: 800, color: color
                      }}>
                        {iniciales(rumor.jugador || 'NN')}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Top row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                              textTransform: 'uppercase', letterSpacing: '0.5px',
                              background: `${color}15`, color: color, border: `1px solid ${color}25`
                            }}>
                              {rumor.estado === 'confirmado' ? '✅ Confirmado' : rumor.estado === 'caliente' ? '🔥 Caliente' : '👀 Rumor'}
                            </span>
                            {esTransfer && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <a href={`/club/${toClubSlug(rumor.club_origen)}`} style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6, textDecoration: 'none' }}>{rumor.club_origen}</a>
                                <span style={{ color: '#3f3f46', fontSize: 12 }}>→</span>
                                <a href={`/club/${toClubSlug(rumor.club_destino)}`} style={{ fontSize: 11, fontWeight: 600, color: '#e4e4e7', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6, textDecoration: 'none' }}>{rumor.club_destino}</a>
                              </div>
                            )}
                            {!esTransfer && rumor.club_destino && (
                              <a href={`/club/${toClubSlug(rumor.club_destino)}`} style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6, textDecoration: 'none' }}>{rumor.club_destino}</a>
                            )}
                          </div>
                          <span style={{ fontSize: 11, color: '#3f3f46', flexShrink: 0 }}>{tiempoRelativo(rumor.created_at)}</span>
                        </div>

                        {/* Titular */}
                        <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: '#f4f4f5', marginBottom: 12 }}>
                          {rumor.titular}
                        </p>

                        {/* Bottom */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <a href={`/player/${toSlug(rumor.jugador)}`} style={{ fontSize: 11, color: '#52525b', textDecoration: 'none' }}>👤 {rumor.jugador}</a>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ width: `${rumor.probabilidad}%`, height: '100%', background: probColor, borderRadius: 999 }}></div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: probColor }}>{rumor.probabilidad}%</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Trending */}
            <div style={{ background: '#111111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>🔥 Trending</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {trending.map((jugador, i) => (
                  <div key={jugador} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#3f3f46', width: 16 }}>{i + 1}</span>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: '#71717a'
                    }}>
                      {iniciales(jugador)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{jugador}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats box */}
            <div style={{ background: '#111111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>📊 Stats</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Total rumores', value: total },
                  { label: 'Confirmados', value: confirmados },
                  { label: 'Calientes', value: calientes },
                  { label: 'Fuentes activas', value: 3 },
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#71717a' }}>{stat.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7' }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}