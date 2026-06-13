 import { supabase } from '@/lib/supabase'

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const nombre = decodeURIComponent(slug).replace(/-/g, ' ')

  const nombreNormalizado = nombre
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const { data: rumores } = await supabase
  .from('rumores')
  .select('*')
  .or(`jugador.ilike.${nombre},jugador.ilike.${nombreNormalizado}`)
  .order('created_at', { ascending: false })

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', textDecoration: 'none', color: 'white' }}>
            Transfer<span style={{ color: '#00ff87' }}>Nova</span>
          </a>
        </div>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>

        {/* Player header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(0,255,135,0.2), rgba(0,255,135,0.05))',
            border: '1px solid rgba(0,255,135,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#00ff87'
          }}>
            {nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'capitalize' }}>{nombre}</h1>
            <p style={{ fontSize: 13, color: '#52525b', marginTop: 4 }}>{rumores?.length || 0} rumores encontrados</p>
          </div>
        </div>

        {/* Rumores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rumores && rumores.length > 0 ? rumores.map((rumor) => {
            const color = rumor.estado === 'confirmado' ? '#00ff87' : rumor.estado === 'caliente' ? '#f97316' : '#6366f1'
            return (
              <div key={rumor.id} style={{
                background: '#111111', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden'
              }}>
                <div style={{ height: 2, background: `linear-gradient(90deg, ${color}40, transparent)` }}></div>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                      textTransform: 'uppercase', background: `${color}15`, color, border: `1px solid ${color}25`
                    }}>
                      {rumor.estado === 'confirmado' ? '✅ Confirmado' : rumor.estado === 'caliente' ? '🔥 Caliente' : '👀 Rumor'}
                    </span>
                    <span style={{ fontSize: 11, color: '#52525b' }}>{rumor.fuente}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: '#f4f4f5', marginBottom: 8 }}>{rumor.titular}</p>
                  {rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#71717a', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6 }}>{rumor.club_origen}</span>
                      <span style={{ color: '#3f3f46' }}>→</span>
                      <span style={{ fontSize: 11, color: '#e4e4e7', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6 }}>{rumor.club_destino}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          }) : (
            <p style={{ color: '#52525b', fontSize: 14 }}>No se encontraron rumores para este jugador.</p>
          )}
        </div>

      </div>
    </main>
  )
}
