# La Crosse Events

Event feed and calendar for La Crosse, Wisconsin: the La Crosse Center, the
Cavalier Theater and the UW–La Crosse Eagles at Veterans Memorial Stadium,
plus the regional rooms a drive away — Rochester's Mayo Civic Center,
Treasure Island Resort & Casino, Eau Claire's RCU Theatre and Ho-Chunk Gaming
Black River Falls — with the home teams' seasons (Eagles, Packers, Brewers,
Bucks, Vikings, Twins) in a Teams view.

Live at **https://lacrosse.here.events/** once the domain is wired (GitHub
Pages; see the deploy checklist in the project memory).

Built as a sister site of [lqa-events](https://github.com/sfosdal/lqa-events):
the browser code, the merge/schedule/ICS scripts and the tests are lqa-events'
own, byte for byte (`git diff --no-index` against it should show nothing but
`site/city.js`, `scripts/fetch-events.mjs`, `scripts/sources.mjs`, the
`--v-*` hue lines of `styles.css`, the page copy and the data files). What
makes this La Crosse's is `site/city.js` (every team, venue, type, default,
share-code slot and phrase), `scripts/fetch-events.mjs` (the sources) and
`scripts/sources.mjs`.

## Embed

```html
<div id="lacrosse-events"></div>
<script src="https://lacrosse.here.events/embed.js" data-max="8" defer></script>
```

## Sources

- **Ticketmaster Discovery API**, read venue by venue (`tm.id`, or `tm.ids`
  where one building is several Ticketmaster venues — the Mayo Civic Center's
  three halls). No city sweep: a small market, and the key is shared across the
  family of sites, so calls are paced a second apart with a back-off on 429.
- **Seasons** — ESPN for the Eagles (whose home games enter the listing from
  the schedule, since no ticket feed lists them), the Packers, Vikings and
  Bucks; MLB's stats API for the Brewers and Twins. The Milwaukee and
  Minneapolis clubs are Teams-view only: their grounds are not La Crosse
  venues, so no games enter the listing.

Not yet: the rooms that sell through their own box office — the Weber Center,
the Pump House, Pearl Street Brewery, the Loggers at Copeland Park.

## Build

```sh
cp .env.example .env            # TICKETMASTER_API_KEY=…
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # until the archive branch exists
node --test
```

The GitHub Actions workflow (`.github/workflows/events.yml`) rebuilds the feed
once a day at noon Central and publishes `site/` to Pages.
