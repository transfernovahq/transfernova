import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export const alt = 'TransferNova - Rumores en tiempo real'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 3600

async function getStats() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('rumores')
      .select('estado')

    if (error || !data) throw new Error()

    const total = data.length
    const calientes = data.filter(r => r.estado === 'caliente').length
    const confirmados = data.filter(r => r.estado === 'confirmado').length

    return { total, calientes, confirmados }
  } catch {
    return { total: 100, calientes: 20, confirmados: 10 }
  }
}

export default async function Image() {
  const { total, calientes, confirmados } = await getStats()

  return new ImageResponse(
    (
      <div
        style={{
          background: '#080808',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Borde neón superior */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#00ff87' }} />

        {/* Círculo decorativo fondo izquierda */}
        <div style={{
          position: 'absolute',
          left: '-80px',
          top: '50%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: '1px solid #00ff8720',
          marginTop: '-200px',
        }} />

        {/* Círculo decorativo fondo derecha */}
        <div style={{
          position: 'absolute',
          right: '-80px',
          top: '50%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: '1px solid #00ff8720',
          marginTop: '-200px',
        }} />

        {/* Icono flecha transferencia */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ width: '40px', height: '2px', background: '#00ff87' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00ff87' }} />
          <div style={{ width: '40px', height: '2px', background: '#00ff87' }} />
        </div>

        {/* Marca principal */}
        <div style={{
          fontSize: 88,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-4px',
          lineHeight: 1,
          display: 'flex',
        }}>
          Transfer<span style={{ color: '#00ff87' }}>Nova</span>
        </div>

        {/* Eslogan */}
        <div style={{
          fontSize: 22,
          color: '#71717a',
          marginTop: '14px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}>
          Live Transfer Market
        </div>

        {/* Dominio */}
        <div style={{
          fontSize: 26,
          color: '#ffffff',
          marginTop: '28px',
          letterSpacing: '1px',
          borderBottom: '1px solid #00ff87',
          paddingBottom: '4px',
        }}>
          gettransfernova.com
        </div>

        {/* Estadísticas dinámicas */}
        <div style={{ display: 'flex', gap: '32px', marginTop: '36px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>{total}</span>
            <span style={{ fontSize: 13, color: '#71717a', letterSpacing: '2px', textTransform: 'uppercase' }}>Rumores</span>
          </div>
          <div style={{ width: '1px', height: '48px', background: '#ffffff15' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>{calientes}</span>
            <span style={{ fontSize: 13, color: '#71717a', letterSpacing: '2px', textTransform: 'uppercase' }}>Calientes</span>
          </div>
          <div style={{ width: '1px', height: '48px', background: '#ffffff15' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#00ff87' }}>{confirmados}</span>
            <span style={{ fontSize: 13, color: '#71717a', letterSpacing: '2px', textTransform: 'uppercase' }}>Confirmados</span>
          </div>
        </div>

        {/* Borde neón inferior */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#00ff87' }} />
      </div>
    ),
    { ...size }
  )
}