# e621 scraper for Localnet

Reads `e621.net` pages for Localnet, a browser extension that is a personal search engine.
Localnet pulls it from here the first time it scrapes such a page, through the
[localnet-scrapers](https://github.com/opowell/localnet-scrapers) scraper source.

A post's page (/posts/6857488) reads as its title (the page's, "bruno created by photolol.03", without the site's name), then its picture or video (#image-container's data-file-url, a video's poster its sample), then its description. Its details are its tags by kind (artists, characters, copyrights, species, general, meta…), each a link to the search of it, which it links to with weight 0.5, its artists' with 1, and its rating. Any other page (a search, the posts, a pool) is a listing of the posts it shows.

- `source.json`: what Localnet reads to know the scraper: its name, the URLs it reads, how the site is searched, and the file to run.
- `e621.js`: the parser. It is injected into the scraped page after Localnet's DOM helpers (content-scripts/utils/dom.js) and defines `window.__dynamicParser`.
- `e621.test.ts`: its unit tests, run from a Localnet checkout (`pnpm parsers pull`, then `pnpm test parsers/localnet-scraper-e621`).
- `saved-pages/` (not in git): real pages saved from the site, which Localnet's `e2e/saved-pages.test.ts` scrapes. See Localnet's README.