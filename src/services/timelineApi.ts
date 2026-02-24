// ── Hardcoded Major Space Events of 2025 ──
// Sources: NASA, NOAA, ESA, Space.com, planetary.org, timeanddate.com

export interface TimelineEvent {
    id: string
    date: string
    title: string
    type: 'solar_flare' | 'cme' | 'geomagnetic_storm' | 'asteroid' | 'eclipse' | 'meteor_shower' | 'mission' | 'conjunction'
    summary: string
    details: string
    severity: 'low' | 'moderate' | 'high' | 'extreme'
    source: string
    link?: string
}

const EVENTS_2025: TimelineEvent[] = [
    // ── JANUARY ──
    {
        id: 'jan-01',
        date: '2025-01-01',
        title: 'G4 Severe Geomagnetic Storm',
        type: 'geomagnetic_storm',
        summary: 'A G4 severe geomagnetic storm alert was issued as Earth received impacts from CMEs that erupted on December 29, 2024. Auroras were visible as far south as the central United States.',
        details: 'Storm Level: G4 (Severe)\nKp Index: 8\nCause: Multiple coronal mass ejections from December 29, 2024\nAurora Visibility: Southern Canada, northern & central US, northern Europe\nImpacts: Minor GPS disruptions reported, HF radio blackouts at high latitudes\nDuration: Approximately 12 hours of severe conditions\n\nThis storm rang in the new year with spectacular aurora displays across North America and Europe.',
        severity: 'extreme',
        source: 'NOAA Space Weather Prediction Center',
        link: 'https://www.spaceweather.gov',
    },
    {
        id: 'jan-02',
        date: '2025-01-03',
        title: 'Quadrantids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Quadrantids peaked on the night of January 3–4, producing up to 40 meteors per hour. Known for bright fireballs, this shower originates from asteroid 2003 EH1.',
        details: 'Peak Rate: ~40 meteors/hour (ZHR up to 120)\nBest Viewing: After midnight, looking northeast\nMoon Phase: Waxing crescent (minimal interference)\nParent Body: Asteroid 2003 EH1\nRadiant: Constellation Boötes\n\nThe Quadrantids have a very narrow peak window of about 6 hours, making timing crucial. The 2025 shower was favorable with a thin crescent moon setting early.',
        severity: 'moderate',
        source: 'American Meteor Society',
        link: 'https://www.amsmeteors.org',
    },
    {
        id: 'jan-03',
        date: '2025-01-10',
        title: 'Venus at Greatest Eastern Elongation',
        type: 'conjunction',
        summary: 'Venus reached its greatest eastern elongation of 47.2° from the Sun, making it brilliantly visible as the "Evening Star" in the western sky after sunset.',
        details: 'Elongation: 47.2° east of the Sun\nMagnitude: -4.3 (extremely bright)\nBest Viewing: Western sky, 1–2 hours after sunset\nDuration of good visibility: Several weeks\n\nVenus dominated the evening sky throughout January, setting more than 3 hours after sunset at peak elongation. It was the brightest object in the night sky after the Moon.',
        severity: 'low',
        source: 'Sky & Telescope',
    },

    // ── FEBRUARY ──
    {
        id: 'feb-01',
        date: '2025-02-12',
        title: 'Mars at Opposition',
        type: 'conjunction',
        summary: 'Mars reached opposition — directly opposite the Sun from Earth — making it the closest and brightest it would be all year. The Red Planet shone at magnitude -1.4.',
        details: 'Distance from Earth: ~96 million km\nMagnitude: -1.4\nConstellation: Cancer/Leo border\nDisc Diameter: 14.5 arcseconds\nBest Viewing: All night, highest around midnight\n\nOpposition occurs when Earth passes between Mars and the Sun. Mars appeared as a bright reddish-orange "star" visible all night long. Telescopes could resolve surface features including the polar ice caps.',
        severity: 'low',
        source: 'NASA Solar System Exploration',
        link: 'https://solarsystem.nasa.gov',
    },

    // ── MARCH ──
    {
        id: 'mar-01',
        date: '2025-03-09',
        title: 'NASA SPHEREx & PUNCH Missions Launch',
        type: 'mission',
        summary: 'NASA launched the SPHEREx space telescope and PUNCH solar observatory together on a SpaceX Falcon 9 rocket. SPHEREx will map the entire sky in near-infrared light.',
        details: 'Launch Vehicle: SpaceX Falcon 9\nSPHEREx: Spectro-Photometer for the History of the Universe, Epoch of Reionization, and Ices Explorer\n  - Maps entire sky in 96 near-infrared color bands\n  - Will catalog over 300 million galaxies\n  - Studies water ice in stellar nurseries\nPUNCH: Polarimeter to Unify the Corona and Heliosphere\n  - 4 small satellites studying the Sun\'s corona\n  - Tracks how solar wind forms and evolves\n  - Bridges gap between solar and heliospheric observations\n\nBoth missions launched from Vandenberg Space Force Base, California.',
        severity: 'moderate',
        source: 'NASA',
        link: 'https://www.nasa.gov/mission/spherex/',
    },
    {
        id: 'mar-02',
        date: '2025-03-14',
        title: 'Total Lunar Eclipse',
        type: 'eclipse',
        summary: 'A total lunar eclipse turned the Moon a deep blood-red color, visible across North America, South America, western Europe, and western Africa. Totality lasted 65 minutes.',
        details: 'Type: Total Lunar Eclipse\nTotality Duration: ~65 minutes\nPenumbral Duration: ~5 hours 10 minutes\nMoon enters Penumbra: 03:57 UTC\nTotality Begins: 06:26 UTC\nMaximum Eclipse: 06:58 UTC\nTotality Ends: 07:31 UTC\n\nVisibility: Entire eclipse visible from most of North America, Central America, and South America. Beginning stages visible from western Europe and western Africa.\n\nThe Moon took on a dramatic coppery-red hue during totality as it passed through Earth\'s shadow.',
        severity: 'moderate',
        source: 'NASA Eclipse',
        link: 'https://eclipse.gsfc.nasa.gov',
    },
    {
        id: 'mar-03',
        date: '2025-03-14',
        title: 'SpaceX Crew-10 Launch to ISS',
        type: 'mission',
        summary: 'SpaceX Crew-10 launched 4 astronauts to the International Space Station aboard a Crew Dragon spacecraft on a Falcon 9 rocket, beginning a long-duration science mission.',
        details: 'Mission: SpaceX Crew-10\nLaunch Vehicle: Falcon 9 / Crew Dragon\nCrew: 4 astronauts (NASA & international partners)\nDestination: International Space Station\nDocking: March 15, 2025\nMission Duration: ~6 months\n\nThe crew conducted hundreds of science experiments in microgravity environments, including research in biology, materials science, and Earth observation.',
        severity: 'moderate',
        source: 'NASA',
        link: 'https://www.nasa.gov/humans-in-space/commercial-space/',
    },
    {
        id: 'mar-04',
        date: '2025-03-29',
        title: 'Partial Solar Eclipse',
        type: 'eclipse',
        summary: 'A partial solar eclipse was visible from parts of North America. The Moon covered up to 55% of the Sun\'s disc depending on location.',
        details: 'Type: Partial Solar Eclipse\nMaximum Coverage: ~55% (from northeastern North America)\nBegins: 14:50 UTC\nMaximum: 16:48 UTC\nEnds: 18:42 UTC\n\nVisibility: Eastern and central North America, Greenland, Iceland\nNote: Only a partial eclipse — the Moon did not completely cover the Sun\n\nSpecial viewing glasses were required for safe observation.',
        severity: 'moderate',
        source: 'NASA Eclipse',
        link: 'https://eclipse.gsfc.nasa.gov',
    },

    // ── APRIL ──
    {
        id: 'apr-01',
        date: '2025-04-01',
        title: 'Fram2: First Polar Orbit Crewed Mission',
        type: 'mission',
        summary: 'The Fram2 mission launched 4 civilian astronauts into a polar retrograde orbit aboard a SpaceX Dragon — the first-ever crewed spaceflight to reach a polar orbit.',
        details: 'Mission: Fram2\nOrbit Type: Polar retrograde (first crewed mission to this orbit)\nCrew: 4 civilian passengers\nLaunch Vehicle: SpaceX Falcon 9 / Crew Dragon\nDuration: Multi-day orbital mission\n\nThis historic mission achieved the first crewed polar orbit, flying over Earth\'s poles and providing unprecedented views of the polar regions. Named after Fridtjof Nansen\'s exploration vessel.',
        severity: 'high',
        source: 'SpaceX / Fram2',
    },
    {
        id: 'apr-02',
        date: '2025-04-20',
        title: 'NASA Lucy Asteroid Flyby',
        type: 'asteroid',
        summary: 'NASA\'s Lucy spacecraft flew by asteroid 52246 Donaldjohanson in the main asteroid belt, serving as a critical test before its encounters with Jupiter\'s Trojan asteroids.',
        details: 'Spacecraft: NASA Lucy\nTarget: Asteroid 52246 Donaldjohanson\nLocation: Main asteroid belt\nPurpose: Engineering test and science observations before Trojan asteroid encounters\n\nLucy\'s 12-year mission will eventually visit 8 asteroids — more than any previous mission. The Donaldjohanson flyby validated the spacecraft\'s instruments and tracking systems. Named after the famous hominid fossil, Lucy explores the "fossils" of the early solar system.',
        severity: 'moderate',
        source: 'NASA',
        link: 'https://www.nasa.gov/mission/lucy/',
    },
    {
        id: 'apr-03',
        date: '2025-04-22',
        title: 'Lyrids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Lyrids meteor shower peaked on April 22–23, producing 15–20 meteors per hour. This ancient shower has been observed for over 2,700 years.',
        details: 'Peak Rate: 15–20 meteors/hour\nBest Viewing: After midnight, looking northeast\nMoon Phase: Waning crescent (good conditions)\nParent Comet: C/1861 G1 (Thatcher)\nRadiant: Near Vega in constellation Lyra\n\nThe Lyrids are one of the oldest recorded meteor showers, with Chinese observations dating back to 687 BCE. Occasional surges can produce up to 100 meteors per hour.',
        severity: 'low',
        source: 'American Meteor Society',
    },

    // ── MAY ──
    {
        id: 'may-01',
        date: '2025-05-05',
        title: 'Eta Aquariids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Eta Aquariids peaked on May 4–5, producing up to 50 meteors per hour. These fast-moving meteors originate from debris left by Halley\'s Comet.',
        details: 'Peak Rate: 40–50 meteors/hour (higher in Southern Hemisphere)\nSpeed: ~66 km/s (among the fastest meteors)\nParent Comet: 1P/Halley (Halley\'s Comet)\nRadiant: Constellation Aquarius\nBest Viewing: Pre-dawn hours, looking east\n\nThe Eta Aquariids are one of two meteor showers produced by Halley\'s Comet (the other being the Orionids in October). Known for long, persistent trains visible for several seconds.',
        severity: 'low',
        source: 'American Meteor Society',
    },
    {
        id: 'may-02',
        date: '2025-05-28',
        title: 'China Tianwen-2 Asteroid Mission Launch',
        type: 'mission',
        summary: 'China launched the Tianwen-2 mission to visit near-Earth asteroid Kamo\'oalewa, a quasi-satellite of Earth. The mission will collect samples and return them to Earth.',
        details: 'Mission: Tianwen-2\nTarget: Asteroid 469219 Kamo\'oalewa\n  - A quasi-satellite of Earth (~40–100m diameter)\n  - Orbits the Sun but stays relatively close to Earth\n  - May be a fragment of the Moon\nObjective: Sample collection and return\nExpected arrival at asteroid: Mid-2026\nSample return to Earth: ~2027\n\nIf Kamo\'oalewa is confirmed to be lunar debris, it would be the first known natural object to have been ejected from the Moon and captured in a quasi-satellite orbit.',
        severity: 'high',
        source: 'CNSA / Planetary Society',
        link: 'https://www.planetary.org',
    },

    // ── JUNE ──
    {
        id: 'jun-01',
        date: '2025-06-21',
        title: 'June Solstice & Saturn at Its Best',
        type: 'conjunction',
        summary: 'The June solstice marked the longest day in the Northern Hemisphere. Saturn began its prime viewing season, rising before midnight with its spectacular ring system on display.',
        details: 'June Solstice: June 21, 2025 at 02:42 UTC\nNorthern Hemisphere: Longest day / shortest night\nSouthern Hemisphere: Shortest day / longest night\n\nSaturn Viewing: Saturn was climbing into prime evening observing position. Through a telescope, the ring system was visible tilted at about 2°, appearing nearly edge-on — the thinnest they\'ve appeared since 2009. Saturn\'s rings are approaching edge-on alignment in 2025.',
        severity: 'low',
        source: 'Sky & Telescope',
    },
    {
        id: 'jun-02',
        date: '2025-06-25',
        title: 'Axiom Mission 4 to ISS',
        type: 'mission',
        summary: 'Axiom Space\'s fourth private astronaut mission launched to the International Space Station, conducting commercial research and technology demonstrations in microgravity.',
        details: 'Mission: Axiom Mission 4 (Ax-4)\nLaunch Vehicle: SpaceX Falcon 9 / Crew Dragon\nDestination: International Space Station\nDocking: June 26, 2025\nMission Type: Private astronaut mission\n\nThe crew conducted commercial research experiments, technology demonstrations, and educational outreach activities during their stay aboard the ISS. Axiom Space is building the first commercial space station module.',
        severity: 'moderate',
        source: 'NASA / Axiom Space',
        link: 'https://www.axiomspace.com',
    },

    // ── JULY ──
    {
        id: 'jul-01',
        date: '2025-07-22',
        title: 'NASA TRACERS Mission Launch',
        type: 'mission',
        summary: 'NASA launched the TRACERS twin-satellite mission on a SpaceX Falcon 9 to study how Earth\'s magnetic field interacts with solar wind at the polar cusps.',
        details: 'Mission: TRACERS (Tandem Reconnection and Cusp Electrodynamics Reconnaissance Satellites)\nLaunch Vehicle: SpaceX Falcon 9\nConfiguration: Two identical small satellites\nOrbit: Highly elliptical polar orbit\nTarget Region: Earth\'s polar magnetic cusps\n\nTRACERS studies magnetic reconnection — the explosive process where magnetic field lines break and reconnect — at Earth\'s cusps, where solar wind has direct access to Earth\'s magnetosphere. This helps scientists understand space weather and its effects on technology.',
        severity: 'moderate',
        source: 'NASA',
        link: 'https://www.nasa.gov',
    },
    {
        id: 'jul-02',
        date: '2025-07-28',
        title: 'Delta Aquariids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Delta Aquariids peaked on July 28–29, producing up to 20 meteors per hour. A thin crescent moon made for excellent viewing conditions.',
        details: 'Peak Rate: ~20 meteors/hour\nBest Viewing: After midnight, looking south\nMoon Phase: Waxing crescent (sets early → dark skies)\nRadiant: Constellation Aquarius\nSpeed: ~41 km/s\n\nThe Delta Aquariids are best seen from southern tropical latitudes. In 2025, the thin crescent moon set early, providing nearly perfect dark-sky conditions for observation.',
        severity: 'low',
        source: 'American Meteor Society',
    },
    {
        id: 'jul-03',
        date: '2025-07-30',
        title: 'NASA-ISRO NISAR Satellite Launch',
        type: 'mission',
        summary: 'The joint NASA-ISRO NISAR Earth observation satellite launched from India, carrying the most advanced radar system ever sent to orbit for studying Earth\'s surface changes.',
        details: 'Mission: NISAR (NASA-ISRO Synthetic Aperture Radar)\nLaunch Site: Satish Dhawan Space Centre, India\nJoint Mission: NASA (USA) + ISRO (India)\nInstruments: L-band SAR (NASA) + S-band SAR (ISRO)\nOrbit: Sun-synchronous, ~747 km altitude\n\nNISAR will map Earth\'s entire surface every 12 days, tracking:\n- Earthquakes and volcanic activity\n- Glacier and ice sheet movement\n- Deforestation and agricultural changes\n- Ground subsidence in cities\n- Coastal erosion\n\nThe $1.5 billion satellite is the most expensive Earth-observing satellite ever built.',
        severity: 'high',
        source: 'NASA / ISRO',
        link: 'https://nisar.jpl.nasa.gov',
    },
    {
        id: 'jul-04',
        date: '2025-07-31',
        title: 'SpaceX Crew-11 Launch to ISS',
        type: 'mission',
        summary: 'NASA\'s SpaceX Crew-11 mission launched 4 astronauts to the International Space Station for a long-duration science expedition.',
        details: 'Mission: SpaceX Crew-11\nLaunch Vehicle: Falcon 9 / Crew Dragon\nCrew: 4 astronauts\nDestination: International Space Station\nMission Duration: ~6 months\n\nCrew-11 continued the tradition of rotating crews aboard the ISS, conducting experiments in microgravity biology, materials science, fluid physics, and Earth observation.',
        severity: 'moderate',
        source: 'NASA',
        link: 'https://www.nasa.gov/humans-in-space/',
    },

    // ── AUGUST ──
    {
        id: 'aug-01',
        date: '2025-08-12',
        title: 'Perseids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Perseids — one of the year\'s most anticipated meteor showers — peaked on August 12–13, producing up to 100 meteors per hour. However, a waning gibbous moon hindered visibility.',
        details: 'Peak Rate: 50–100 meteors/hour (ZHR)\nSpeed: 59 km/s\nParent Comet: 109P/Swift-Tuttle\nRadiant: Constellation Perseus\nBest Viewing: After midnight, all directions\nMoon Phase: Waning gibbous (significant moonlight interference)\n\nThe Perseids are famous for producing bright fireballs and are typically the most popular meteor shower of the year. In 2025, a bright Moon reduced visible rates to about 30–40 per hour, but fireballs were still prominent.',
        severity: 'moderate',
        source: 'American Meteor Society',
        link: 'https://www.amsmeteors.org',
    },

    // ── SEPTEMBER ──
    {
        id: 'sep-01',
        date: '2025-09-01',
        title: 'Aurora Visible Across 18 US States',
        type: 'geomagnetic_storm',
        summary: 'A powerful coronal mass ejection impacted Earth\'s magnetic field, triggering aurora displays visible across 18 US states as far south as Colorado and Virginia.',
        details: 'Storm Level: G3 (Strong)\nKp Index: 7\nCause: Earth-directed coronal mass ejection\nAurora Visibility: 18+ US states including Washington, Montana, Michigan, New York, Wisconsin, Minnesota, and parts of Colorado and Virginia\n\nThe event produced vivid green, purple, and red aurora curtains. Social media was flooded with aurora photographs from locations that rarely see the Northern Lights.',
        severity: 'high',
        source: 'NOAA / CBS News',
        link: 'https://www.spaceweather.gov',
    },
    {
        id: 'sep-02',
        date: '2025-09-07',
        title: 'Total Lunar Eclipse',
        type: 'eclipse',
        summary: 'The second total lunar eclipse of 2025 was visible from Asia, Australia, eastern Africa, and the Pacific. The Moon turned a deep red during totality.',
        details: 'Type: Total Lunar Eclipse\nTotality Duration: ~82 minutes\nMaximum Eclipse: 18:12 UTC\n\nVisibility: Most of Asia, Russia, Australia, eastern Africa, Pacific region\nNot visible from: Americas, western Europe\n\nThis was the second of two total lunar eclipses in 2025. The longer totality (82 minutes vs 65 in March) allowed extended observation of the blood-red Moon.',
        severity: 'moderate',
        source: 'NASA Eclipse',
        link: 'https://eclipse.gsfc.nasa.gov',
    },
    {
        id: 'sep-03',
        date: '2025-09-18',
        title: 'Asteroid 2025 FA22 Close Approach',
        type: 'asteroid',
        summary: 'A skyscraper-sized asteroid (2025 FA22) passed within 835,000 km of Earth — about 2.2 times the Moon\'s distance. Initially flagged for a slim 2089 impact chance.',
        details: 'Asteroid: 2025 FA22\nSize: ~100–200 meters (skyscraper-sized)\nClosest Distance: ~835,000 km (2.2 lunar distances)\nRelative Velocity: ~30,000 km/h\nFuture Risk: Initially assessed for slim 2089 impact probability\nCurrent Status: No longer considered a threat after refined orbit calculations\n\nThe asteroid was large enough to cause regional devastation had it hit Earth. Refined tracking by NASA\'s Planetary Defense Coordination Office confirmed it poses no near-term threat.',
        severity: 'extreme',
        source: 'NASA Planetary Defense / Newsweek',
        link: 'https://www.nasa.gov/planetary-defense/',
    },
    {
        id: 'sep-04',
        date: '2025-09-21',
        title: 'Partial Solar Eclipse (South Pacific)',
        type: 'eclipse',
        summary: 'A partial solar eclipse was visible from New Zealand, Antarctica, and the south Pacific Ocean. The Moon covered up to 78% of the Sun from southern New Zealand.',
        details: 'Type: Partial Solar Eclipse\nMaximum Coverage: ~78% (from southern New Zealand)\nVisibility: New Zealand, Antarctica, south Pacific Ocean\nNot visible from: Northern Hemisphere\n\nThis was the fourth and final eclipse of 2025. While limited in geographic coverage, observers in New Zealand experienced a dramatic dimming of daylight during maximum coverage.',
        severity: 'low',
        source: 'NASA Eclipse',
        link: 'https://eclipse.gsfc.nasa.gov',
    },

    // ── OCTOBER ──
    {
        id: 'oct-01',
        date: '2025-10-07',
        title: 'Draconids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Draconids peaked on October 7, producing about 10 meteors per hour. Unusually, this shower is best viewed in the early evening rather than after midnight.',
        details: 'Peak Rate: ~10 meteors/hour\nBest Viewing: Early evening (unusual!)\nSpeed: 20 km/s (slow-moving meteors)\nParent Comet: 21P/Giacobini-Zinner\nRadiant: Constellation Draco\n\nThe Draconids are normally minor but can occasionally produce outbursts of thousands of meteors per hour. Their slow speed makes them easy to spot as they drift across the sky.',
        severity: 'low',
        source: 'American Meteor Society',
    },
    {
        id: 'oct-02',
        date: '2025-10-15',
        title: 'Asteroid 2025 TP5 Close Flyby',
        type: 'asteroid',
        summary: 'Small asteroid 2025 TP5 made a remarkably close flyby of Earth, passing at only about a quarter of the distance to the Moon.',
        details: 'Asteroid: 2025 TP5\nSize: Small (estimated 5–15 meters)\nClosest Distance: ~96,000 km (0.25 lunar distances)\nDiscovery: Detected shortly before close approach\n\nWhile too small to pose a serious threat (it would burn up in the atmosphere), the close flyby highlighted the ongoing need for improved near-Earth object detection. The asteroid passed within typical geostationary satellite orbits.',
        severity: 'high',
        source: 'Space.com / NASA',
        link: 'https://www.space.com',
    },
    {
        id: 'oct-03',
        date: '2025-10-21',
        title: 'Orionids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Orionids peaked on October 21–22, producing up to 20 meteors per hour with no moonlight interference — one of the best meteor shower viewings of the year.',
        details: 'Peak Rate: ~20 meteors/hour\nBest Viewing: After midnight, looking south/southeast\nMoon Phase: New moon (excellent dark-sky conditions!)\nParent Comet: 1P/Halley (Halley\'s Comet)\nRadiant: Constellation Orion\nSpeed: 66 km/s (very fast)\n\nThe Orionids are the second shower from Halley\'s Comet (the other being the Eta Aquariids in May). 2025 was a particularly excellent year for viewing with zero moonlight interference and clear predictions.',
        severity: 'moderate',
        source: 'American Meteor Society',
    },

    // ── NOVEMBER ──
    {
        id: 'nov-01',
        date: '2025-11-05',
        title: 'Southern Taurids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Southern Taurids peaked on November 4–5: a slow, long-running shower known for exceptionally bright fireballs despite low hourly rates.',
        details: 'Peak Rate: ~5–10 meteors/hour\nSpeed: 27 km/s (very slow)\nParent Comet: 2P/Encke\nRadiant: Constellation Taurus\nFireball Watch: Active October 20 – December 10\n\nWhat the Taurids lack in quantity they make up for in quality — they\'re famous for producing Earth-grazing fireballs. The 2025 Taurid season produced several bright fireballs that were widely reported.',
        severity: 'low',
        source: 'American Meteor Society',
    },
    {
        id: 'nov-02',
        date: '2025-11-11',
        title: 'X5.1 Solar Flare — Strongest of 2025',
        type: 'solar_flare',
        summary: 'An intense X5.1-class solar flare erupted — the strongest of 2025 — causing widespread HF radio blackouts and launching a massive coronal mass ejection toward Earth.',
        details: 'Flare Class: X5.1 (Extreme)\nPeak Time: November 11, 2025\nActive Region: Sunspot group on solar disk center\nRadio Blackout: R3 (Strong) — widespread HF radio blackout on sunlit side of Earth\nAssociated CME: Yes — Earth-directed, estimated arrival November 13\n\nThis was the most powerful solar flare of 2025 and among the strongest of Solar Cycle 25. It disrupted HF radio communications used by aviation and maritime industries across the Atlantic and Pacific. A G4 severe geomagnetic storm watch was issued for November 12–13.',
        severity: 'extreme',
        source: 'NOAA SWPC / ESA',
        link: 'https://www.spaceweather.gov',
    },
    {
        id: 'nov-03',
        date: '2025-11-13',
        title: 'G3–G4 Geomagnetic Storm & Widespread Aurora',
        type: 'geomagnetic_storm',
        summary: 'The CME from the X5.1 flare arrived at Earth, triggering a strong G3–G4 geomagnetic storm with aurora visible across much of Europe and the northern United States.',
        details: 'Storm Level: G3 (Strong) reaching G4 (Severe) periods\nKp Index: 7–8\nCause: CME from X5.1 solar flare on November 11\nAurora Visibility: Northern Europe, UK, Scandinavia, Canada, northern USA (as far south as Nebraska and Iowa)\n\nImpacts:\n- GPS accuracy degraded by several meters\n- HF radio disruptions continued\n- Satellite drag increased in low-Earth orbit\n- Power grid operators in Canada and Scandinavia issued alerts\n\nThe storm produced vivid aurora displays that were photographed and shared widely across social media.',
        severity: 'extreme',
        source: 'NOAA SWPC / ESA',
        link: 'https://www.spaceweather.gov',
    },
    {
        id: 'nov-04',
        date: '2025-11-17',
        title: 'Leonids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Leonids peaked on November 17, producing 10–15 meteors per hour. Known for producing meteor storms roughly every 33 years (last in 1999/2001).',
        details: 'Peak Rate: 10–15 meteors/hour\nSpeed: 71 km/s (the fastest of all annual showers!)\nParent Comet: 55P/Tempel-Tuttle\nRadiant: Constellation Leo\nBest Viewing: After midnight\n\nThe Leonids are famous for historic meteor storms producing thousands of meteors per hour. While 2025 was a normal year, the Leonids\' extreme speed (71 km/s) means they produce brilliant, fast streaks and frequent persistent trains.',
        severity: 'low',
        source: 'American Meteor Society',
    },

    // ── DECEMBER ──
    {
        id: 'dec-01',
        date: '2025-12-07',
        title: 'G3 Geomagnetic Storm Watch — M8.1 Flare CME',
        type: 'geomagnetic_storm',
        summary: 'NOAA issued a G3 strong geomagnetic storm watch for December 7–9 after an M8.1 solar flare produced a full-halo CME directed at Earth.',
        details: 'Flare Class: M8.1\nStorm Watch: G3 (Strong) for December 7–9\nCME Type: Full-halo (Earth-directed)\nExpected Kp Index: 6–7\n\nA full-halo CME appears as an expanding ring around the Sun in coronagraph imagery, indicating the material is headed directly toward Earth. Aurora alerts were issued for northern US states, UK, Scandinavia, and southern Canada.\n\nNote: Some reports indicated the CME may have missed or had weaker-than-expected impact.',
        severity: 'high',
        source: 'NOAA SWPC / Forbes',
        link: 'https://www.spaceweather.gov',
    },
    {
        id: 'dec-02',
        date: '2025-12-13',
        title: 'Geminids Meteor Shower Peak',
        type: 'meteor_shower',
        summary: 'The Geminids — widely considered the best meteor shower of the year — peaked on December 13–14 with up to 120 meteors per hour. A thin crescent moon offered perfect conditions.',
        details: 'Peak Rate: 100–120 meteors/hour (ZHR up to 150)\nSpeed: 35 km/s (moderate)\nParent Body: Asteroid 3200 Phaethon (unusual — most showers come from comets)\nRadiant: Constellation Gemini\nBest Viewing: All night, peaks around 2:00 AM local time\nMoon Phase: Waning crescent (excellent dark-sky conditions!)\n\nThe 2025 Geminids were exceptional: peak rates exceeded 100/hour, the thin crescent moon didn\'t rise until pre-dawn, and the shower produced an abundance of bright, multi-colored meteors. Many observers reported it as the best Geminids display in recent years.',
        severity: 'high',
        source: 'American Meteor Society',
        link: 'https://www.amsmeteors.org',
    },
    {
        id: 'dec-03',
        date: '2025-12-21',
        title: 'December Solstice & Ursids Meteor Shower',
        type: 'meteor_shower',
        summary: 'The December solstice (longest night in the Northern Hemisphere) coincided with the Ursids meteor shower peak, producing 5–10 meteors per hour under a thin crescent moon.',
        details: 'December Solstice: December 21, 2025 at 15:03 UTC\nNorthern Hemisphere: Shortest day / longest night\n\nUrsids Meteor Shower:\nPeak Rate: 5–10 meteors/hour\nParent Comet: 8P/Tuttle\nRadiant: Near Polaris (constellation Ursa Minor)\nMoon Phase: Thin crescent (minimal interference)\n\nThe combination of the year\'s longest night and clear, dark skies made for pleasant final stargazing of 2025.',
        severity: 'low',
        source: 'American Meteor Society',
    },
]

// ── Export ──

export function fetch2025TimelineEvents(): TimelineEvent[] {
    return EVENTS_2025
}

// Keep backward compatibility
export function fetch2024TimelineEvents(): Promise<TimelineEvent[]> {
    return Promise.resolve(EVENTS_2025)
}
