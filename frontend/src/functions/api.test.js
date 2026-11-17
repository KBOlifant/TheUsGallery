import { describe, expect, it } from 'vitest'
import { addNote, getArtwork, getCategories, getCategory, getNotes, getSavedWorks, setSaved } from './api'
import { categories } from './mockData'

describe('mock API', () => {
  it('lists five categories with computed work counts', async () => {
    const list = await getCategories()
    expect(list.map((c) => c.id)).toEqual(['form', 'human', 'light', 'ground', 'signal'])
    expect(list[1]).toMatchObject({ index: '02', name: 'Human', workCount: 13 })
  })

  it('gives every artwork a unique id', () => {
    const ids = categories.flatMap((c) => c.collections.flatMap((col) => col.works.map((w) => w.id)))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('returns a category with collections and artwork summaries', async () => {
    const human = await getCategory('human')
    expect(human.collections.map((c) => c.title)).toEqual(['New perspectives', 'Soft structures', 'The edge of silence'])
    expect(human.collections[0].works[0]).toMatchObject({
      id: 'fold-study-no-3',
      categoryId: 'human',
      collectionId: 'new-perspectives',
      saved: false,
      noteCount: 2,
    })
  })

  it('rejects unknown ids with a 404 ApiError', async () => {
    await expect(getCategory('nope')).rejects.toMatchObject({ name: 'ApiError', status: 404 })
    await expect(getArtwork('nope')).rejects.toMatchObject({ status: 404 })
  })

  it('reports an artwork position within its category', async () => {
    const work = await getArtwork('fold-study-no-3')
    expect(work).toMatchObject({ position: 1, total: 13 })
  })

  it('persists saves', async () => {
    await setSaved('rain-memory', true)
    expect((await getArtwork('rain-memory')).saved).toBe(true)
    expect((await getSavedWorks()).map((w) => w.id)).toEqual(['rain-memory'])
    await setSaved('rain-memory', false)
    expect(await getSavedWorks()).toEqual([])
  })

  it('adds notes and validates text', async () => {
    const note = await addNote('fold-study-no-3', { text: '  Quiet and warm.  ' })
    expect(note).toMatchObject({ author: 'You', text: 'Quiet and warm.' })
    expect((await getNotes('fold-study-no-3')).at(-1).id).toBe(note.id)
    expect((await getArtwork('fold-study-no-3')).noteCount).toBe(3)
    await expect(addNote('fold-study-no-3', { text: '   ' })).rejects.toMatchObject({ status: 400 })
  })
})
