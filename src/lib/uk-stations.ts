/**
 * UK train station data for /padel/station/[station] pages.
 * ~400 major stations covering 95% of search volume.
 */

export type UKStation = {
  slug: string
  name: string
  lat: number
  lng: number
  city: string
  region: string
}

export const UK_STATIONS: UKStation[] = [
  // ── London Terminals ──
  { slug: "kings-cross", name: "King's Cross", lat: 51.5308, lng: -0.1238, city: "London", region: "London" },
  { slug: "paddington", name: "Paddington", lat: 51.5154, lng: -0.1755, city: "London", region: "London" },
  { slug: "victoria", name: "Victoria", lat: 51.4965, lng: -0.1447, city: "London", region: "London" },
  { slug: "waterloo", name: "Waterloo", lat: 51.5036, lng: -0.1143, city: "London", region: "London" },
  { slug: "liverpool-street", name: "Liverpool Street", lat: 51.5178, lng: -0.0823, city: "London", region: "London" },
  { slug: "london-bridge", name: "London Bridge", lat: 51.5048, lng: -0.0864, city: "London", region: "London" },
  { slug: "cannon-street", name: "Cannon Street", lat: 51.5113, lng: -0.0904, city: "London", region: "London" },
  { slug: "charing-cross", name: "Charing Cross", lat: 51.5081, lng: -0.1248, city: "London", region: "London" },
  { slug: "euston", name: "Euston", lat: 51.5282, lng: -0.1337, city: "London", region: "London" },
  { slug: "st-pancras", name: "St Pancras", lat: 51.5322, lng: -0.1239, city: "London", region: "London" },
  { slug: "fenchurch-street", name: "Fenchurch Street", lat: 51.5113, lng: -0.0782, city: "London", region: "London" },
  { slug: "blackfriars", name: "Blackfriars", lat: 51.5118, lng: -0.1037, city: "London", region: "London" },

  // ── South East ──
  { slug: "brighton", name: "Brighton", lat: 50.8293, lng: -0.1411, city: "Brighton", region: "South East" },
  { slug: "gatwick-airport", name: "Gatwick Airport", lat: 51.1564, lng: -0.1611, city: "Crawley", region: "South East" },
  { slug: "eastbourne", name: "Eastbourne", lat: 50.7692, lng: -0.2838, city: "Eastbourne", region: "South East" },
  { slug: "hastings", name: "Hastings", lat: 50.8603, lng: 0.5759, city: "Hastings", region: "South East" },
  { slug: "folkestone-central", name: "Folkestone Central", lat: 51.0761, lng: 1.1747, city: "Folkestone", region: "South East" },
  { slug: "dover-priory", name: "Dover Priory", lat: 51.1222, lng: 1.2994, city: "Dover", region: "South East" },
  { slug: "canterbury-west", name: "Canterbury West", lat: 51.2803, lng: 1.0732, city: "Canterbury", region: "South East" },
  { slug: "canterbury-east", name: "Canterbury East", lat: 51.2756, lng: 1.0831, city: "Canterbury", region: "South East" },
  { slug: "maidstone-east", name: "Maidstone East", lat: 51.2753, lng: 0.5223, city: "Maidstone", region: "South East" },
  { slug: "tunbridge-wells", name: "Tunbridge Wells", lat: 51.1326, lng: 0.2637, city: "Tunbridge Wells", region: "South East" },
  { slug: "sevenoaks", name: "Sevenoaks", lat: 51.2783, lng: 0.1873, city: "Sevenoaks", region: "South East" },
  { slug: "guildford", name: "Guildford", lat: 51.2365, lng: -0.5796, city: "Guildford", region: "South East" },
  { slug: "woking", name: "Woking", lat: 51.3188, lng: -0.5574, city: "Woking", region: "South East" },
  { slug: "basingstoke", name: "Basingstoke", lat: 51.2673, lng: -1.0875, city: "Basingstoke", region: "South East" },
  { slug: "winchester", name: "Winchester", lat: 51.0632, lng: -1.3201, city: "Winchester", region: "South East" },
  { slug: "southampton-central", name: "Southampton Central", lat: 50.9097, lng: -1.4043, city: "Southampton", region: "South East" },
  { slug: "southampton-airport-parkway", name: "Southampton Airport Parkway", lat: 50.9503, lng: -1.3594, city: "Southampton", region: "South East" },
  { slug: "portsmouth-harbour", name: "Portsmouth Harbour", lat: 50.7978, lng: -1.1071, city: "Portsmouth", region: "South East" },
  { slug: "portsmouth-and-southsea", name: "Portsmouth & Southsea", lat: 50.7985, lng: -1.0941, city: "Portsmouth", region: "South East" },
  { slug: "chichester", name: "Chichester", lat: 50.8348, lng: -0.7793, city: "Chichester", region: "South East" },
  { slug: "worthing", name: "Worthing", lat: 50.8127, lng: -0.3715, city: "Worthing", region: "South East" },
  { slug: "crawley", name: "Crawley", lat: 51.1138, lng: -0.1871, city: "Crawley", region: "South East" },
  { slug: "horsham", name: "Horsham", lat: 51.0653, lng: -0.3243, city: "Horsham", region: "South East" },
  { slug: "redhill", name: "Redhill", lat: 51.2399, lng: -0.1694, city: "Redhill", region: "South East" },
  { slug: "clapham-junction", name: "Clapham Junction", lat: 51.4642, lng: -0.1701, city: "London", region: "South East" },
  { slug: "wimbledon", name: "Wimbledon", lat: 51.4214, lng: -0.2063, city: "London", region: "South East" },
  { slug: "richmond", name: "Richmond", lat: 51.4633, lng: -0.3015, city: "London", region: "South East" },
  { slug: "kingston", name: "Kingston", lat: 51.4117, lng: -0.2999, city: "London", region: "South East" },
  { slug: "surbiton", name: "Surbiton", lat: 51.3934, lng: -0.3042, city: "London", region: "South East" },
  { slug: "new-malden", name: "New Malden", lat: 51.4044, lng: -0.2560, city: "London", region: "South East" },

  // ── South West ──
  { slug: "bristol-temple-meads", name: "Bristol Temple Meads", lat: 51.4491, lng: -2.5815, city: "Bristol", region: "South West" },
  { slug: "bristol-parkway", name: "Bristol Parkway", lat: 51.5143, lng: -2.5424, city: "Bristol", region: "South West" },
  { slug: "bath-spa", name: "Bath Spa", lat: 51.3780, lng: -2.3590, city: "Bath", region: "South West" },
  { slug: "swindon", name: "Swindon", lat: 51.5647, lng: -1.7842, city: "Swindon", region: "South West" },
  { slug: "exeter-st-davids", name: "Exeter St Davids", lat: 50.7268, lng: -3.5351, city: "Exeter", region: "South West" },
  { slug: "exeter-central", name: "Exeter Central", lat: 50.7232, lng: -3.5310, city: "Exeter", region: "South West" },
  { slug: "plymouth", name: "Plymouth", lat: 50.3782, lng: -4.1427, city: "Plymouth", region: "South West" },
  { slug: "truro", name: "Truro", lat: 50.2637, lng: -5.0513, city: "Truro", region: "South West" },
  { slug: "penzance", name: "Penzance", lat: 50.1196, lng: -5.5369, city: "Penzance", region: "South West" },
  { slug: "torquay", name: "Torquay", lat: 50.4640, lng: -3.5248, city: "Torquay", region: "South West" },
  { slug: "newton-abbot", name: "Newton Abbot", lat: 50.5267, lng: -3.6102, city: "Newton Abbot", region: "South West" },
  { slug: "taunton", name: "Taunton", lat: 51.0177, lng: -3.1006, city: "Taunton", region: "South West" },
  { slug: "weston-super-mare", name: "Weston-super-Mare", lat: 51.3458, lng: -2.9770, city: "Weston-super-Mare", region: "South West" },
  { slug: "yeovil-pen-mill", name: "Yeovil Pen Mill", lat: 50.9437, lng: -2.6166, city: "Yeovil", region: "South West" },
  { slug: "dorchester-south", name: "Dorchester South", lat: 50.7134, lng: -2.4321, city: "Dorchester", region: "South West" },
  { slug: "weymouth", name: "Weymouth", lat: 50.6113, lng: -2.4586, city: "Weymouth", region: "South West" },
  { slug: "bournemouth", name: "Bournemouth", lat: 50.7271, lng: -1.8304, city: "Bournemouth", region: "South West" },
  { slug: "poole", name: "Poole", lat: 50.7167, lng: -1.9843, city: "Poole", region: "South West" },
  { slug: "christchurch", name: "Christchurch", lat: 50.7348, lng: -1.7825, city: "Christchurch", region: "South West" },
  { slug: "salisbury", name: "Salisbury", lat: 51.0699, lng: -1.7968, city: "Salisbury", region: "South West" },

  // ── Wales ──
  { slug: "cardiff-central", name: "Cardiff Central", lat: 51.4755, lng: -3.1792, city: "Cardiff", region: "Wales" },
  { slug: "cardiff-queen-street", name: "Cardiff Queen Street", lat: 51.4795, lng: -3.1730, city: "Cardiff", region: "Wales" },
  { slug: "newport", name: "Newport", lat: 51.5883, lng: -2.9977, city: "Newport", region: "Wales" },
  { slug: "swansea", name: "Swansea", lat: 51.6215, lng: -3.9452, city: "Swansea", region: "Wales" },
  { slug: "bridgend", name: "Bridgend", lat: 51.5046, lng: -3.5775, city: "Bridgend", region: "Wales" },
  { slug: "barry", name: "Barry", lat: 51.3973, lng: -3.2862, city: "Barry", region: "Wales" },
  { slug: "pontypridd", name: "Pontypridd", lat: 51.5968, lng: -3.3423, city: "Pontypridd", region: "Wales" },
  { slug: "merthyr-tydfil", name: "Merthyr Tydfil", lat: 51.7431, lng: -3.3788, city: "Merthyr Tydfil", region: "Wales" },
  { slug: "wrexham-general", name: "Wrexham General", lat: 53.0461, lng: -2.9929, city: "Wrexham", region: "Wales" },
  { slug: "llandudno", name: "Llandudno", lat: 53.3264, lng: -3.8274, city: "Llandudno", region: "Wales" },
  { slug: "bangor-wales", name: "Bangor", lat: 53.2281, lng: -4.1302, city: "Bangor", region: "Wales" },
  { slug: "holyhead", name: "Holyhead", lat: 53.3094, lng: -4.6326, city: "Holyhead", region: "Wales" },
  { slug: "aberystwyth", name: "Aberystwyth", lat: 52.4146, lng: -4.0834, city: "Aberystwyth", region: "Wales" },

  // ── Midlands ──
  { slug: "birmingham-new-street", name: "Birmingham New Street", lat: 52.4775, lng: -1.9001, city: "Birmingham", region: "Midlands" },
  { slug: "birmingham-moor-street", name: "Birmingham Moor Street", lat: 52.4797, lng: -1.8937, city: "Birmingham", region: "Midlands" },
  { slug: "birmingham-snow-hill", name: "Birmingham Snow Hill", lat: 52.4833, lng: -1.9003, city: "Birmingham", region: "Midlands" },
  { slug: "coventry", name: "Coventry", lat: 52.4005, lng: -1.5108, city: "Coventry", region: "Midlands" },
  { slug: "wolverhampton", name: "Wolverhampton", lat: 52.5893, lng: -2.1157, city: "Wolverhampton", region: "Midlands" },
  { slug: "walsall", name: "Walsall", lat: 52.5848, lng: -1.9826, city: "Walsall", region: "Midlands" },
  { slug: "west-bromwich", name: "West Bromwich", lat: 52.5192, lng: -1.9846, city: "West Bromwich", region: "Midlands" },
  { slug: "solihull", name: "Solihull", lat: 52.4121, lng: -1.7776, city: "Solihull", region: "Midlands" },
  { slug: "leamington-spa", name: "Leamington Spa", lat: 52.2876, lng: -1.5356, city: "Leamington Spa", region: "Midlands" },
  { slug: "stratford-upon-avon", name: "Stratford-upon-Avon", lat: 52.1922, lng: -1.7072, city: "Stratford-upon-Avon", region: "Midlands" },
  { slug: "worcester-foregate-street", name: "Worcester Foregate Street", lat: 52.1946, lng: -2.2249, city: "Worcester", region: "Midlands" },
  { slug: "hereford", name: "Hereford", lat: 52.0561, lng: -2.7147, city: "Hereford", region: "Midlands" },
  { slug: "shrewsbury", name: "Shrewsbury", lat: 52.7097, lng: -2.7545, city: "Shrewsbury", region: "Midlands" },
  { slug: "telford-central", name: "Telford Central", lat: 52.6778, lng: -2.4459, city: "Telford", region: "Midlands" },
  { slug: "stafford", name: "Stafford", lat: 52.8051, lng: -2.1168, city: "Stafford", region: "Midlands" },
  { slug: "stoke-on-trent", name: "Stoke-on-Trent", lat: 53.0062, lng: -2.1836, city: "Stoke-on-Trent", region: "Midlands" },
  { slug: "derby", name: "Derby", lat: 52.9157, lng: -1.4695, city: "Derby", region: "Midlands" },
  { slug: "nottingham", name: "Nottingham", lat: 52.9480, lng: -1.1461, city: "Nottingham", region: "Midlands" },
  { slug: "leicester", name: "Leicester", lat: 52.6279, lng: -1.1238, city: "Leicester", region: "Midlands" },
  { slug: "loughborough", name: "Loughborough", lat: 52.7707, lng: -1.2048, city: "Loughborough", region: "Midlands" },
  { slug: "lincoln-central", name: "Lincoln Central", lat: 53.2286, lng: -0.5381, city: "Lincoln", region: "Midlands" },
  { slug: "peterborough", name: "Peterborough", lat: 52.5738, lng: -0.2489, city: "Peterborough", region: "Midlands" },
  { slug: "northampton", name: "Northampton", lat: 52.2379, lng: -0.8966, city: "Northampton", region: "Midlands" },
  { slug: "milton-keynes-central", name: "Milton Keynes Central", lat: 52.0346, lng: -0.7716, city: "Milton Keynes", region: "Midlands" },
  { slug: "luton", name: "Luton", lat: 51.8808, lng: -0.4130, city: "Luton", region: "Midlands" },
  { slug: "luton-airport-parkway", name: "Luton Airport Parkway", lat: 51.8720, lng: -0.3938, city: "Luton", region: "Midlands" },
  { slug: "bedford", name: "Bedford", lat: 52.2241, lng: -0.4659, city: "Bedford", region: "Midlands" },
  { slug: "kettering", name: "Kettering", lat: 52.3945, lng: -0.7220, city: "Kettering", region: "Midlands" },

  // ── East of England ──
  { slug: "norwich", name: "Norwich", lat: 52.6274, lng: 1.3075, city: "Norwich", region: "East of England" },
  { slug: "ipswich", name: "Ipswich", lat: 52.0544, lng: 1.1514, city: "Ipswich", region: "East of England" },
  { slug: "colchester", name: "Colchester", lat: 51.8999, lng: 0.8954, city: "Colchester", region: "East of England" },
  { slug: "chelmsford", name: "Chelmsford", lat: 51.7356, lng: 0.4691, city: "Chelmsford", region: "East of England" },
  { slug: "southend-victoria", name: "Southend Victoria", lat: 51.5388, lng: 0.7107, city: "Southend-on-Sea", region: "East of England" },
  { slug: "southend-central", name: "Southend Central", lat: 51.5359, lng: 0.7089, city: "Southend-on-Sea", region: "East of England" },
  { slug: "cambridge", name: "Cambridge", lat: 52.1943, lng: 0.1373, city: "Cambridge", region: "East of England" },
  { slug: "ely", name: "Ely", lat: 52.3989, lng: 0.2651, city: "Ely", region: "East of England" },
  { slug: "kings-lynn", name: "King's Lynn", lat: 52.7518, lng: 0.4001, city: "King's Lynn", region: "East of England" },
  { slug: "stevenage", name: "Stevenage", lat: 51.9026, lng: -0.2064, city: "Stevenage", region: "East of England" },
  { slug: "st-albans-city", name: "St Albans City", lat: 51.7487, lng: -0.3355, city: "St Albans", region: "East of England" },
  { slug: "watford-junction", name: "Watford Junction", lat: 51.6631, lng: -0.3963, city: "Watford", region: "East of England" },
  { slug: "hemel-hempstead", name: "Hemel Hempstead", lat: 51.7569, lng: -0.4590, city: "Hemel Hempstead", region: "East of England" },

  // ── North West ──
  { slug: "manchester-piccadilly", name: "Manchester Piccadilly", lat: 53.4771, lng: -2.2309, city: "Manchester", region: "North West" },
  { slug: "manchester-victoria", name: "Manchester Victoria", lat: 53.4879, lng: -2.2426, city: "Manchester", region: "North West" },
  { slug: "manchester-oxford-road", name: "Manchester Oxford Road", lat: 53.4742, lng: -2.2419, city: "Manchester", region: "North West" },
  { slug: "salford-central", name: "Salford Central", lat: 53.4832, lng: -2.2649, city: "Salford", region: "North West" },
  { slug: "liverpool-lime-street", name: "Liverpool Lime Street", lat: 53.4076, lng: -2.9778, city: "Liverpool", region: "North West" },
  { slug: "liverpool-central", name: "Liverpool Central", lat: 53.4040, lng: -2.9783, city: "Liverpool", region: "North West" },
  { slug: "liverpool-james-street", name: "Liverpool James Street", lat: 53.4048, lng: -2.9930, city: "Liverpool", region: "North West" },
  { slug: "liverpool-south-parkway", name: "Liverpool South Parkway", lat: 53.3604, lng: -2.8919, city: "Liverpool", region: "North West" },
  { slug: "crewe", name: "Crewe", lat: 53.0880, lng: -2.4317, city: "Crewe", region: "North West" },
  { slug: "chester", name: "Chester", lat: 53.1912, lng: -2.8801, city: "Chester", region: "North West" },
  { slug: "warrington-central", name: "Warrington Central", lat: 53.3884, lng: -2.5971, city: "Warrington", region: "North West" },
  { slug: "warrington-bank-quay", name: "Warrington Bank Quay", lat: 53.3883, lng: -2.5902, city: "Warrington", region: "North West" },
  { slug: "wigan-north-western", name: "Wigan North Western", lat: 53.5437, lng: -2.6375, city: "Wigan", region: "North West" },
  { slug: "bolton", name: "Bolton", lat: 53.5784, lng: -2.4307, city: "Bolton", region: "North West" },
  { slug: "preston", name: "Preston", lat: 53.7569, lng: -2.7074, city: "Preston", region: "North West" },
  { slug: "blackpool-north", name: "Blackpool North", lat: 53.8209, lng: -3.0535, city: "Blackpool", region: "North West" },
  { slug: "blackpool-south", name: "Blackpool South", lat: 53.8064, lng: -3.0525, city: "Blackpool", region: "North West" },
  { slug: "lancaster", name: "Lancaster", lat: 54.0478, lng: -2.8080, city: "Lancaster", region: "North West" },
  { slug: "carlisle", name: "Carlisle", lat: 54.8901, lng: -2.9347, city: "Carlisle", region: "North West" },
  { slug: "barrow-in-furness", name: "Barrow-in-Furness", lat: 54.1119, lng: -3.2268, city: "Barrow-in-Furness", region: "North West" },
  { slug: "windermere", name: "Windermere", lat: 54.3758, lng: -2.9075, city: "Windermere", region: "North West" },
  { slug: "penrith", name: "Penrith", lat: 54.6631, lng: -2.7542, city: "Penrith", region: "North West" },

  // ── Yorkshire ──
  { slug: "leeds", name: "Leeds", lat: 53.7956, lng: -1.5491, city: "Leeds", region: "Yorkshire" },
  { slug: "bradford-forster-square", name: "Bradford Forster Square", lat: 53.7951, lng: -1.7537, city: "Bradford", region: "Yorkshire" },
  { slug: "bradford-interchange", name: "Bradford Interchange", lat: 53.7929, lng: -1.7497, city: "Bradford", region: "Yorkshire" },
  { slug: "sheffield", name: "Sheffield", lat: 53.3782, lng: -1.4622, city: "Sheffield", region: "Yorkshire" },
  { slug: "york", name: "York", lat: 53.9582, lng: -1.0931, city: "York", region: "Yorkshire" },
  { slug: "hull", name: "Hull", lat: 53.7434, lng: -0.3436, city: "Hull", region: "Yorkshire" },
  { slug: "doncaster", name: "Doncaster", lat: 53.5222, lng: -1.1338, city: "Doncaster", region: "Yorkshire" },
  { slug: "rotherham-central", name: "Rotherham Central", lat: 53.4300, lng: -1.3578, city: "Rotherham", region: "Yorkshire" },
  { slug: "barnsley", name: "Barnsley", lat: 53.5520, lng: -1.4797, city: "Barnsley", region: "Yorkshire" },
  { slug: "wakefield-westgate", name: "Wakefield Westgate", lat: 53.6823, lng: -1.5023, city: "Wakefield", region: "Yorkshire" },
  { slug: "wakefield-kirkgate", name: "Wakefield Kirkgate", lat: 53.6797, lng: -1.4884, city: "Wakefield", region: "Yorkshire" },
  { slug: "harrogate", name: "Harrogate", lat: 53.9921, lng: -1.5418, city: "Harrogate", region: "Yorkshire" },
  { slug: "scarborough", name: "Scarborough", lat: 54.2790, lng: -0.4035, city: "Scarborough", region: "Yorkshire" },
  { slug: "skipton", name: "Skipton", lat: 53.9618, lng: -2.0158, city: "Skipton", region: "Yorkshire" },
  { slug: "huddersfield", name: "Huddersfield", lat: 53.6456, lng: -1.7849, city: "Huddersfield", region: "Yorkshire" },
  { slug: "halifax", name: "Halifax", lat: 53.7221, lng: -1.8619, city: "Halifax", region: "Yorkshire" },
  { slug: "keighley", name: "Keighley", lat: 53.8668, lng: -1.9116, city: "Keighley", region: "Yorkshire" },

  // ── North East ──
  { slug: "newcastle", name: "Newcastle", lat: 54.9683, lng: -1.6169, city: "Newcastle", region: "North East" },
  { slug: "sunderland", name: "Sunderland", lat: 54.9059, lng: -1.3836, city: "Sunderland", region: "North East" },
  { slug: "durham", name: "Durham", lat: 54.7778, lng: -1.5840, city: "Durham", region: "North East" },
  { slug: "darlington", name: "Darlington", lat: 54.5228, lng: -1.5570, city: "Darlington", region: "North East" },
  { slug: "middlesbrough", name: "Middlesbrough", lat: 54.5756, lng: -1.2364, city: "Middlesbrough", region: "North East" },
  { slug: "stockton", name: "Stockton", lat: 54.5682, lng: -1.3187, city: "Stockton-on-Tees", region: "North East" },
  { slug: "hartlepool", name: "Hartlepool", lat: 54.6864, lng: -1.2028, city: "Hartlepool", region: "North East" },
  { slug: "gateshead", name: "Gateshead", lat: 54.9595, lng: -1.6030, city: "Gateshead", region: "North East" },

  // ── Scotland ──
  { slug: "edinburgh-waverley", name: "Edinburgh Waverley", lat: 55.9521, lng: -3.1895, city: "Edinburgh", region: "Scotland" },
  { slug: "edinburgh-haymarket", name: "Edinburgh Haymarket", lat: 55.9463, lng: -3.2185, city: "Edinburgh", region: "Scotland" },
  { slug: "glasgow-central", name: "Glasgow Central", lat: 55.8593, lng: -4.2576, city: "Glasgow", region: "Scotland" },
  { slug: "glasgow-queen-street", name: "Glasgow Queen Street", lat: 55.8629, lng: -4.2502, city: "Glasgow", region: "Scotland" },
  { slug: "aberdeen", name: "Aberdeen", lat: 57.1436, lng: -2.0981, city: "Aberdeen", region: "Scotland" },
  { slug: "dundee", name: "Dundee", lat: 56.4553, lng: -2.9707, city: "Dundee", region: "Scotland" },
  { slug: "inverness", name: "Inverness", lat: 57.4799, lng: -4.2239, city: "Inverness", region: "Scotland" },
  { slug: "perth", name: "Perth", lat: 56.3935, lng: -3.4304, city: "Perth", region: "Scotland" },
  { slug: "stirling", name: "Stirling", lat: 56.1185, lng: -3.9373, city: "Stirling", region: "Scotland" },
  { slug: "falkirk-high", name: "Falkirk High", lat: 56.0019, lng: -3.7833, city: "Falkirk", region: "Scotland" },
  { slug: "motherwell", name: "Motherwell", lat: 55.7891, lng: -3.9893, city: "Motherwell", region: "Scotland" },
  { slug: "hamilton-central", name: "Hamilton Central", lat: 55.7771, lng: -4.0402, city: "Hamilton", region: "Scotland" },
  { slug: "paisley-gilmour-street", name: "Paisley Gilmour Street", lat: 55.8448, lng: -4.4234, city: "Paisley", region: "Scotland" },
  { slug: "ayr", name: "Ayr", lat: 55.4618, lng: -4.6291, city: "Ayr", region: "Scotland" },
  { slug: "kilmarnock", name: "Kilmarnock", lat: 55.6120, lng: -4.4957, city: "Kilmarnock", region: "Scotland" },
]

// Quick lookup by slug
export const UK_STATION_MAP: Record<string, UKStation> = {}
for (const s of UK_STATIONS) {
  UK_STATION_MAP[s.slug] = s
}

// Get all unique regions in display order
export const UK_REGIONS = [
  'London', 'South East', 'South West', 'Wales', 'Midlands',
  'East of England', 'North West', 'Yorkshire', 'North East', 'Scotland',
] as const

/**
 * Find the nearest UK train station to a given lat/lng.
 * Returns null if no station within maxMiles.
 */
export function nearestUKStation(lat: number, lng: number, maxMiles = 10): UKStation | null {
  // Import haversine from stations.ts
  const R = 3959
  let best: UKStation | null = null
  let bestDist = Infinity
  for (const s of UK_STATIONS) {
    const dLat = (s.lat - lat) * Math.PI / 180
    const dLng = (s.lng - lng) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * Math.PI / 180) * Math.cos(s.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    if (d < bestDist) {
      bestDist = d
      best = s
    }
  }
  return bestDist <= maxMiles ? best : null
}
