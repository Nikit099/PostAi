import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #A7D2FF 0%, #A2E4B8 100%)',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        CG
      </div>
    ),
    {
      ...size,
    }
  )
}