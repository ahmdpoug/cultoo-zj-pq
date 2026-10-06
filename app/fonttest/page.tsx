import {
  Anton,
  Passion_One,
  Black_Han_Sans,
  Gasoek_One,
  Sofia_Sans_Extra_Condensed,
  Alumni_Sans,
  Archivo,
  Londrina_Solid,
  Bowlby_One,
} from 'next/font/google'

const anton = Anton({ subsets: ['latin'], weight: '400' })
const passion = Passion_One({ subsets: ['latin'], weight: '900' })
const blackHan = Black_Han_Sans({ subsets: ['latin'], weight: '400' })
const gasoek = Gasoek_One({ subsets: ['latin'], weight: '400' })
const sofia = Sofia_Sans_Extra_Condensed({ subsets: ['latin'], weight: '900' })
const alumni = Alumni_Sans({ subsets: ['latin'], weight: '900' })
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'] })
const londrina = Londrina_Solid({ subsets: ['latin'], weight: '900' })
const bowlby = Bowlby_One({ subsets: ['latin'], weight: '400' })

const FONTS = [
  { name: 'Anton', cls: anton.className, style: {} },
  { name: 'Passion One 900', cls: passion.className, style: {} },
  { name: 'Black Han Sans', cls: blackHan.className, style: {} },
  { name: 'Gasoek One', cls: gasoek.className, style: {} },
  { name: 'Sofia Sans Extra Condensed 900', cls: sofia.className, style: {} },
  { name: 'Alumni Sans 900', cls: alumni.className, style: {} },
  { name: 'Archivo wdth62 wght900', cls: archivo.className, style: { fontStretch: '62%', fontWeight: 900 } },
  { name: 'Londrina Solid 900', cls: londrina.className, style: {} },
  { name: 'Bowlby One', cls: bowlby.className, style: {} },
]

export default function FontTest() {
  return (
    <div style={{ background: '#000', color: '#f0eee0', padding: 16 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/cult-wordmark-480.webp" alt="reference" style={{ width: 220, marginBottom: 12 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        {FONTS.map((f) => (
          <div key={f.name} style={{ borderTop: '1px solid #333', paddingTop: 6 }}>
            <p style={{ fontSize: 11, opacity: 0.6, fontFamily: 'monospace' }}>{f.name}</p>
            <p className={f.cls} style={{ ...f.style, fontSize: 84, lineHeight: 0.9, textTransform: 'uppercase' }}>
              Cult
            </p>
            <p className={f.cls} style={{ ...f.style, fontSize: 34, lineHeight: 1, textTransform: 'uppercase', marginTop: 8 }}>
              Championships
            </p>
            <p className={f.cls} style={{ ...f.style, fontSize: 26, lineHeight: 1, marginTop: 6 }}>
              1,284,550 $CULT · LV 42
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
