import { DM_Sans, Italiana } from 'next/font/google'
import 'locomotive-scroll/locomotive-scroll.css' // includes Lenis base styles
import '../index.css'
import { Providers } from './providers'

const sans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-dm-sans' })
const display = Italiana({ subsets: ['latin'], weight: '400', variable: '--font-italiana' })

export const metadata = {
  title: { default: 'Aperture', template: '%s · Aperture' },
  description: 'Aperture — an independent digital exhibition of contemporary image-making, art, and visual culture.',
}

// Apply the saved theme before first paint to avoid a flash.
const themeScript = `try{var d=document.documentElement,m=localStorage.getItem('aperture:theme'),p=localStorage.getItem('aperture:palette');if(m==='purple'||m==='orange'){p=p||m;m='dark'}if(m==='dark'||m==='light')d.dataset.theme=m;if(p==='lime'||p==='purple'||p==='orange')d.dataset.palette=p}catch(e){}`

export default function RootLayout({ children }) {
  return (
    // The theme script changes data-theme / data-palette before React hydrates.
    <html lang="en" data-theme="dark" data-palette="lime" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
