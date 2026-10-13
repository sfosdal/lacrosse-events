// The city — every fact that makes this calendar La Crosse's rather than
// another town's, in one place (2026-10-11: a city on lqa-events, after
// Everett and Chicago). The browser (filter.js, app.js) and the build
// (scripts/*.mjs) both read it; nothing else names a venue or a team. The
// shared files (app.js, filter.js, styles.css bar its --v-* hues,
// scripts/*.mjs bar fetch-events.mjs and sources.mjs) are lqa-events' own,
// byte for byte — see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right. Per team:
  //   re        the title match
  //   venue     the home building; schedule = the club's own schedule page
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   espn      ESPN's sport/league/team id — every club here is on ESPN,
  //             so the season, the form block, news and transactions all
  //             come from there (schedules.mjs); the baseball seasons come
  //             from MLB's stats API (first-pitch times, the standings)
  //   division  (baseball) the division rivals by the abbreviations the
  //             schedule carries, for the standings line
  //   inject    (the Eagles) home games enter the listing from the league
  //             schedule — no ticket feed lists them
  //   club      the club's name on Ticketmaster; news the outlets' feeds;
  //             wiki the article; opens when the season usually starts
  // La Crosse sits between the Milwaukee and Minneapolis markets, so the
  // Packers, Brewers and Bucks AND the Vikings and Twins all have a tab
  // (Teams view only — their home grounds are not La Crosse venues, so no
  // games enter the listing; the Everett pattern for the Seattle clubs).
  var MLB = function (slug) { return ['https://www.mlb.com/' + slug + '/feeds/news/rss.xml', 'MLB.com']; };
  var TEAMS = [
    // UW–La Crosse Eagles, WIAC (Division III) football, Veterans Memorial Stadium: the hometown club
    { slug: 'eagles', label: 'Eagles', name: 'UW–La Crosse Eagles', abbr: 'UWL', re: /\beagles\b/i, sport: 'football', venue: 'Veterans Memorial Stadium', colors: ['#830019', '#c0c0c0'],
      espn: { sport: 'football', league: 'college-football', id: '2740' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { name: 'UW–La Crosse Eagles', url: 'https://uwlathletics.com/sports/football/schedule' }, // no ticket feed lists the home games; ESPN's schedule supplies them
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2740.png', schedule: 'https://uwlathletics.com/sports/football/schedule',
      club: 'UW-La Crosse Eagles', opens: 'September', wiki: { title: 'Wisconsin–La Crosse Eagles', club: true } },
    { slug: 'packers', label: 'Packers', re: /\bpackers\b/i, sport: 'football', venue: 'Lambeau Field', colors: ['#203731', '#ffb612'],
      espn: { sport: 'football', league: 'nfl', id: '9' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png', schedule: 'https://www.packers.com/schedule/',
      club: 'Green Bay Packers', opens: 'September', wiki: { title: 'Green Bay Packers', startYear: true },
      news: [['https://www.packers.com/rss/news', 'Packers.com']] },
    { slug: 'brewers', label: 'Brewers', re: /\bbrewers\b/i, sport: 'baseball', venue: 'American Family Field', colors: ['#12284b', '#ffc52f'],
      espn: { sport: 'baseball', league: 'mlb', id: '8' }, season: { kind: 'mlb', id: 158 }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png', schedule: 'https://www.mlb.com/brewers/schedule',
      club: 'Milwaukee Brewers', opens: 'late March', wiki: { title: 'Milwaukee Brewers' },
      division: ['CHC', 'STL', 'CIN', 'PIT'], // NL Central
      news: [MLB('brewers')] },
    { slug: 'bucks', label: 'Bucks', re: /\bbucks\b/i, sport: 'basketball', venue: 'Fiserv Forum', colors: ['#00471b', '#eee1c6'],
      espn: { sport: 'basketball', league: 'nba', id: '15' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', schedule: 'https://www.nba.com/bucks/schedule',
      club: 'Milwaukee Bucks', opens: 'late October', wiki: { title: 'Milwaukee Bucks' } },
    { slug: 'vikings', label: 'Vikings', re: /\bvikings\b/i, sport: 'football', venue: 'U.S. Bank Stadium', colors: ['#4f2683', '#ffc62f'],
      espn: { sport: 'football', league: 'nfl', id: '16' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png', schedule: 'https://www.vikings.com/schedule/',
      club: 'Minnesota Vikings', opens: 'September', wiki: { title: 'Minnesota Vikings', startYear: true },
      news: [['https://www.vikings.com/rss/news', 'Vikings.com']] },
    { slug: 'twins', label: 'Twins', re: /\btwins\b/i, sport: 'baseball', venue: 'Target Field', colors: ['#002b5c', '#d31145'],
      espn: { sport: 'baseball', league: 'mlb', id: '9' }, season: { kind: 'mlb', id: 142 }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png', schedule: 'https://www.mlb.com/twins/schedule',
      club: 'Minnesota Twins', opens: 'late March', wiki: { title: 'Minnesota Twins' },
      division: ['CLE', 'DET', 'KC', 'CWS'], // AL Central
      news: [MLB('twins')] },
  ];

  // The venues, one record each — the city's own rooms first, then the
  // regional draws a drive away. Per venue:
  //   capacity how many people the place holds
  //   area     'town' for the rooms a drive away — Rochester, Welch, Eau
  //            Claire, Black River Falls (the panel's second group); absent
  //            = La Crosse itself
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page; `ids` when a building is
  //            several Ticketmaster venues). No city sweep.
  //   alias    the other spellings the feeds use for it, folded to this name
  // A small market: the Weber Center, the Pump House, Pearl Street Brewery
  // and the Loggers' Copeland Park sell through their own box offices and
  // are not on Ticketmaster, so they are not here yet.
  // No festivals yet, so the panel's Festivals group folds away (app.js).
  var VENUES = {
    // --- La Crosse: the arena, the downtown theatre, the campus stadium ---
    'La Crosse Center': {
      capacity: 7500,
      type: 'concert',
      cssVar: '--v-lcc',
      color: '#ea8686',
      url: 'https://www.lacrossecenter.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.lacrossecenter.com&sz=128',
      tm: { id: 'KovZpZAEdalA', match: 'la crosse center', fallbackUrl: 'https://www.lacrossecenter.com/events', exclude: /parking/i },
      alias: /la ?crosse center/i,
    },
    'Cavalier Theater': {
      capacity: 500,
      type: 'concert',
      cssVar: '--v-cavalier',
      color: '#86eaa3',
      url: 'https://www.cavaliertheater.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.cavaliertheater.com&sz=128',
      tm: { id: 'KovZpZAJ61IA', match: 'cavalier theater', fallbackUrl: 'https://www.cavaliertheater.com/' },
      alias: /cavalier theat/i,
    },
    'Veterans Memorial Stadium': { // the Eagles' home field — games arrive from ESPN's schedule (city.js inject), not a ticket feed
      capacity: 7000,
      type: 'sports',
      cssVar: '--v-vets',
      color: '#c086ea',
      url: 'https://uwlathletics.com/sports/football/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=uwlathletics.com&sz=128',
      alias: /veterans memorial stadium/i,
    },
    // --- Around the region (`area: 'town'`): Rochester's civic center, the Treasure Island casino, Eau Claire's theatre, the Ho-Chunk casino ---
    'Mayo Civic Center': { // Rochester, MN — the auditorium, the presentation hall and the arena are three Ticketmaster venues
      area: 'town',
      capacity: 7200,
      type: 'concert',
      cssVar: '--v-mayo',
      color: '#eadd86',
      url: 'https://www.mayociviccenter.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.mayociviccenter.com&sz=128',
      tm: { ids: ['KovZpZAF7tdA', 'KovZpZAF7t7A', 'KovZpZAF7teA'], match: 'mayo', fallbackUrl: 'https://www.mayociviccenter.com/events', exclude: /parking/i },
      alias: /mayo civic center|mayo presentation hall/i,
    },
    'Treasure Island Resort & Casino': { // Welch, MN
      area: 'town',
      capacity: 2800,
      type: 'concert',
      cssVar: '--v-ti',
      color: '#86d9ea',
      url: 'https://www.ticasino.com/entertainment/',
      icon: 'https://www.google.com/s2/favicons?domain=www.ticasino.com&sz=128',
      tm: { ids: ['KovZpZAEktnA', 'KovZ917AOQk'], match: 'treasure island', fallbackUrl: 'https://www.ticasino.com/entertainment/', exclude: /parking/i },
      alias: /treasure island (?:resort|amphitheater)/i,
    },
    'RCU Theatre': { // Eau Claire, in the Pablo Center
      area: 'town',
      capacity: 1200,
      type: 'arts',
      cssVar: '--v-rcu',
      color: '#ea86bc',
      url: 'https://www.pablocenter.org/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.pablocenter.org&sz=128',
      tm: { id: 'Z7r9jZadT6', match: 'rcu theatre', fallbackUrl: 'https://www.pablocenter.org/events/' },
      alias: /rcu theat|pablo center/i,
    },
    'Ho-Chunk Gaming Black River Falls': {
      area: 'town',
      capacity: 1000,
      type: 'concert',
      cssVar: '--v-hochunk',
      color: '#9fea86',
      url: 'https://ho-chunkgaming.com/blackriverfalls/entertainment/',
      icon: 'https://www.google.com/s2/favicons?domain=ho-chunkgaming.com&sz=128',
      tm: { id: 'KovZ917AQTx', match: 'ho-chunk gaming black river falls', fallbackUrl: 'https://ho-chunkgaming.com/blackriverfalls/entertainment/' },
      alias: /ho-?chunk gaming black river falls/i,
    },
  };

  // The usual view: every room on — a small market, nothing buries the list
  var DEFAULT_ON = ['La Crosse Center', 'Cavalier Theater', 'Veterans Memorial Stadium', 'Mayo Civic Center', 'Treasure Island Resort & Casino', 'RCU Theatre', 'Ho-Chunk Gaming Black River Falls'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — the arena, the theatres, the casinos' },
    { key: 'sports', label: 'Sports', title: 'Eagles home games at Veterans Memorial Stadium' },
    { key: 'arts', label: 'Arts & Theater', title: 'Touring shows, ballet, comedy, the symphony' },
    { key: 'community', label: 'Community', title: 'Family shows, fairs, festivals' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 21 slots from the first build: five base-36 digits.
  var CODE_LENGTH = 5;
  var REGISTRY = [
    ['venue', 'La Crosse Center'], ['venue', 'Cavalier Theater'], ['venue', 'Veterans Memorial Stadium'], ['venue', 'Mayo Civic Center'], ['venue', 'Treasure Island Resort & Casino'], ['venue', 'RCU Theatre'], ['venue', 'Ho-Chunk Gaming Black River Falls'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'eagles'], ['team', 'packers'], ['team', 'brewers'], ['team', 'bucks'], ['team', 'vikings'], ['team', 'twins'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'La Crosse', // the board drops it from the clubs' names
    presetDefault: 'Every room — the La Crosse Center, the Cavalier, the Eagles and the regional rooms a drive away — every team and type',
    presetNeighborhood: 'La Crosse only',
    presetBig: 'Only the places that hold 2,000 or more — the La Crosse Center, Mayo Civic Center and Treasure Island',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing La Crosse only.', big: 'Showing the big rooms only — the La Crosse Center, Mayo Civic Center and Treasure Island.' },
  };

  global.LQACity = {
    key: 'lacrosse',
    name: 'La Crosse',
    site: 'https://lacrosse.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; lacrosse-events/1.0; +https://lacrosse.here.events/)',
    tz: 'America/Chicago', tzName: 'Central', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: "Wisconsin", stateOutline: 'M8.9 21.9L8.8 21.5L8.0 21.1L7.5 20.4L7.4 19.5L7.5 18.7L7.3 18.4L7.2 18.1L7.0 16.6L6.7 15.8L5.8 15.2L5.2 14.5L4.5 13.9L4.0 13.7L3.6 13.3L3.0 13.1L2.7 12.7L2.6 12.3L2.7 11.7L2.7 11.1L2.7 10.4L2.9 9.8L2.7 9.3L2.3 8.9L2.6 8.3L2.9 7.8L3.8 7.3L4.1 7.1L4.1 5.9L4.1 4.7L4.4 4.5L4.6 4.3L5.4 4.2L6.1 3.8L7.1 3.2L8.3 2.4L9.4 2.0L10.4 2.1L10.7 2.5L10.4 3.2L10.1 3.9L9.7 4.6L9.6 5.2L9.8 5.2L10.1 5.3L10.3 5.7L10.4 6.0L11.2 6.2L11.9 6.4L12.6 6.6L13.3 6.8L13.8 7.1L14.2 7.3L14.8 7.4L15.6 7.5L16.3 7.8L16.3 8.2L17.1 8.6L17.2 8.9L17.2 9.2L17.0 9.7L17.0 10.0L17.1 10.1L17.5 10.0L17.6 10.1L17.4 10.6L17.5 10.9L18.2 11.3L18.8 10.4L19.7 9.7L21.1 10.2L21.3 11.0L20.4 12.2L19.8 14.2L19.3 16.2L19.1 17.5L19.2 19.8L19.4 22.0L16.8 22.0L14.2 22.0L11.5 21.9L8.9 21.9Z', // the masthead's small state, linking to here.events (scripts/state-outline.mjs, Natural Earth 1:50m)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'La Crosse Events', short: 'La Crosse Events', teams: 'La Crosse home teams — every season', prodid: '-//here.events//lacrosse-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events around La Crosse\\, WI — the La Crosse Center\\, the Cavalier Theater\\, the Eagles and the regional rooms' },
    teams: TEAMS,
    venues: VENUES,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room, so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
