import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WindCast Command Centre',
    short_name: 'WindCast',
    description: 'Day-ahead wind forecast and trading decisions',
    start_url: '/',
    display: 'standalone',
    background_color: '#020b17',
    theme_color: '#020b17',
    icons: [
      {
        src: '/logo.png',
        sizes: '256x256',
        type: 'image/png',
      },
    ],
  }
}
