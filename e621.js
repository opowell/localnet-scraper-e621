// A post's own address on e621, /posts/<id>, else null.
function e621Post(url) {
  const page = new URL(url, location.href)
  return /(?:^|\.)e621\.net$/.test(page.hostname) && /^\/posts\/\d+$/.test(page.pathname) ? `${page.origin}${page.pathname}` : null
}

// A post's page (/posts/6857488) reads as its title (the page's, "bruno created by photolol.03", without the site's
// name), then its picture or video (#image-container's data-file-url, a video's poster its sample), then its
// description. Its details are its tags by kind (artists, characters, copyrights, species, general, meta…), each a
// link to the search of it, which it links to with weight 0.5, its artists' with 1, and its rating. Any other page (a
// search, the posts, a pool) is a listing of the posts it shows.
function parseE621(_profileId) {
  if (!/(?:^|\.)e621\.net$/.test(location.hostname)) {
    return null
  }
  const post = e621Post(location.href)
  const container = document.querySelector('#image-container[data-file-url]')
  if (!post || !container) {
    return listingOf(Array.from(document.querySelectorAll('article.thumbnail[data-id]'), article => `${location.origin}/posts/${article.dataset.id}`)) ?? { listing: true }
  }
  const file = new URL(container.dataset.fileUrl, location.href).href
  const sample = container.dataset.sampleUrl && new URL(container.dataset.sampleUrl, location.href).href
  const title = (metaContent('og:title') || document.title).replace(/\s+-\s+e621\s*$/, '').trim()
  const content = [/\.(?:webm|mp4)$/i.test(file) ? videoBlock(file, sample && sample !== file ? sample : '') : `![${title}](${file})`]
  const description = document.querySelector('#post-description-container .dtext-container, .post-description .dtext-container')?.innerText.trim()
  if (description) {
    content.push(...description.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean))
  }
  const kinds = {}
  for (const item of document.querySelectorAll('#tag-list li.tag-list-item[data-category]')) {
    const a = item.querySelector('a.tag-list-search[href]')
    if (a) {
      // A name's first line: an artist's is followed by notes ("Uploaded by the artist").
      const name = item.querySelector('.tag-list-name')?.firstChild?.textContent.trim()
      ;(kinds[item.dataset.category] ||= []).push({ text: name || linkName(a), url: a.href })
    }
  }
  const links = []
  for (const [kind, tags] of Object.entries(kinds)) {
    links.push(...tags.map(({ text, url }) => ({ url, title: text, score: kind === 'artist' ? 1 : 0.5 })))
  }
  const rating = { s: 'safe', q: 'questionable', e: 'explicit' }[/rating-(\w)/.exec(document.body.className)?.[1]]
    || /rating-(safe|questionable|explicit)/.exec(container.className)?.[1]
  return {
    title,
    content,
    links,
    details: [
      ['artists', kinds.artist || []],
      ['characters', kinds.character || []],
      ['copyrights', kinds.copyright || []],
      ['species', kinds.species || []],
      ['tags', kinds.general || []],
      ['meta', kinds.meta || []],
      ['rating', rating || null],
    ],
  }
}

// The parser a scrape calls.
registerParser(parseE621)
