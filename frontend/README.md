# Aperture — frontend

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · Lenis (home) · Locomotive Scroll v5 (other pages).
Styled with the Aperture design system (Dark / Pink / Light themes).
The API (MongoDB · Firebase Admin · Cloudinary · EmailJS) runs in the same app as route handlers under `src/app/api`.

```bash
npm install
cp .env.example .env.local   # fill in; plus serviceAccountKey.json in the project root
npm run dev      # http://localhost:3000
npm test         # vitest (always uses the mock API)
npm run build && npm start
npm run seed     # reset gallery content in MongoDB from src/functions/mockData.js (keeps users)
```

## Structure

```
src/
  app/            Next.js routes: pages, layouts, and api/** route handlers
  server/         server-only: db, firebase-admin, cloudinary, email, http.js (route wrapper + auth guards),
                  models/, controllers/, utils/
  views/          HomePage, GalleryPage, AdminPage, UploadPage (client components the app/ pages render)
  functions/      client API layer: api.js (import from here), mockApi.js, mockData.js, client.js
  lib/            motion presets, scroll engines, shared artwork state, helpers
  theme/          ThemeProvider (data-theme on <html>, saved in localStorage)
  components/
    ui/           Button, IconButton, TextLink, ThemeSwitcher, ProgressBar, chips, NoteInput, ArtImage
    layout/       Header, Footer, QuoteBand
    home/         Hero, CategoryCarousel, CategoryCard
    gallery/      CollectionSection, ArtworkRow, ArtworkCard
    artwork/      ArtworkModal, VisitorNotes
  index.css       Aperture tokens → Tailwind theme (bg-ground, text-muted, border-line, font-display, text-display-l …)
```

## Routes

| Path | Page | Scroll |
|---|---|---|
| `/` | Home: category carousel | Lenis |
| `/collections/:categoryId` | Gallery | Locomotive |
| `/collections/:categoryId/works/:workId` | Gallery with the artwork modal open | Locomotive (paused) |
| `/upload` | Upload a work (approved users) | native |
| `/admin` | Approve users, manage categories and collections (admins) | native |

## API contract

Calls go to `src/app/api` by default. Set `NEXT_PUBLIC_USE_MOCK=true` to use the in-browser mock instead
(auth, likes, uploads and admin need the real API). Components don't change. The API returns these shapes:

| Function | Request | Returns |
|---|---|---|
| `getCategories()` | `GET /categories` | `CategorySummary[]` |
| `getCategory(id)` | `GET /categories/:id` | `Category` |
| `getArtwork(id)` | `GET /artworks/:id` | `Artwork` |
| `getNotes(id)` | `GET /artworks/:id/notes` | `Note[]` |
| `addNote(id, { text })` | `POST /artworks/:id/notes` | `Note` |
| `setSaved(id, saved)` | `PUT` / `DELETE /artworks/:id/save` | `{ id, saved }` |
| `getSavedWorks()` | `GET /saved` | `ArtworkSummary[]` |

```ts
CategorySummary { id, index: "02", name, eyebrow, cover /* css gradient */, workCount }
Category        extends CategorySummary { title, intro, collections: Collection[] }
Collection      { id, index: "01", eyebrow, title, description, works: ArtworkSummary[] }
ArtworkSummary  { id, title, artist, year, ratio /* w/h */, image: { gradient, alt, src? },
                  categoryId, collectionId, saved, noteCount }
Artwork         extends ArtworkSummary { position, total }   // position within its category
Note            { id, author, text, createdAt /* ISO */ }
```

Errors return a non-2xx status with `{ message }`. `client.js` turns these into an `ApiError` with `.status`.
Images are tonal gradients for now. Once the backend returns `image.src`, the photo is shown on top of the gradient.
