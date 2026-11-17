/*
 * Mock data for the TheUsGallery frontend.
 *
 * The shapes here are the API contract the backend should return (see README).
 * "Human" mirrors the Gallery wireframe; the other categories are sample content.
 * Images are tonal gradients until real photography is available — swap
 * `image` for `{ src, alt }` later and keep `gradient` as the loading placeholder.
 */

const g = {
  rustSky: 'linear-gradient(170deg, #6A9BD8 0%, #6A9BD8 28%, #B2582E 29%, #7A2E14 100%)',
  boneLight: 'linear-gradient(180deg, #C9D8E6 0%, #E6E0D4 60%, #CFC8BA 100%)',
  mirror: 'linear-gradient(90deg, #6B4A3A 0%, #EDE6DE 50%, #6B4A3A 100%)',
  redInterval: 'linear-gradient(160deg, #1A0A0C 0%, #B8301E 55%, #4A0F12 100%)',
  moss: 'linear-gradient(200deg, #2C3A24 0%, #8A8F7C 45%, #1C1F1A 100%)',
  monoArch: 'linear-gradient(135deg, #101010 0%, #101010 40%, #D9D9D6 41%, #8E8E8A 100%)',
  stone: 'linear-gradient(180deg, #E4E4E1 0%, #A9A9A4 50%, #5E5E5A 100%)',
  canopy: 'linear-gradient(170deg, #3B2416 0%, #7A4A2A 40%, #1A120C 100%)',
  openSea: 'linear-gradient(180deg, #CBD7DE 0%, #9DB4C2 45%, #2E4C5E 55%, #1C3040 100%)',
  storm: 'linear-gradient(180deg, #1F2A30 0%, #3A4A52 50%, #11181C 100%)',
  leafNight: 'linear-gradient(160deg, #0E1611 0%, #2E4434 50%, #0B110D 100%)',
  whiteHorizon: 'linear-gradient(180deg, #E8E6DF 0%, #D3D0C6 60%, #2A2A28 61%, #161616 100%)',
  dusk: 'linear-gradient(180deg, #2B2140 0%, #A0607A 55%, #E8B48A 100%)',
  clay: 'linear-gradient(150deg, #C9A07A 0%, #8C5A3A 60%, #3E2618 100%)',
  ochre: 'linear-gradient(180deg, #E9C46A 0%, #B07D2A 60%, #3A2A10 100%)',
  ice: 'linear-gradient(200deg, #F2F5F7 0%, #BFD0DA 50%, #6E8A9A 100%)',
  ember: 'linear-gradient(180deg, #0C0806 0%, #3A1A0E 50%, #D2622A 100%)',
  grid: 'linear-gradient(90deg, #1A1A1A 0%, #1A1A1A 49%, #CFCBC2 50%, #CFCBC2 100%)',
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/** ratio = width / height of the artwork frame. */
const work = (title, artist, year, gradient, ratio = 0.8) => ({
  id: slugify(title),
  title,
  artist,
  year,
  ratio,
  image: { gradient, alt: `${title} by ${artist}, ${year}` },
})

export const categories = [
  {
    id: 'form',
    name: 'Form',
    eyebrow: 'Sculpture & shape',
    cover: g.rustSky,
    title: 'Form collections',
    intro: 'Mass, edge and surface. Works that ask what a shape is doing to the space around it.',
    collections: [
      {
        id: 'held-tension',
        eyebrow: 'Curator’s selection',
        title: 'Held tension',
        description: 'Objects that look like they are about to move, caught at the point of balance.',
        works: [
          work('Folded Weight', 'Ada Morrow', 2024, g.clay, 0.75),
          work('Arc Between', 'Studio Nord', 2023, g.monoArch, 0.85),
          work('Iron Bloom', 'Ricardo G. Angel', 2022, g.ember, 0.8),
          work('Plinth Study', 'Hana Ito', 2024, g.stone, 0.7),
        ],
      },
      {
        id: 'cast-light',
        eyebrow: 'Material studies',
        title: 'Cast in light',
        description: 'Plaster, glass and bronze, read by the light that falls across them.',
        works: [
          work('Glass Hours', 'Lena Hollis', 2024, g.ice, 0.8),
          work('Bronze Interval', 'Imani Brooks', 2023, g.ochre, 0.75),
          work('Plaster Sky', 'Ada Morrow', 2022, g.boneLight, 0.85),
          work('Shadow Column', 'Hana Ito', 2024, g.grid, 0.7),
        ],
      },
    ],
  },
  {
    id: 'human',
    name: 'Human',
    eyebrow: 'Portrait & presence',
    cover: g.boneLight,
    title: 'Human collections',
    intro: 'Curated pathways through the archive. Move slowly, look closely, and leave a thought behind.',
    collections: [
      {
        id: 'new-perspectives',
        eyebrow: 'Curator’s selection',
        title: 'New perspectives',
        description: 'Works that reframe the familiar through uncommon angles, absent scale, and quiet intersection.',
        works: [
          work('Fold Study No. 3', 'Ricardo G. Angel', 2024, g.rustSky, 0.94),
          work('A Body in Light', 'Lena Hollis', 2023, g.boneLight, 0.66),
          work('Rational Curve', 'Studio Nord', 2024, g.mirror, 0.94),
          work('Red Interval', 'Imani Brooks', 2022, g.redInterval, 0.74),
          work('Quiet Axis', 'Hana Ito', 2024, g.stone, 0.8),
        ],
      },
      {
        id: 'soft-structures',
        eyebrow: 'Material studies',
        title: 'Soft structures',
        description: 'Concrete becomes fluid. Fabric gains weight. A collection about the tension held inside materials.',
        works: [
          work('Living Facade', 'Clara Ventós', 2023, g.moss, 0.66),
          work('Untitled Reflection', 'Jon Weiss', 2024, g.monoArch, 1.17),
          work('Quiet Monument', 'Mara Okonkwo', 2022, g.stone, 0.66),
          work('Under the Canopy', 'Rafael Duarte', 2023, g.canopy, 1.17),
        ],
      },
      {
        id: 'edge-of-silence',
        eyebrow: 'Open water',
        title: 'The edge of silence',
        description: 'A meditation on distance, solitude, and the vast emotional geography of open landscapes.',
        works: [
          work('Small Passage', 'Elin Sørensen', 2023, g.openSea, 0.66),
          work('After the Storm', 'Kai Tanaka', 2024, g.storm, 1.17),
          work('Rain Memory', 'Noor Haddad', 2022, g.leafNight, 0.66),
          work('White Horizon', 'Elin Sørensen', 2024, g.whiteHorizon, 1.17),
        ],
      },
    ],
  },
  {
    id: 'light',
    name: 'Light',
    eyebrow: 'Colour & atmosphere',
    cover: g.dusk,
    title: 'Light collections',
    intro: 'Hours, weather and glow. Images where the light itself is the subject.',
    collections: [
      {
        id: 'blue-hour',
        eyebrow: 'Curator’s selection',
        title: 'Blue hour',
        description: 'The short stretch after sunset when every colour turns cool and soft.',
        works: [
          work('Last Window', 'Kai Tanaka', 2024, g.dusk, 0.75),
          work('Cold Harbour', 'Elin Sørensen', 2023, g.openSea, 0.85),
          work('Violet Field', 'Noor Haddad', 2024, g.dusk, 0.7),
          work('Lamp Study', 'Jon Weiss', 2022, g.ember, 0.8),
        ],
      },
      {
        id: 'overexposed',
        eyebrow: 'Process',
        title: 'Overexposed',
        description: 'Too much light on purpose: burnt highlights, faded edges, images close to white.',
        works: [
          work('Bleach', 'Lena Hollis', 2024, g.ice, 0.8),
          work('Noon Wall', 'Mara Okonkwo', 2023, g.boneLight, 0.75),
          work('Paper Sun', 'Clara Ventós', 2022, g.ochre, 0.85),
          work('Haze Line', 'Kai Tanaka', 2024, g.whiteHorizon, 0.7),
        ],
      },
    ],
  },
  {
    id: 'ground',
    name: 'Ground',
    eyebrow: 'Land & place',
    cover: g.canopy,
    title: 'Ground collections',
    intro: 'Soil, stone and the marks people leave on land.',
    collections: [
      {
        id: 'worked-land',
        eyebrow: 'Curator’s selection',
        title: 'Worked land',
        description: 'Quarries, terraces and fields: landscapes shaped by long, slow labour.',
        works: [
          work('Terrace Four', 'Rafael Duarte', 2023, g.clay, 0.8),
          work('Quarry Light', 'Ada Morrow', 2024, g.stone, 0.75),
          work('Furrow', 'Mara Okonkwo', 2022, g.ochre, 0.85),
          work('Root System', 'Rafael Duarte', 2024, g.canopy, 0.7),
        ],
      },
      {
        id: 'after-rain',
        eyebrow: 'Weather',
        title: 'After rain',
        description: 'Wet stone, dark leaves and the quiet that follows a storm.',
        works: [
          work('Dark Leaves', 'Noor Haddad', 2023, g.leafNight, 0.75),
          work('Slate Path', 'Jon Weiss', 2024, g.storm, 0.8),
          work('Moss Wall', 'Clara Ventós', 2022, g.moss, 0.7),
          work('Puddle Sky', 'Kai Tanaka', 2024, g.openSea, 0.85),
        ],
      },
    ],
  },
  {
    id: 'signal',
    name: 'Signal',
    eyebrow: 'Pattern & abstraction',
    cover: g.redInterval,
    title: 'Signal collections',
    intro: 'Repetition, rhythm and noise. Images that read like a pulse.',
    collections: [
      {
        id: 'repeat',
        eyebrow: 'Curator’s selection',
        title: 'Repeat',
        description: 'One shape, many times, until the pattern becomes the picture.',
        works: [
          work('Grid No. 9', 'Studio Nord', 2024, g.grid, 0.8),
          work('Mirror Fold', 'Studio Nord', 2023, g.mirror, 0.85),
          work('Pulse', 'Imani Brooks', 2024, g.redInterval, 0.75),
          work('Static Field', 'Jon Weiss', 2022, g.storm, 0.7),
        ],
      },
      {
        id: 'interference',
        eyebrow: 'Process',
        title: 'Interference',
        description: 'Glitches, overlaps and double exposures that let two images collide.',
        works: [
          work('Double Room', 'Hana Ito', 2024, g.monoArch, 0.8),
          work('Heat Trace', 'Imani Brooks', 2023, g.ember, 0.75),
          work('Crossed Light', 'Lena Hollis', 2022, g.dusk, 0.85),
          work('Low Signal', 'Kai Tanaka', 2024, g.leafNight, 0.7),
        ],
      },
    ],
  },
]

const now = Date.now()
const day = 24 * 60 * 60 * 1000

/** Seed visitor notes, keyed by artwork id. */
export const seedNotes = {
  'fold-study-no-3': [
    { id: 'n1', author: 'Mira', text: 'The shadow makes the structure feel almost weightless.', createdAt: new Date(now - 2 * day).toISOString() },
    { id: 'n2', author: 'Yusuf', text: 'I keep coming back to that warm, quiet curve.', createdAt: new Date(now - 60 * 1000).toISOString() },
  ],
  'a-body-in-light': [
    { id: 'n3', author: 'Ana', text: 'The figure is so small it almost disappears into the white.', createdAt: new Date(now - 5 * day).toISOString() },
  ],
  'white-horizon': [
    { id: 'n4', author: 'Theo', text: 'Feels like the edge of the world.', createdAt: new Date(now - 9 * day).toISOString() },
  ],
}
