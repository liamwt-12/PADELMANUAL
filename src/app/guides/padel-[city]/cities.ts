// Hyperlocal city guide configurations.
// Each entry drives a /guides/padel-[slug] page with editorial copy plus
// real venue data pulled from the listings table.

export type CitySearch =
  | { kind: 'city'; value: string }
  | { kind: 'cities'; values: string[] }
  | { kind: 'area'; cityFallback?: string; addressTerms: string[]; postcodePrefixes?: string[] };

export type CityGuide = {
  slug: string;
  name: string;
  region: string;
  metaTitle: string;
  metaDescription: string;
  search: CitySearch;
  hook: string;          // 1-sentence intro under the H1
  character: string;     // 4-6 sentence paragraph on the local scene
  setting: string;       // short paragraph framing the venues list
  weather: string;       // indoor/outdoor reality check
  beginner: string;      // beginner-oriented note
  closing: string;       // short closing paragraph
  nearby: string[];      // slugs of related city guides
};

export const CITY_GUIDES: CityGuide[] = [
  {
    slug: 'northampton',
    name: 'Northampton',
    region: 'East Midlands',
    metaTitle: 'Padel in Northampton — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Northampton. Real venues, live booking availability, indoor and outdoor courts across the East Midlands.',
    search: { kind: 'city', value: 'Northampton' },
    hook:
      'Northampton sits at the geographic heart of England — and its padel scene reflects that practical, no-nonsense Midlands sensibility.',
    character:
      "A handful of dedicated venues serve the town and the surrounding villages of Wellingborough and Daventry. Most courts here are indoor, which is just as well: the East Midlands does not pretend to be the Costa del Sol. Pricing is gentler than London, the queues are shorter, and the standard of play has climbed noticeably over the past eighteen months as serious players migrate up the M1. The local clubs lean social, with regular Americano nights and beginner sessions that fill quickly.",
    setting:
      "Every venue listed below sits within easy reach of the town centre. Court counts, indoor / outdoor split, and live availability are pulled directly from each club's booking system.",
    weather:
      "Northampton's reliance on indoor courts is its insurance policy against the East Midlands winter. A handful of outdoor courts exist for the optimistic months between May and September, but the year-round players know to book the heated venues.",
    beginner:
      "Most clubs here actively court first-time players because the sport is still finding its feet locally. Beginner sessions usually run on weekday evenings; the venues are unfailingly patient with newcomers, and rackets are almost always available to hire.",
    closing:
      "Northampton is not trying to be London or Manchester. It is building a steady, sociable padel culture at its own pace — and the result is one of the more welcoming places to learn the sport in central England.",
    nearby: ['leicester', 'coventry', 'cambridge', 'oxford'],
  },
  {
    slug: 'harrogate',
    name: 'Harrogate',
    region: 'North Yorkshire',
    metaTitle: 'Padel in Harrogate — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Harrogate. Indoor courts, club culture, and live booking availability in North Yorkshire.',
    search: { kind: 'city', value: 'Harrogate' },
    hook:
      'Spa-town pedigree, market-town pace, and a padel scene that has crept up on the Yorkshire establishment.',
    character:
      "Harrogate's growth has been quietly remarkable. The town's affluent demographic took to padel quickly — a sport that suits long lunches and longer conversations. Courts here tend to be clean, well-run, and bookable a fortnight in advance, which is a polite way of saying you should plan ahead. Tennis players from the surrounding clubs have been the most enthusiastic converts, bringing a level of technical seriousness that more recently established scenes still lack.",
    setting:
      "The venues below cover Harrogate, Knaresborough and the immediate surrounds. Each listing shows live court availability where the venue uses Playtomic.",
    weather:
      "Yorkshire weather is Yorkshire weather. The indoor courts here justify themselves twelve months a year, and even the most committed outdoor enthusiasts retreat indoors from October onwards.",
    beginner:
      "If you are new to the sport, look for the regular intro sessions at the larger clubs — they tend to run on weekday mornings as well as evenings, which is unusual elsewhere and speaks to the demographic. Coaching is taken seriously here.",
    closing:
      "Harrogate has built its padel culture on the same things it builds everything else on: quality, restraint, and a quiet refusal to do anything badly. Worth the drive from Leeds or York if your local courts are full.",
    nearby: ['sheffield', 'hull', 'middlesbrough'],
  },
  {
    slug: 'hampshire',
    name: 'Hampshire',
    region: 'South East',
    metaTitle: 'Padel in Hampshire — Courts Across Southampton, Portsmouth & Winchester',
    metaDescription:
      'Where to play padel in Hampshire. Venues across Southampton, Portsmouth, Winchester, Andover and Basingstoke with live booking availability.',
    search: {
      kind: 'cities',
      values: [
        'Southampton',
        'Portsmouth',
        'Winchester',
        'Andover',
        'Basingstoke',
        'Eastleigh',
        'Fareham',
        'Aldershot',
        'Farnborough',
        'Romsey',
        'Petersfield',
      ],
    },
    hook:
      "Hampshire's padel landscape stretches from the Solent up through the chalk downs, with venues scattered across half a dozen towns rather than concentrated in a single city.",
    character:
      "Southampton and Portsmouth lead on volume; Winchester offers the more refined experience; commuter towns like Eastleigh, Andover and Basingstoke fill in the map. The county's coastal influence means outdoor courts are genuinely viable for more of the year than most of England — though the prevailing wind off the Solent is a real consideration in the winter months. Hampshire's player base is unusually broad, drawing in former tennis players, naval personnel from the Portsmouth bases, and a steady commuter stream from the Waterloo and Reading lines.",
    setting:
      "The listings below are spread across Hampshire's main towns. Use the city tags on each venue to find what is closest to you.",
    weather:
      "Hampshire enjoys the longest viable outdoor padel season in mainland England. Even so, the better-equipped venues offer covered or indoor courts so that booking patterns hold up through the winter.",
    beginner:
      "Southampton and Portsmouth both have venues with established beginner programmes. If you are new to the sport, start at one of the larger clubs — they have the coaching infrastructure to take you from your first session through to your first tournament.",
    closing:
      "Hampshire is one of the more underrated padel regions in England. Geographic spread is its only real complication; once you find your local club, the rest takes care of itself.",
    nearby: ['reading', 'bournemouth', 'oxford'],
  },
  {
    slug: 'birkdale',
    name: 'Birkdale',
    region: 'Merseyside',
    metaTitle: 'Padel in Birkdale & Southport — Courts and Live Availability',
    metaDescription:
      'Where to play padel in Birkdale and the wider Southport area. Court listings, indoor venues, and live availability in Merseyside.',
    search: {
      kind: 'area',
      addressTerms: ['Birkdale', 'Southport', 'Ainsdale', 'Formby'],
      postcodePrefixes: ['PR8', 'PR9'],
      cityFallback: 'Southport',
    },
    hook:
      "The leafy suburb of Southport is fast becoming Merseyside's quiet padel address.",
    character:
      "Birkdale has long been associated with golf — Royal Birkdale's name carries the tone — but padel has begun to find a foothold here too. The audience is part lapsed-tennis-player, part new to racquet sports altogether. Courts are easy to reach from Liverpool, Preston and the rest of the Merseyside coast, and the pace is markedly more relaxed than the city clubs further south. Court time at evenings and weekends is starting to feel scarce, which is the surest sign that a local scene is working.",
    setting:
      "The listings below cover Birkdale, central Southport, and the immediate Sefton coast. Each venue's live availability is shown where it uses Playtomic.",
    weather:
      "The Sefton coast catches more wind than rain, which makes covered or indoor courts the sensible default. Outdoor courts are pleasant in summer; less so in February.",
    beginner:
      "If you are new to padel, the local clubs run social sessions designed exactly for that. Birkdale's small-town pace makes it an unusually welcoming place to learn — there is none of the elbow-out competitiveness of the bigger city scenes.",
    closing:
      "If you live anywhere on the Merseyside coast and have not yet tried padel, this is the right corner to start. Quiet, civilised, and improving fast.",
    nearby: ['sheffield', 'harrogate', 'middlesbrough'],
  },
  {
    slug: 'clapham',
    name: 'Clapham',
    region: 'South West London',
    metaTitle: 'Padel in Clapham — Courts, Clubs & Live Availability (SW4)',
    metaDescription:
      'Where to play padel in Clapham. SW4 venues, court listings, and live booking availability across South London.',
    search: {
      kind: 'area',
      addressTerms: ['Clapham', 'Battersea', 'Stockwell'],
      postcodePrefixes: ['SW4', 'SW8', 'SW11'],
      cityFallback: 'London',
    },
    hook:
      'Clapham has become a default postcode for South London padel — tightly populated, well-served by the Northern line, and home to a generation that took up the sport during lockdown and never put the racket down.',
    character:
      "Most courts here sit on or near Clapham Common, with a handful tucked into railway arches and converted warehouse space toward Battersea. Bookings vanish on weekday evenings — the after-work crowd is relentless and well-organised. Weekend mornings have a brunch-then-play rhythm that any number of recent London exports will find familiar. The standard of play sits comfortably above the South London average, helped by a tight network of regular mixed sessions.",
    setting:
      "The listings below cover SW4 and the immediate surrounds. Live availability is pulled from each venue's booking platform.",
    weather:
      "Indoor courts are non-negotiable in central London. The handful of outdoor or semi-covered courts in the area are useful in summer, but most local players treat them as a bonus rather than a default.",
    beginner:
      "If you are new to padel, look for the beginner clinics at the larger Battersea-side venues — they run several times a week and are a friendly way in. Clapham's social-mixer culture means you will not be short of partners after your first month.",
    closing:
      "Clapham's padel scene is what every London neighbourhood scene wants to be: dense, sociable, and impossible to imagine the area without.",
    nearby: ['brixton', 'putney', 'wimbledon', 'richmond'],
  },
  {
    slug: 'wimbledon',
    name: 'Wimbledon',
    region: 'South West London',
    metaTitle: 'Padel in Wimbledon — Courts, Clubs & Live Availability (SW19)',
    metaDescription:
      'Where to play padel in Wimbledon. SW19 venues, multi-sport clubs, and live booking availability in South West London.',
    search: {
      kind: 'area',
      addressTerms: ['Wimbledon', 'Raynes Park', 'Southfields'],
      postcodePrefixes: ['SW19', 'SW20'],
      cityFallback: 'London',
    },
    hook:
      "Wimbledon's racquet-sport pedigree barely needs explaining — and padel has slipped into the area as comfortably as you would expect.",
    character:
      "Local venues range from purpose-built padel centres to multi-sport clubs that have folded courts into existing tennis facilities. The standard of play tends to be higher than the South London average, which makes social Americano nights worth turning up to. Wimbledon Common's joggers have to share their corner of the world with a new sound: the sharp pop of a Babolat ball off a panoramic glass back wall. Booking patterns are more orderly here than in other parts of South London — people plan ahead.",
    setting:
      "The venues below cover SW19, SW20 and the surrounding pockets. Most use Playtomic, so the live availability shown is current to the minute.",
    weather:
      "Indoor courts are the default; outdoor courts in this part of London are a treat for the warmer months but rarely the year-round answer.",
    beginner:
      "Wimbledon's tennis culture means coaching here is taken seriously. If you are new to padel and want a proper grounding rather than to muddle through, this is one of the better London neighbourhoods to start in.",
    closing:
      "Wimbledon was never going to ignore padel for long. The result is a scene that feels established despite still being relatively young.",
    nearby: ['putney', 'richmond', 'clapham', 'brixton'],
  },
  {
    slug: 'putney',
    name: 'Putney',
    region: 'South West London',
    metaTitle: 'Padel in Putney — Courts, Clubs & Live Availability (SW15)',
    metaDescription:
      'Where to play padel in Putney. SW15 riverside venues, club nights, and live booking availability in South West London.',
    search: {
      kind: 'area',
      addressTerms: ['Putney', 'East Putney', 'Roehampton'],
      postcodePrefixes: ['SW15'],
      cityFallback: 'London',
    },
    hook:
      'Riverside Putney has the easy convenience that makes any local padel scene work: short journeys, plenty of cafés, and a young population that takes its weekend exercise seriously.',
    character:
      "Most padel here clusters between Putney Bridge and East Putney stations, with newer courts arriving along the river toward Wandsworth. The clubs lean social, with regular mixers and beginner-friendly sessions that fill quickly. Expect to find a regular partner inside a fortnight if you bother to ask. Putney's rowing-and-running crowd has taken to padel with the same earnestness it brings to everything else, which keeps the standard of play creeping upwards.",
    setting:
      "The listings below cover SW15 and the immediate Wandsworth side. Court counts and live availability are pulled directly from each venue.",
    weather:
      "Indoor and covered courts dominate here for the obvious reasons. The river-adjacent outdoor courts are excellent in summer and unusable in February.",
    beginner:
      "Several local venues run beginner courses pitched at the post-work crowd. They tend to be friendly, unintimidating, and a quick route to your first regular game.",
    closing:
      "Putney is one of the most painless places in London to take up padel. Convenient, social, and quietly very good.",
    nearby: ['wimbledon', 'richmond', 'clapham', 'brixton'],
  },
  {
    slug: 'richmond',
    name: 'Richmond',
    region: 'South West London',
    metaTitle: 'Padel in Richmond — Courts, Clubs & Live Availability (TW9)',
    metaDescription:
      'Where to play padel in Richmond, London. Court listings, indoor and outdoor venues, and live booking availability in TW9 and TW10.',
    search: {
      kind: 'area',
      addressTerms: ['Richmond', 'Twickenham', 'Kew', 'Mortlake'],
      postcodePrefixes: ['TW9', 'TW10', 'TW1', 'TW2'],
      cityFallback: 'London',
    },
    hook:
      "Richmond's padel scene benefits from the same qualities that make the area itself so liveable: green space, transport links, and a population willing to spend on its leisure.",
    character:
      "Most venues are within walking distance of Richmond Station or the Twickenham side of the river. Outdoor courts here are genuinely usable in the warmer months thanks to the slightly more sheltered microclimate of the bend in the Thames. The vibe is less relentlessly competitive than central London — expect to be invited to a coffee after a match. Players come from across the western suburbs, and the level on weekday evenings is consistently high.",
    setting:
      "The listings below cover TW9, TW10 and the closer Twickenham postcodes. Live availability is shown where the venue uses Playtomic.",
    weather:
      "The Richmond bend in the Thames offers a mildly more sheltered climate than the rest of West London. Outdoor courts are usable from late April to early October; indoor courts are the year-round default.",
    beginner:
      "Several Richmond clubs run beginner-friendly group sessions, including some daytime options that suit the area's flexible-working crowd. Worth a look if you cannot face evening play.",
    closing:
      "Richmond is the kind of place where people end up living forever. Padel fits the rhythm of the neighbourhood as if it had always been there.",
    nearby: ['putney', 'wimbledon', 'clapham'],
  },
  {
    slug: 'brixton',
    name: 'Brixton',
    region: 'South London',
    metaTitle: 'Padel in Brixton — Courts, Clubs & Live Availability (SW2/SW9)',
    metaDescription:
      'Where to play padel in Brixton. SW2 and SW9 venues, community sessions, and live booking availability across South London.',
    search: {
      kind: 'area',
      addressTerms: ['Brixton', 'Loughborough Junction', 'Coldharbour', 'Herne Hill'],
      postcodePrefixes: ['SW2', 'SW9', 'SE24'],
      cityFallback: 'London',
    },
    hook:
      "Brixton's padel offering is younger than its more established South London neighbours, but the trajectory is steep.",
    character:
      "New venues have arrived in former industrial spaces around Loughborough Junction and Coldharbour Lane, and the existing clubs run regular community events that double as some of the friendliest entry points into the sport in the capital. The neighbourhood's music-and-market energy spills onto the courts. Player demographics here are broader than most other London padel scenes — a deliberate effect of the venues themselves, several of which run subsidised community sessions on weekday afternoons.",
    setting:
      "The listings below cover SW2, SW9 and the Herne Hill border. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the safe bet here. Outdoor options exist but are limited and tend to be summer-only.",
    beginner:
      "Brixton is one of the better London neighbourhoods to start playing padel as a complete beginner. Community sessions are advertised on Instagram more often than on the venues' own websites — worth following your local club.",
    closing:
      "Brixton's scene is still finding its shape, but the energy here is exactly what padel needs — informal, community-rooted, and willing to experiment.",
    nearby: ['clapham', 'putney', 'wimbledon', 'croydon'],
  },
  {
    slug: 'croydon',
    name: 'Croydon',
    region: 'South London',
    metaTitle: 'Padel in Croydon — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Croydon. CR0 venues, larger court counts, and live booking availability for South London and the Sussex line.',
    search: {
      kind: 'area',
      addressTerms: ['Croydon', 'Purley', 'Sutton', 'Wallington'],
      postcodePrefixes: ['CR0', 'CR2', 'CR8', 'SM1', 'SM5', 'SM6'],
      cityFallback: 'Croydon',
    },
    hook:
      "South London's biggest borough has wholeheartedly embraced padel — partly because the space exists here that simply does not exist closer to the centre.",
    character:
      "Venues are larger, court counts are higher, and parking is something you can take for granted. Croydon's accessibility from the Brighton-line stations makes it a popular meeting point for players coming up from the Sussex coast for organised sessions and tournaments. The standard of competitive play has risen noticeably in the past year, helped by an influx of players who used to drive into central London for their fix and have realised the alternative is on their doorstep.",
    setting:
      "The listings below cover the CR0 area and the closer Sutton and Purley postcodes. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Most Croydon venues offer indoor courts, which is the right choice for year-round play. Outdoor courts at the bigger clubs are useful in summer.",
    beginner:
      "The size of the Croydon clubs is a real advantage for beginners — there is more court time available, and the larger venues run more frequent intro sessions than their smaller central-London counterparts.",
    closing:
      "Croydon is the rare South London padel destination that plays at scale. Easy to recommend if you are tired of fighting for court time elsewhere.",
    nearby: ['brixton', 'clapham', 'wimbledon'],
  },
  {
    slug: 'reading',
    name: 'Reading',
    region: 'Berkshire',
    metaTitle: 'Padel in Reading — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Reading. Indoor venues, multi-sport clubs, and live booking availability in the Thames Valley.',
    search: { kind: 'city', value: 'Reading' },
    hook:
      'Reading sits at one of the most useful junctions in the UK — and its padel scene reflects that, drawing players from across the Thames Valley corridor.',
    character:
      "Local courts range from purpose-built indoor facilities to multi-sport clubs that have added a couple of courts to existing tennis sites. The audience skews professional — Reading's commuter belt and tech industry deliver a steady stream of players from London and the M4. Booking ahead is essential on weekday evenings, and the better venues have begun running members-only sessions to manage demand. Standards have climbed quickly: the gap between Reading and the central London clubs has narrowed considerably in the past year.",
    setting:
      "The venues below cover Reading and the immediate Berkshire surrounds. Each listing shows live availability where the club uses Playtomic.",
    weather:
      "Indoor courts dominate here, which keeps booking patterns stable through the year. Outdoor courts are a useful summer option but rarely the default.",
    beginner:
      "Several Reading clubs run weekly intro sessions and have rackets to hire. The midweek daytime sessions are particularly worth knowing about if you can dodge the evening rush.",
    closing:
      "Reading's padel scene is the quiet beneficiary of its location. Easier to reach than half of London and considerably easier to book.",
    nearby: ['oxford', 'hampshire', 'bournemouth'],
  },
  {
    slug: 'oxford',
    name: 'Oxford',
    region: 'Oxfordshire',
    metaTitle: 'Padel in Oxford — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Oxford. Court listings, college-town venues, and live booking availability across Oxfordshire.',
    search: { kind: 'city', value: 'Oxford' },
    hook:
      "Oxford's padel scene is small, well-mannered, and growing in the way most things in Oxford grow: slowly, deliberately, and around an existing college culture.",
    character:
      "A handful of venues serve the city and the ring of villages around it, with a couple of newer purpose-built facilities now drawing players from the Cotswolds and Buckinghamshire. The student population has not yet fully discovered padel — when it does, expect rapid expansion. For now, the local scene is dominated by post-graduate professionals and academics who want a sport that fits between meetings. Coaching is unusually thorough by national standards.",
    setting:
      "The listings below cover Oxford and the closer Oxfordshire towns. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the year-round default. The outdoor options are pleasant during the long summer evenings but rarely a reliable booking choice in winter.",
    beginner:
      "If you are new to padel and based in Oxford, look for the beginner clinics at the purpose-built venues — they tend to run weekly and provide rackets. The atmosphere is patient and instructive rather than competitive.",
    closing:
      "Oxford's padel scene will look very different in two years. For now, it is one of the more civilised places to learn the sport in southern England.",
    nearby: ['cambridge', 'reading', 'northampton'],
  },
  {
    slug: 'cambridge',
    name: 'Cambridge',
    region: 'Cambridgeshire',
    metaTitle: 'Padel in Cambridge — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Cambridge. Court listings, club culture, and live booking availability across Cambridgeshire.',
    search: { kind: 'city', value: 'Cambridge' },
    hook:
      "Cambridge's padel arrival has been quiet but increasingly insistent.",
    character:
      "A small but growing cluster of venues now serves the city and its science-park outskirts, which is where most of the demand is coming from. The courts attract the predictable mix of academics, tech workers, and ex-rowers looking for something they can do indoors when the Cam is unkind. Play standards have risen sharply in the past year, helped by an active local league. Bookings on weekday evenings are tighter than they look.",
    setting:
      "The listings below cover Cambridge and the immediate Cambridgeshire surrounds. Each venue's live availability is pulled from its booking platform.",
    weather:
      "Indoor courts dominate. The Fenland wind makes outdoor padel a brisk experience even in summer; most local players default to the indoor venues all year.",
    beginner:
      "The science-park venues run regular beginner sessions aimed at the local tech crowd. They tend to be daytime as well as evening — worth knowing if you have flexible working hours.",
    closing:
      "Cambridge has the demographic and the demand for a much bigger padel scene than it currently has. The next eighteen months should be interesting.",
    nearby: ['norwich', 'oxford', 'northampton'],
  },
  {
    slug: 'norwich',
    name: 'Norwich',
    region: 'Norfolk',
    metaTitle: 'Padel in Norwich — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Norwich. Court listings and live booking availability in Norfolk and the East of England.',
    search: { kind: 'city', value: 'Norwich' },
    hook:
      "Norfolk's only proper city has been an unlikely early adopter of padel, with a small but loyal local scene that punches well above its size.",
    character:
      "Most courts here sit close to the ring road or on the edges of the city, where space is easier to come by. The community is unusually welcoming — Norwich's distance from any other padel hub means new players are met with genuine enthusiasm rather than the polite indifference of busier scenes. Coastal day trips for tournaments at other East Anglia clubs are part of the local calendar, and the regulars know each other by name.",
    setting:
      "The listings below cover Norwich and the immediate Norfolk surrounds. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the safe choice. The exposed Norfolk wind is unforgiving in winter, and the better local venues have invested accordingly.",
    beginner:
      "If you are new to padel in Norwich, you are spoilt for choice on patient instruction. The local clubs are still small enough that beginners get real attention, which is harder to find in busier scenes.",
    closing:
      "Norwich's padel community is one of the friendlier in England. Worth supporting, and worth the trip if you are anywhere in East Anglia.",
    nearby: ['cambridge', 'leicester', 'northampton'],
  },
  {
    slug: 'leicester',
    name: 'Leicester',
    region: 'East Midlands',
    metaTitle: 'Padel in Leicester — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Leicester. Court listings, club nights, and live booking availability across the East Midlands.',
    search: { kind: 'city', value: 'Leicester' },
    hook:
      "Leicester's padel scene has expanded faster than most outsiders realise, helped by an active sporting community that has taken to the sport with enthusiasm.",
    character:
      "Several venues now operate across the city, with strong club nights and regular tournaments. Pricing is gentler than London — significantly so off-peak — and court availability remains generally good even during busy weeks. The competitive scene is on a sharp upward curve, with local players starting to make appearances at regional tournaments. Coaching has improved in step with demand.",
    setting:
      "The listings below cover Leicester and the closer Leicestershire towns. Each venue's live availability is shown where it uses Playtomic.",
    weather:
      "Indoor courts dominate, which is the right call for a Midlands city with no realistic year-round outdoor option.",
    beginner:
      "Leicester's larger clubs run frequent beginner sessions and have rackets to hire. The atmosphere is unusually welcoming for a competitive scene.",
    closing:
      "Leicester is one of the better East Midlands padel cities to live in right now. Good prices, growing depth, and a community that is genuinely pleased to see new players turning up.",
    nearby: ['coventry', 'northampton', 'sheffield'],
  },
  {
    slug: 'coventry',
    name: 'Coventry',
    region: 'West Midlands',
    metaTitle: 'Padel in Coventry — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Coventry. Court listings and live booking availability across the West Midlands.',
    search: { kind: 'city', value: 'Coventry' },
    hook:
      "Coventry's central location makes it a natural padel hub for the West Midlands — equidistant from Birmingham, Leicester and Northampton, and well served by rail.",
    character:
      "Local courts cater to a broad cross-section: students, post-work crowds, and players from the surrounding towns. Indoor venues dominate, which keeps play consistent through the year. Pricing, like most things in Coventry, is sensible. The local club nights are starting to draw regular travellers from the broader Midlands, which is a good sign for the scene's future.",
    setting:
      "The listings below cover Coventry and the closer West Midlands towns. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the year-round default. Outdoor options exist at one or two clubs and are useful in the summer months.",
    beginner:
      "Coventry's clubs are friendly and unintimidating, and most run beginner-focused sessions on weekday evenings. Rackets to hire are usually available.",
    closing:
      "Coventry is doing the unspectacular work of building a steady local scene. The result is one of the easier West Midlands cities to find a reliable game in.",
    nearby: ['leicester', 'northampton', 'sheffield'],
  },
  {
    slug: 'sheffield',
    name: 'Sheffield',
    region: 'South Yorkshire',
    metaTitle: 'Padel in Sheffield — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Sheffield. Court listings, club nights, and live booking availability across South Yorkshire.',
    search: { kind: 'city', value: 'Sheffield' },
    hook:
      "Steel City's padel scene mirrors Sheffield itself: practical, friendly, and with no time for affectation.",
    character:
      "A growing list of venues now operates across the city, with the strongest concentration in the western suburbs and around the Don Valley. Indoor courts dominate — and rightly so. The local club culture is unusually social, and most venues run regular mixers and Americano nights for players looking to find partners. Coaching has improved markedly in the past year, helped by a small group of players from the city's tennis clubs who took the sport seriously early.",
    setting:
      "The listings below cover Sheffield and the immediate South Yorkshire surrounds. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the year-round answer. The Peak District weather is not the friend of outdoor play.",
    beginner:
      "Sheffield's clubs are unusually welcoming to beginners, and several run rolling weekly sessions designed to take you from your first hit to competent doubles play. Rackets are almost always available to hire.",
    closing:
      "Sheffield is one of the better Northern padel cities — not yet on Manchester's scale, but pulling in the same direction with characteristic Sheffield understatement.",
    nearby: ['hull', 'middlesbrough', 'harrogate'],
  },
  {
    slug: 'hull',
    name: 'Hull',
    region: 'East Yorkshire',
    metaTitle: 'Padel in Hull — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Hull. Indoor venues and live booking availability across East Yorkshire.',
    search: { kind: 'city', value: 'Hull' },
    hook:
      "Hull's padel scene is small but determined.",
    character:
      "A handful of indoor venues serve the city and the surrounding East Yorkshire towns, with new courts arriving as demand builds. The local audience tends to come from the football and rugby league communities — players who want a competitive racquet sport that does not require the slow apprenticeship of tennis. The atmosphere is unfailingly welcoming, and the local clubs make a real effort to help new players find a regular game.",
    setting:
      "The listings below cover Hull and the immediate East Yorkshire surrounds. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are non-negotiable. The North Sea wind makes outdoor play in Hull a more theoretical idea than a practical one.",
    beginner:
      "Hull's clubs make a real effort with beginners. Most run weekly intro sessions; rackets are available to hire at the larger venues.",
    closing:
      "Hull is at the start of its padel curve. A good moment to get involved if you are local — the scene is small enough that every new player matters.",
    nearby: ['sheffield', 'middlesbrough', 'sunderland'],
  },
  {
    slug: 'middlesbrough',
    name: 'Middlesbrough',
    region: 'Tees Valley',
    metaTitle: 'Padel in Middlesbrough — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Middlesbrough. Indoor venues and live booking availability across the Tees Valley.',
    search: {
      kind: 'area',
      addressTerms: ['Middlesbrough', 'Stockton', 'Darlington', 'Redcar'],
      postcodePrefixes: ['TS1', 'TS2', 'TS3', 'TS4', 'TS5', 'TS17', 'TS18', 'DL1', 'DL3'],
      cityFallback: 'Middlesbrough',
    },
    hook:
      "The North East's quietly emerging padel hub.",
    character:
      "Middlesbrough and the surrounding Tees Valley towns have begun to add padel to their sporting menu, with new venues opening around Stockton, Darlington and the city itself. The community is small but growing fast, and beginner sessions are well-attended. Indoor courts are non-negotiable here — outdoor play in a Teesside winter is for the genuinely committed. Local players know each other, which makes finding partners almost embarrassingly easy.",
    setting:
      "The listings below cover Middlesbrough and the wider Tees Valley. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the year-round answer. The North East coast is not the place to test your tolerance for outdoor padel.",
    beginner:
      "If you are starting out, the local clubs are the most welcoming you will find north of York. Beginner sessions are advertised weekly and rackets are available to hire.",
    closing:
      "Middlesbrough is doing the unspectacular work of building a real local scene. An easy place to recommend if you live anywhere in the Tees Valley.",
    nearby: ['sunderland', 'hull', 'sheffield'],
  },
  {
    slug: 'sunderland',
    name: 'Sunderland',
    region: 'Tyne and Wear',
    metaTitle: 'Padel in Sunderland — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Sunderland. Indoor venues and live booking availability in Tyne and Wear.',
    search: {
      kind: 'area',
      addressTerms: ['Sunderland', 'Washington', 'Seaham', 'Houghton'],
      postcodePrefixes: ['SR1', 'SR2', 'SR3', 'SR4', 'SR5', 'SR6', 'SR7', 'SR8', 'NE38'],
      cityFallback: 'Sunderland',
    },
    hook:
      'Sunderland sits at the northern edge of the English padel map, but the sport has begun to land here too.',
    character:
      "New venues have opened in and around the city, drawing players from across Tyne and Wear and South Northumberland. The local scene is small enough that everyone tends to know everyone — which is no bad thing if you are new to the sport and want to find regular playing partners. Indoor courts dominate, and the better venues now run a full programme of beginner sessions, club nights and weekend tournaments.",
    setting:
      "The listings below cover Sunderland and the closer Wearside surrounds. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the only realistic year-round option. The North East coast does what it does, and the better venues are built for it.",
    beginner:
      "Sunderland's clubs are small and welcoming, which makes them good for nervous first-time players. Rackets to hire are standard.",
    closing:
      "Sunderland's padel scene is at its very early stages. The next year or two will be telling — and the local clubs are doing exactly the right things to make it work.",
    nearby: ['middlesbrough', 'hull', 'sheffield'],
  },
  {
    slug: 'exeter',
    name: 'Exeter',
    region: 'Devon',
    metaTitle: 'Padel in Exeter — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Exeter. Court listings and live booking availability across Devon and the South West.',
    search: { kind: 'city', value: 'Exeter' },
    hook:
      "Exeter is Devon's quiet padel pioneer — a city of manageable size with a growing cluster of courts and a player base that takes the sport seriously without taking itself seriously.",
    character:
      "A small number of venues now serve the city and the surrounding villages, with players travelling from Tiverton, Honiton and the South Hams for regular sessions. The South West climate makes outdoor courts viable for much of the year, though the better venues offer covered options for the inevitable Atlantic weather. The community is one of the friendliest in England — partly because the scene is still small enough that everyone has skin in the game.",
    setting:
      "The listings below cover Exeter and the immediate Devon surrounds. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Devon enjoys one of the longer outdoor padel seasons in England. Even so, indoor and covered courts are the year-round default — Atlantic squalls are not negotiable.",
    beginner:
      "Exeter's clubs are unusually welcoming to beginners, and most run weekly intro sessions designed for first-timers. Rackets to hire are standard.",
    closing:
      "Exeter is exactly the kind of South West city that should work well for padel: walkable, well-connected, and full of people who like an excuse to be outside.",
    nearby: ['plymouth', 'bournemouth', 'cardiff'],
  },
  {
    slug: 'plymouth',
    name: 'Plymouth',
    region: 'Devon',
    metaTitle: 'Padel in Plymouth — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Plymouth. Court listings and live booking availability across South Devon.',
    search: { kind: 'city', value: 'Plymouth' },
    hook:
      "Plymouth's padel arrival has been slow but steady.",
    character:
      "A small selection of venues serves the city and its naval-base outskirts, with new courts arriving as Devon's broader padel boom catches up to the South Coast. The local scene is unpretentious and welcoming — typical Plymouth. Indoor and covered courts are particularly important here, given the prevailing Atlantic weather. The standard of play is climbing as more players take the sport seriously enough to seek out coaching.",
    setting:
      "The listings below cover Plymouth and the closer South Devon surrounds. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor and covered courts are the safe bet. Plymouth's coastal weather is pleasant in summer and unpredictable for the other nine months.",
    beginner:
      "Plymouth's clubs are small and welcoming. Beginner sessions are usually advertised on the venue Instagram pages — worth following whichever club is nearest you.",
    closing:
      "Plymouth is at the start of its padel story. An easy recommendation for anyone in South Devon looking for an indoor sport that does not demand a long apprenticeship.",
    nearby: ['exeter', 'bournemouth', 'cardiff'],
  },
  {
    slug: 'bournemouth',
    name: 'Bournemouth',
    region: 'Dorset',
    metaTitle: 'Padel in Bournemouth — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Bournemouth. Court listings, outdoor venues, and live booking availability across the Dorset coast.',
    search: {
      kind: 'area',
      addressTerms: ['Bournemouth', 'Poole', 'Christchurch', 'Ferndown'],
      postcodePrefixes: ['BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'BH6', 'BH7', 'BH8', 'BH9', 'BH10', 'BH11', 'BH12', 'BH13', 'BH14', 'BH15', 'BH22', 'BH23'],
      cityFallback: 'Bournemouth',
    },
    hook:
      "Bournemouth was always going to be an early padel town — the climate, the demographic, and the surfeit of leisure infrastructure made it inevitable.",
    character:
      "Multiple venues now serve the town and the wider Christchurch–Poole conurbation, with strong outdoor offerings during the long South Coast season. The audience is a mix of retirees who took up padel in Spain and younger players who discovered it locally during lockdown. Booking ahead remains essential on summer weekends. Standards are higher than the size of the town would suggest — partly because of the steady stream of expat players returning from the Costa del Sol.",
    setting:
      "The listings below cover Bournemouth, Poole and Christchurch. Live availability is shown where the venue uses Playtomic.",
    weather:
      "The South Coast climate makes Bournemouth one of the few English towns where outdoor padel is genuinely viable for most of the year. Even so, the better clubs offer indoor or covered courts to insure against the wetter months.",
    beginner:
      "Bournemouth's clubs are well-established and run regular beginner programmes. Worth booking onto a coaching block rather than trying to teach yourself — the local standard is high enough that ad-hoc play can be discouraging at first.",
    closing:
      "Bournemouth's padel scene feels older and more confident than most. If you are new to the South Coast and want to find a sport quickly, this is the easiest way in.",
    nearby: ['hampshire', 'reading', 'exeter'],
  },
  {
    slug: 'cardiff',
    name: 'Cardiff',
    region: 'Wales',
    metaTitle: 'Padel in Cardiff — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Cardiff. Court listings and live booking availability across the Welsh capital.',
    search: { kind: 'city', value: 'Cardiff' },
    hook:
      'Cardiff has emerged as the unambiguous capital of Welsh padel.',
    character:
      "Multiple venues now operate across the city, with new courts arriving as cross-border demand from Bristol and the Severn corridor pushes capacity. The local club culture is strong, and the standard of play has risen markedly in the past year. Indoor courts are well-served, and outdoor play is more viable than the Welsh weather reputation might suggest. Cardiff's geography — close to the M4 and the Severn crossing — makes it a natural meeting point for players from across South Wales and the West Country.",
    setting:
      "The listings below cover Cardiff and the immediate South Wales surrounds. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the year-round default, but Cardiff's coastal influence means outdoor play is more practical here than in most of Wales.",
    beginner:
      "Cardiff's larger clubs run regular beginner sessions and have an established coaching infrastructure. If you are new to padel and live anywhere in South Wales, this is the easiest place to start.",
    closing:
      "Cardiff is the most developed padel city in Wales by a significant margin. Worth the trip from anywhere in the country if your local courts are full.",
    nearby: ['exeter', 'plymouth', 'bournemouth'],
  },
  {
    slug: 'edinburgh',
    name: 'Edinburgh',
    region: 'Scotland',
    metaTitle: 'Padel in Edinburgh — Courts, Clubs & Live Availability',
    metaDescription:
      'Where to play padel in Edinburgh. Court listings, indoor venues, and live booking availability across the Scottish capital.',
    search: { kind: 'city', value: 'Edinburgh' },
    hook:
      "Edinburgh was Scotland's first proper padel city, and its scene continues to mature — quietly, deliberately, and with the seriousness you would expect of the place.",
    character:
      "Several venues now serve the city and its commuter towns, with indoor courts dominating for the obvious reasons. Player standards are higher than in any other Scottish city, helped by an established competitive circuit and a steady stream of players coming through from tennis backgrounds. Expect to wait for a court on weekday evenings. The local clubs run a full calendar of mixers, league nights and weekend tournaments — more organised than most of England outside London.",
    setting:
      "The listings below cover Edinburgh and the immediate Lothians. Live availability is shown where the venue uses Playtomic.",
    weather:
      "Indoor courts are the year-round answer. Edinburgh's wind makes outdoor padel a more theoretical proposition than a practical one.",
    beginner:
      "Edinburgh's clubs run weekly beginner sessions and have an established coaching scene. The standard of play is high enough that proper instruction is the right starting point.",
    closing:
      "Edinburgh is the most developed padel city in Scotland by a clear margin. A good place to be a serious player; an even better place to learn under proper coaching.",
    nearby: ['harrogate', 'middlesbrough', 'sunderland'],
  },
];

export const CITY_GUIDE_SLUGS = CITY_GUIDES.map(c => c.slug);
