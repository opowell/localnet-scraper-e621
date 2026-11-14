import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('e621', () => {
  it('reads a post as its file and its tags by kind, an artist\'s linked most strongly', () => {
    visit('https://e621.net/posts/6857488', `<meta property="og:title" content="bruno created by photolol.03 - e621">
      <section id="tag-list"><ul><li class="tag-list-item" data-category="artist"><a class="tag-list-search" href="/posts?tags=photolol.03"><span class="tag-list-name">photolol.03<span>Uploaded by the artist</span></span></a></li>
      <li class="tag-list-item" data-category="general"><a class="tag-list-search" href="/posts?tags=hi_res"><span class="tag-list-name">hi res</span></a></li></ul></section>
      <section id="image-container" data-file-url="https://static1.e621.net/data/35/99/a.webm" data-sample-url="https://static1.e621.net/data/sample/a.jpg"></section>`)
    const parsed = load('e621.js', ['parseE621']).parseE621()
    expect(parsed.title).toBe('bruno created by photolol.03')
    expect(parsed.content).toEqual(['[![](https://static1.e621.net/data/sample/a.jpg)](https://static1.e621.net/data/35/99/a.webm)'])
    expect(parsed.links).toEqual([
      { url: 'https://e621.net/posts?tags=photolol.03', title: 'photolol.03', score: 1 },
      { url: 'https://e621.net/posts?tags=hi_res', title: 'hi res', score: 0.5 },
    ])
  })

  it('reads https://e621.net/posts as a listing of what it links to', async () => {
    visit('https://e621.net/posts', '<article class="thumbnail" data-id="6857488"><a href="/posts/6857488">A</a></article>')
    expect(await load('e621.js', ['parseE621']).parseE621()).toEqual({ listing: true, links: [{ url: 'https://e621.net/posts/6857488', score: 1 }] })
  })
})
