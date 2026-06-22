import { supabase } from '@/lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const nombre = slug.replace(/-/g, ' ')

  const { data: countData } = await supabase
    .rpc('get_rumores_by_club', { club_nombre: nombre })
  const count = countData?.length ?? 0

  return {
    title: `${nombre} - Rumores y fichajes | TransferNova`,
    description: `Todos los rumores y fichajes del ${nombre}. Última hora del mercado de fichajes en TransferNova.`,
    robots: count === 0 ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: `https://gettransfernova.com/club/${slug}`,
    },
    openGraph: {
      title: `${nombre} - Rumores y fichajes`,
      description: `Todos los rumores y fichajes del ${nombre} en tiempo real.`,
      url: `https://gettransfernova.com/club/${slug}`,
      siteName: 'TransferNova',
      locale: 'es_ES',
      type: 'website',
    },
  }
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const nombre = slug.replace(/-/g, ' ')

  const { data: rpcData } = await supabase
    .rpc('get_rumores_by_club', { club_nombre: nombre })
  const rumores = (rpcData as any[]) ?? []

  const jugadoresTrending = [...new Set(
    (rumores as any[])?.map((r: any) => r.jugador).filter((j: any) => j && j !== 'Por clasificar')
  )].slice(0, 5)

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: 'Inter, sans-serif' }}>

      <header style={{ position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', textDecoration: 'none', color: 'white' }}>
            Transfer<span style={{ color: '#00ff87' }}>Nova</span>
          </a>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: 12, color: '#52525b' }}>
          <a href="/" style={{ color: '#52525b', textDecoration: 'none' }}>TransferNova</a>
          <span>›</span>
          <a href="/" style={{ color: '#52525b', textDecoration: 'none' }}>Clubes</a>
          <span>›</span>
          <span style={{ color: '#a1a1aa', textTransform: 'capitalize' }}>{nombre}</span>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Main */}
          <div style={{ flex: 1 }}>

            {/* Club header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(0,255,135,0.2), rgba(0,255,135,0.05))',
                border: '1px solid rgba(0,255,135,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 900, color: '#00ff87'
              }}>
                {nombre.slice(0, 2).toUpperCase()}
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
                const esTransfer = rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino
                return (
                  <div key={rumor.id} style={{
                    background: '#111111', borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden'
                  }}>
                    <div style={{ height: 2, background: `linear-gradient(90deg, ${color}40, transparent)` }}></div>
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                            textTransform: 'uppercase', background: `${color}15`, color, border: `1px solid ${color}25`
                          }}>
                            {rumor.estado === 'confirmado' ? '✅ Confirmado' : rumor.estado === 'caliente' ? '🔥 Caliente' : '👀 Rumor'}
                          </span>
                          {esTransfer && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, color: '#71717a', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6 }}>{rumor.club_origen}</span>
                              <span style={{ color: '#3f3f46' }}>→</span>
                              <span style={{ fontSize: 11, color: '#e4e4e7', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6 }}>{rumor.club_destino}</span>
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: '#52525b' }}>{rumor.fuente}</span>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: '#f4f4f5', marginBottom: 8 }}>{rumor.titular}</p>
                      <span style={{ fontSize: 11, color: '#52525b' }}>👤 {rumor.jugador}</span>
                    </div>
                  </div>
                )
              }) : (
                <p style={{ color: '#52525b', fontSize: 14 }}>No se encontraron rumores para este club.</p>
              )}
            </div>

            {/* Jugadores relacionados */}
            {rumores && rumores.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>👤 Jugadores relacionados</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[...new Set(rumores.map(r => r.jugador).filter(j => j && j !== 'Por clasificar'))].map(jugador => (
                    <a key={jugador} href={`/player/${jugador.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}`}
                      style={{
                        fontSize: 12, fontWeight: 600, padding: '6px 12px',
                        borderRadius: 999, background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#a1a1aa', textDecoration: 'none'
                      }}>
                      {jugador}
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ background: '#111111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>👤 Jugadores vinculados</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {jugadoresTrending.length > 0 ? jugadoresTrending.map((jugador, i) => (
                  <a key={jugador} href={`/player/${jugador.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#3f3f46', width: 16 }}>{i + 1}</span>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: '#71717a'
                    }}>
                      {jugador.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{jugador}</span>
                  </a>
                )) : (
                  <p style={{ fontSize: 12, color: '#52525b' }}>Sin jugadores vinculados</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}